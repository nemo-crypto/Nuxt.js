<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"
import Input from "@/components/ui/Input.vue"
import Popover from "@/components/ui/Popover.vue"
import Checkbox from "@/components/ui/Checkbox.vue"
import AmountInCurrency from "@/components/AmountInCurrency.vue"

/** Shared Components */
import MessageTypeBadge from "@/components/shared/MessageTypeBadge.vue"

/** Services */
import { comma, space, splitAddress } from "@/services/utils"
import { MsgTypes } from "@/services/constants/messages"

/** API */
import { fetchTransactions } from "@/services/api/tx"

useExplorerSeo({
	title: () => "Transactions - Nubit Explorer",
	description: () => "Transactions in the Nubit Blockchain. Hash, messages, timestamp, block height, gas usage, events count are shown.",
	image: "/img/seo/txs.png",
})

const route = useRoute()
const router = useRouter()

/** Filters */
const filters = reactive({
	status: {
		success: false,
		failed: false,
	},
	message_type: MsgTypes.reduce((a, b) => ({ ...a, [b]: false }), {}),
})
const savedFiltersBeforeChanges = ref(null)

const searchTerm = ref("")

/** Parse route query */
Object.keys(filters).forEach((key) => {
	const raw = route.query[key]
	const values = (Array.isArray(raw) ? raw : [raw]).filter((value) => typeof value === "string")
	for (const item of values.flatMap((value) => value.split(","))) {
		if (Object.hasOwn(filters[key], item)) filters[key][item] = true
	}
})

const updateRouteQuery = () => {
	router.replace({
		query: {
			status:
				Object.keys(filters.status).find((f) => filters.status[f]) &&
				Object.keys(filters.status)
					.filter((f) => filters.status[f])
					.join(","),
			message_type:
				Object.keys(filters.message_type).find((f) => filters.message_type[f]) &&
				Object.keys(filters.message_type)
					.filter((f) => filters.message_type[f])
					.join(","),
		},
	})
}

const isStatusPopoverOpen = ref(false)
const handleOpenStatusPopover = () => {
	isStatusPopoverOpen.value = true

	if (Object.keys(filters.status).find((f) => filters.status[f])) {
		savedFiltersBeforeChanges.value = { ...filters.status }
	}
}
const onStatusPopoverClose = () => {
	isStatusPopoverOpen.value = false

	if (savedFiltersBeforeChanges.value) {
		filters.status = savedFiltersBeforeChanges.value
		savedFiltersBeforeChanges.value = null
	} else {
		resetFilters("status")
	}
}
const handleApplyStatusFilters = () => {
	savedFiltersBeforeChanges.value = null
	isStatusPopoverOpen.value = false

	page.value = 1

	getTransactions()

	updateRouteQuery()
}

const isMessageTypePopoverOpen = ref(false)
const handleOpenMessageTypePopover = () => {
	isMessageTypePopoverOpen.value = true

	if (Object.keys(filters.message_type).find((f) => filters.message_type[f])) {
		savedFiltersBeforeChanges.value = { ...filters.message_type }
	}
}
const onMessageTypePopoverClose = () => {
	isMessageTypePopoverOpen.value = false

	searchTerm.value = ""

	if (savedFiltersBeforeChanges.value) {
		filters.message_type = savedFiltersBeforeChanges.value
		savedFiltersBeforeChanges.value = null
	} else {
		resetFilters("message_type")
	}
}
const handleApplyMessageTypeFilters = () => {
	savedFiltersBeforeChanges.value = null
	isMessageTypePopoverOpen.value = false

	page.value = 1

	getTransactions()

	updateRouteQuery()
}

const resetFilters = (target, refetch) => {
	Object.keys(filters[target]).forEach((f) => {
		filters[target][f] = false
	})

	if (refetch) {
		page.value = 1

		updateRouteQuery()

		getTransactions()
	}
}

/**
 * Table Config
 */
const config = reactive({
	columns: {
		time: true,
		messages: true,
		signer: true,
		block: true,
		fee: true,
		events: false,
	},
})
watch(
	() => config,
	() => {
		localStorage.setItem("page:transactions:config:columns", JSON.stringify(config.columns))
	},
	{
		deep: true,
	},
)

const isConfigurePopoverOpen = ref(false)

/** Data */
const isLoaded = ref(false)
const isRefetching = ref(false)
const transactions = ref([])

const sort = reactive({
	by: "time",
	dir: "desc",
})

const page = ref(route.query.page ? parseInt(route.query.page) : 1)
const pages = computed(() => Math.ceil(count.value / 20))

const findPFB = ref(false)

const getTransactions = async () => {
	isRefetching.value = true

	const { data } = await fetchTransactions({
		limit: 20,
		offset: (page.value - 1) * 20,
		sort: sort.dir,
		sort_by: sort.by,
		status:
			Object.keys(filters.status).find((f) => filters.status[f]) &&
			Object.keys(filters.status)
				.filter((f) => filters.status[f])
				.join(","),
		msg_type:
			Object.keys(filters.message_type).find((f) => filters.message_type[f]) &&
			Object.keys(filters.message_type)
				.filter((f) => filters.message_type[f])
				.join(","),
	})
	transactions.value = data.value

	isLoaded.value = true
	isRefetching.value = false
}

getTransactions()

onBeforeMount(() => {
	if (localStorage.getItem("page:transactions:config:columns")) {
		config.columns = JSON.parse(localStorage.getItem("page:transactions:config:columns"))
	}
})

/** Refetch transactions */
watch(
	() => page.value,
	async () => {
		getTransactions()

		router.replace({ query: { page: page.value } })
	},
)

watch(
	() => findPFB.value,
	() => {
		getTransactions()
	},
)

const handleSort = (by) => {
	/** temp. only for time */
	if (!["time"].includes(by)) return

	switch (sort.dir) {
		case "desc":
			if (sort.by == by) sort.dir = "asc"
			break

		case "asc":
			sort.dir = "desc"

			break
	}

	sort.by = by

	if (page.value !== 1) {
		page.value = 1
	}

	getTransactions()
}

const handlePrev = () => {
	if (page.value === 1) return

	page.value -= 1
}

const handleNext = () => {
	page.value += 1
}
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Breadcrumbs
			:items="[
				{ link: '/', name: 'Home' },
				{ link: '/txs', name: `Transactions` },
			]"
			:class="$style.breadcrumbs"
		/>

		<Flex wide direction="column" gap="0">
			<Flex justify="between" :class="$style.header">
				<Flex align="center" gap="8">
					<Text as="h1" size="20" weight="600" color="primary">Transactions</Text>
				</Flex>

				<Flex align="center" gap="6">
					<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
						<Icon name="arrow-left-stop" size="12" color="primary" />
					</Button>
					<Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
						<Icon name="arrow-left" size="12" color="primary" />
					</Button>

					<Button type="secondary" size="mini" disabled>
						<Text class="openSans_font" size="12" weight="600" color="primary">Page {{ comma(page) }} </Text>
					</Button>

					<Button @click="handleNext" type="secondary" size="mini" :disabled="!transactions.length">
						<Icon name="arrow-right" size="12" color="primary" />
					</Button>
				</Flex>
			</Flex>

			<Flex direction="column" gap="16" wide :class="[$style.table, isRefetching && $style.disabled]">
				<div v-if="transactions.length" :class="$style.table_scroller">
					<table>
						<thead>
							<tr>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Hash</Text></th>
								<th
									v-for="column in Object.keys(config.columns).filter((c) => config.columns[c])"
									@click="handleSort(column)"
									:key="column"
									:class="['time'].includes(column) && $style.sortable"
								>
									<Flex v-if="['time'].includes(column)" align="center" gap="6">
										<Text size="12" weight="600" color="tertiary" noWrap style="text-transform: capitalize">
											{{ column }}
										</Text>
										<Icon
											v-if="sort.by === column"
											name="chevron"
											size="12"
											color="secondary"
											:style="{ transform: `rotate(${sort.dir === 'asc' ? '180' : '0'}deg)` }"
										/>
									</Flex>
									<Text v-else size="12" weight="600" color="tertiary" noWrap style="text-transform: capitalize">
										{{ column }}
									</Text>
								</th>
							</tr>
						</thead>

						<tbody>
							<tr
								v-for="tx in transactions"
								:key="tx.hash"
								:class="findPFB && !tx.message_types.includes('MsgSubmitBlobPayment') && $style.hide"
							>
								<td style="width: 1px">
									<NuxtLink :to="`/tx/${tx.hash}`">
										<Tooltip :disabled="!tx.hash" position="start">
											<template v-if="tx.hash">
												<Flex align="center" gap="8">
													<img
														:class="$style.icon"
														width="14"
														height="14"
														:src="
															tx?.status === 'success'
																? '/img/tx-status-success.svg'
																: '/img/tx-status-fail.svg'
														"
													/>
													<Text class="rubik_font" size="13" weight="600" color="primary" mono>
														{{ tx.hash.slice(0, 4).toUpperCase() }}
													</Text>

													<Flex class="rubik_font" align="center" gap="3">
														<div v-for="dot in 3" :key="dot" class="dot" />
													</Flex>

													<Text class="rubik_font" size="13" weight="600" color="primary" mono>
														{{ tx.hash.slice(tx.hash.length - 4, tx.hash.length).toUpperCase() }}
													</Text>

													<CopyButton :text="tx.hash" />
												</Flex>
											</template>
											<template v-else>
												<Flex align="center" gap="8">
													<Icon name="tx" size="14" color="secondary" />
													<Text size="13" weight="600" color="primary">Genesis</Text>
												</Flex>
											</template>

											<template #content>
												<Flex direction="column" gap="6">
													<Flex align="center" gap="4">
														<Icon
															:name="tx.status === 'success' ? 'check-circle' : 'close-circle'"
															size="13"
															:color="tx.status === 'success' ? 'green' : 'red'"
														/>
														<Text size="13" weight="600" color="primary">
															{{ tx.status === "success" ? "Successful" : "Failed" }}
															Transaction
														</Text>
													</Flex>

													{{ space(tx.hash).toUpperCase() }}

													<Text height="120" color="tertiary" style="max-width: 400px" mono align="left">
														{{ tx.error }}
													</Text>
												</Flex>
											</template>
										</Tooltip>
									</NuxtLink>
								</td>
								<td v-if="config.columns.time" style="width: 1px">
									<NuxtLink :to="`/tx/${tx.hash}`">
										<Flex justify="center" direction="column" gap="4">
											<Text size="12" weight="600" color="primary">
												{{ DateTime.fromISO(tx.time).toRelative({ locale: "en", style: "short" }) }}
											</Text>
											<Text size="12" weight="500" color="tertiary">
												{{ DateTime.fromISO(tx.time).setLocale("en").toFormat("LLL d, t") }}
											</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td v-if="config.columns.messages" style="width: 1px">
									<NuxtLink :to="`/tx/${tx.hash}`">
										<Flex align="center">
											<MessageTypeBadge :types="tx.message_types" />
											<Text v-if="!(tx.message_types.length)" size="13" weight="600" color="tertiary">No Message Types</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td v-if="config.columns.signer" style="width: 1px">
									<NuxtLink :to="`/tx/${tx.hash}`">
										<Flex align="center">
											<Text size="13" weight="600" color="primary">
												{{ splitAddress(tx.signers[0]) }}
											</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td v-if="config.columns.block" style="width: 1px">
									<NuxtLink :to="`/tx/${tx.hash}`">
										<Flex align="center">
											<Outline @click.prevent="router.push(`/block/${tx.height}`)">
												<Flex align="center" gap="6">
													<Icon name="block" size="14" color="yellowNew" />

													<Text class="rubik_font" size="13" weight="600" color="yellowNew" tabular>
														{{ comma(tx.height) }}
													</Text>
												</Flex>
											</Outline>
										</Flex>
									</NuxtLink>
								</td>
								<td v-if="config.columns.fee" style="width: 1px">
									<NuxtLink :to="`/tx/${tx.hash}`">
										<Flex align="center">
											<AmountInCurrency
												class="openSans_font"
												:amount="{ value: tx.fee, decimal: 6 }"
												:styles="{ amount: { size: '13' } }"
											/>
										</Flex>
									</NuxtLink>
								</td>
								<td v-if="config.columns.events" style="width: 1px">
									<NuxtLink :to="`/tx/${tx.hash}`">
										<Flex align="center">
											<Text size="13" weight="600" color="primary">
												{{ tx.events_count }}
											</Text>
										</Flex>
									</NuxtLink>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<Flex v-else direction="column" gap="20" align="center" :class="$style.empty">
					<Icon name="search" size="24" color="support" />

					<Flex direction="column" gap="8" align="center">
						<Text size="13" weight="600" color="secondary"> Nothing was found </Text>
					</Flex>
				</Flex>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);

	padding: 40px 24px 60px 24px;
}

.breadcrumbs {
	margin-bottom: 16px;
}

.header {
	border-radius: 8px 8px 0 0;
	background: rgba(255, 255, 255, 0.1);
	padding: 20px 20px 0 20px;
}

.settingsContainer {
	background: rgba(255, 255, 255, 0.1);
	padding: 20px 20px 0 20px;
}

.settings {
	background: rgba(255, 255, 255, 0.05);
	padding: 10px 20px;
	border-radius: 8px;
}

.settingsBtn {
	height: 36px !important;
	background: rgba(247, 147, 26, 0.1) !important;
	border-radius: 4px 4px 4px 4px !important;
	border: 1px solid #f7931a !important;
}

.vertical_divider {
	min-width: 2px;
	height: 12px;
	background: var(--op-10);
}

.horizontal_divider {
	width: 100%;
	height: 1px;
	background: var(--op-5);
}

.message_types_list {
	height: 200px;

	overflow-y: auto;
	overflow-x: hidden;
}

.table_scroller {
	overflow-x: auto;
}

.table {
	border-radius: 0 0 8px 8px;
	background: rgba(255, 255, 255, 0.1);
	padding: 0 20px 0 20px;
	padding-bottom: 12px;

	transition: all 0.2s ease;

	& table {
		width: 100%;
		height: fit-content;

		border-spacing: 0px;

		& tbody {
			& tr {
				cursor: pointer;

				transition: all 0.05s ease;

				&:hover {
					background: var(--op-5);
				}

				&:active {
					background: var(--op-8);
				}
			}
		}

		& tr th {
			text-align: left;
			padding: 0;
			padding-right: 16px;
			padding-top: 16px;
			padding-bottom: 8px;

			& span {
				display: flex;
			}

			&:first-child {
				padding-left: 16px;
			}

			&.sortable {
				cursor: pointer;
			}
		}

		& tr td {
			padding: 0;

			white-space: nowrap;

			&:first-child {
				padding-left: 16px;
			}

			& > a {
				display: flex;

				min-height: 44px;

				padding-right: 24px;
			}
		}
	}
}

.empty {
	padding: 40px 0;
}

.hide {
	opacity: 0.5;
}

.table.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.badge {
	border-radius: 5px;
	background: var(--op-5);
	box-shadow: inset 0 0 0 1px var(--op-10);

	padding: 4px 6px;
}

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}

	.header {
		gap: 16px;

		height: initial;

		padding: 16px;
	}
}
</style>
