<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"
import Tooltip from "@/components/ui/Tooltip.vue"
import Button from "@/components/ui/Button.vue"
import Badge from "@/components/ui/Badge.vue"
import Popover from "@/components/ui/Popover.vue"
import Checkbox from "@/components/ui/Checkbox.vue"
import Input from "@/components/ui/Input.vue"
import AmountInCurrency from "@/components/AmountInCurrency.vue"

/** Shared Components */
import MessageTypeBadge from "@/components/shared/MessageTypeBadge.vue"
import Events from "@/components/shared/tables/Events.vue";

/** Services */
import { comma, formatBytes, reverseMapping, space, shortHex, tia } from "@/services/utils"

/** API */
import { fetchTransactionsByBlock } from "@/services/api/tx"

/** Store */
import { useAppStore } from "@/store/app"
import { useModalsStore } from "@/store/modals"
import { useCacheStore } from "@/store/cache"
import { useBookmarksStore } from "@/store/bookmarks"
import { useNotificationsStore } from "@/store/notifications"
const appStore = useAppStore()
const modalsStore = useModalsStore()
const cacheStore = useCacheStore()
const bookmarksStore = useBookmarksStore()
const notificationsStore = useNotificationsStore()

const route = useRoute()
const router = useRouter()

const props = defineProps({
	block: {
		type: Object,
		required: true,
	},
	transactions: {
		type: Array,
	},
})

const lastBlock = computed(() => appStore.latestBlocks[0])

const isBookmarkButtonHovered = ref(false)
const isBookmarked = ref(false)
const bookmarkText = computed(() => {
	if (isBookmarkButtonHovered.value && isBookmarked.value) return "Remove"
	return isBookmarked.value ? "Saved" : "Save"
})

const activeTab = ref("transactions")

const isLoading = ref(false)
const transactions = ref([])


const page = ref(1)
const pages = computed(() => 1)
const handleNext = () => {
	page.value += 1
}
const handlePrev = () => {
	if (page.value === 1) return
	page.value -= 1
}

/** Filters */
const filters = reactive({
	status: {
		success: false,
		failed: false,
	},
	message_type: props.block.message_types.sort().reduce((a, b) => ({ ...a, [b]: false }), {}),
})
const hasActiveFilters = computed(() => {
	let has = false

	Object.keys(filters.status).forEach((s) => {
		if (filters.status[s]) has = true
	})
	Object.keys(filters.message_type).forEach((t) => {
		if (filters.message_type[t]) has = true
	})

	return has
})
const savedFiltersBeforeChanges = ref(null)

const handleClearAllFilters = () => {
	Object.keys(filters.status).forEach((f) => {
		filters.status[f] = false
	})

	Object.keys(filters.message_type).forEach((f) => {
		filters.message_type[f] = false
	})

	router.replace({
		query: null,
	})

	getTransactions()
}

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

	getTransactions()

	updateRouteQuery()
}

const resetFilters = (target, refetch) => {
	Object.keys(filters[target]).forEach((f) => {
		filters[target][f] = false
	})

	if (refetch) {
		updateRouteQuery()

		getTransactions()
	}
}

const getTransactions = async () => {
	isLoading.value = true

	const { data } = await fetchTransactionsByBlock({
		height: props.block.height,
		from: parseInt(DateTime.fromISO(props.block.time) / 1000),
		limit: 10,
		offset: (page.value - 1) * 10,
		sort: "desc",
		status:
			Object.keys(filters.status).find((f) => filters.status[f]) &&
			Object.keys(filters.status)
				.filter((f) => filters.status[f])
				.join(","),
		type:
			Object.keys(filters.message_type).find((f) => filters.message_type[f]) &&
			Object.keys(filters.message_type)
				.filter((f) => filters.message_type[f])
				.join(","),
	})

	transactions.value = data.value
	cacheStore.current.transactions = transactions.value

	isLoading.value = false
}

await getTransactions()

onMounted(() => {
	isBookmarked.value = !!bookmarksStore.bookmarks.blocks.find((t) => t.id === props.block.height)
})

/** Refetch transactions */
watch(
	() => page.value,
	() => {
		if (activeTab.value === 'transactions') {
			getTransactions()
		}
	},
)

watch(
	() => activeTab.value,
	() => {
		page.value = 1

		getTransactions()
	},
)

const handleBookmark = () => {
	if (!isBookmarked.value) {
		bookmarksStore.bookmarks.blocks.push({
			id: props.block.height,
			type: "Block",
			ts: new Date().getTime(),
		})
		isBookmarked.value = true

		notificationsStore.create({
			notification: {
				type: "success",
				icon: "check",
				title: "Block added to bookmarks",
				description: "View all bookmarks on dedicated page",
				autoDestroy: true,
				actions: [
					{
						name: "Open Bookmarks",
						callback: () => {
							router.push("/bookmarks")
						},
					},
				],
			},
		})
	} else {
		const bookmarkIdx = bookmarksStore.bookmarks.blocks.findIndex((t) => t.id === props.block.height)
		bookmarksStore.bookmarks.blocks.splice(bookmarkIdx, 1)
		isBookmarked.value = false

		notificationsStore.create({
			notification: {
				type: "success",
				icon: "check",
				title: "Block removed from bookmarks",
				autoDestroy: true,
			},
		})
	}
}

const handleViewRawBlock = () => {
	cacheStore.current._target = "block"
	modalsStore.open("rawData")
}

const handleViewRawTransactions = () => {
	cacheStore.current._target = "transactions"
	modalsStore.open("rawData")
}
</script>

<template>
	<Flex direction="column" gap="0">
		<Flex align="center" justify="between" :class="$style.header">
			<Flex align="center" gap="12">
				<Flex align="center" gap="8">
					<!-- <Icon name="block" size="14" color="primary" /> -->
					<Text as="h1" size="20" weight="600" color="primary">Block {{ comma(block.height) }}</Text>
				</Flex>

				<Flex align="center" gap="8">
					<Button class="openSans_font" @click="router.push(`/block/${block.height - 1}`)" type="secondary" size="mini"
						:disabled="block.height === 1">
						<Icon name="arrow-redo-right" size="16" color="secondary" :style="{ transform: 'scaleX(-1)' }" />
						Prev
					</Button>

					<Button class="openSans_font" @click="router.push(`/block/${block.height + 1}`)" type="secondary" size="mini"
						:disabled="block.height === lastBlock?.height">
						Next
						<Icon name="arrow-redo-right" size="16" color="secondary" />
					</Button>
				</Flex>
			</Flex>

			<Flex align="center" gap="8">
				<Button class="openSans_font" @click="handleBookmark" @mouseenter="isBookmarkButtonHovered = true"
					@mouseleave="isBookmarkButtonHovered = false" type="secondary" size="mini">
					<Icon
						:name="isBookmarkButtonHovered && isBookmarked ? 'close' : isBookmarked ? 'bookmark-check' : 'bookmark-plus'"
						size="12" :color="isBookmarked && !isBookmarkButtonHovered ? 'yellowNew' : 'primary'" />
					{{ bookmarkText }}
				</Button>

				<!-- <Dropdown>
					<Button  class="openSans_font" type="secondary" size="mini">
						<Icon name="dots" size="16" color="primary" />
						More
					</Button>

					<template #popup>
						<DropdownItem class="openSans_font" @click="handleViewRawBlock"> View Raw Block </DropdownItem>
						<DropdownItem class="openSans_font" @click="handleViewRawTransactions"> View Raw Transactions </DropdownItem>
					</template>
				</Dropdown> -->
			</Flex>
		</Flex>

		<Flex gap="0" :class="$style.content">
			<Flex direction="column" :class="$style.data">
				<Flex wide direction="column" gap="12" :class="$style.top">
					<Flex align="center" justify="between" wide>
						<Flex align="center" gap="6">
							<Icon name="block" size="14" color="secondary" />

							<Flex align="center" gap="4">
								<Text size="12" weight="600" color="secondary"> Height </Text>
								<Text class="rubik_font" size="12" weight="600" color="yellowNew">{{ comma(block.height) }}</Text>
							</Flex>
						</Flex>

						<Text size="12" weight="600" color="tertiary">
							{{ DateTime.fromISO(block.time).setLocale("en").toFormat("ff") }}
						</Text>
					</Flex>

					<Badge>
						<Flex align="center" justify="between" wide>
							<Text class="ds_font" size="12" weight="600" color="secondary">
								{{
			DateTime.fromISO(block.time)
				.minus({ milliseconds: block.stats.block_time })
				.setLocale("en")
				.toFormat("TT")
		}}
							</Text>

							<div v-for="dot in 5" :key="dot" class="dot ds_font" />

							<Flex align="center" gap="6">
								<Icon name="time" size="12" color="secondary" />
								<Text class="ds_font" size="12" weight="600" color="primary"> {{ (block.stats.block_time /
			1000).toFixed(2) }}s
								</Text>
							</Flex>

							<div v-for="dot in 5" :key="dot" class="dot ds_font" />

							<Text class="ds_font" size="12" weight="600" color="secondary" align="right">
								{{ DateTime.fromISO(block.time).setLocale("en").toFormat("TT") }}</Text>
						</Flex>
					</Badge>
				</Flex>

				<Flex direction="column" gap="24" :class="$style.main">
					<Flex direction="column" gap="12">
						<Text size="12" weight="600" color="tertiary">Proposer</Text>

						<Flex direction="column" gap="8">
							<NuxtLink :to="`/validator/${block.proposer.id}`">
								<Text size="13" weight="600" color="primary">
									{{ block.proposer.moniker }}
								</Text>
							</NuxtLink>

							<Flex align="center" gap="6">
								<Text class="rubik_font" size="12" weight="600" color="tertiary">{{ shortHex(block.proposer.cons_address)
									}}</Text>

								<CopyButton :text="block.proposer.cons_address" size="14" />
							</Flex>
						</Flex>
					</Flex>

					<Flex v-if="block.hash" direction="column" gap="8" :class="$style.key_value">
						<Text size="12" weight="600" color="secondary">Hash</Text>

						<BadgeValue :text="block.hash" />
					</Flex>

					<Flex direction="column" gap="16">
						<Text size="12" weight="600" color="secondary">Details</Text>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="yellowNew" :class="$style.blockDetailsName"> Blobs Size</Text>
							<Text size="12" weight="600" color="secondary" :class="$style.blockDetailsValue"> {{ formatBytes(block.stats.blobs_size) }}
							</Text>
						</Flex>
						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="yellowNew" :class="$style.blockDetailsName"> Events</Text>
							<Text size="12" weight="600" color="secondary" :class="$style.blockDetailsValue"> {{ block.stats.events_count }} </Text>
						</Flex>
						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="yellowNew" :class="$style.blockDetailsName"> Transactions</Text>
							<Text size="12" weight="600" color="secondary" :class="$style.blockDetailsValue"> {{ block.stats.tx_count }} </Text>
						</Flex>
						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="yellowNew" :class="$style.blockDetailsName"> Total Fees </Text>
							<div :class="$style.blockDetailsValue">
								<AmountInCurrency :amount="{ value: block.stats.fee, decimal: 6 }"
								:styles="{ amount: { color: 'secondary' }, currency: { color: 'secondary' } }" />
							</div>
						</Flex>
						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="yellowNew" :class="$style.blockDetailsName"> Bytes in block </Text>
							<Text size="12" weight="600" color="secondary" :class="$style.blockDetailsValue"> {{ formatBytes(block.stats.bytes_in_block)
								}}</Text>
						</Flex>
					</Flex>
				</Flex>
			</Flex>

			<Flex direction="column" gap="0" wide :class="$style.txs_wrapper">
				<Flex direction="column" wide :class="$style.txs_wrapper_container">
					<Flex align="center" justify="between" :class="$style.tabs_wrapper">
						<Flex gap="4" :class="$style.tabs">
							<Flex @click="activeTab = 'transactions'" align="center" gap="6"
								:class="[$style.tab, activeTab === 'transactions' && $style.active]">
								<Icon name="tx" size="12" :color="activeTab === 'transactions' ? 'yellowNew' : 'secondary'" />

								<Text class="openSans_font" size="13" weight="600" :color="activeTab === 'transactions' ? 'yellowNew' : 'secondary'">Transactions</Text>
							</Flex>

							<Flex @click="activeTab = 'events'" align="center" gap="6"
								:class="[$style.tab, activeTab === 'events' && $style.active]">
								<Icon name="zap" size="12" :color="activeTab === 'events' ? 'yellowNew' : 'secondary'" />

								<Text class="openSans_font" size="13" weight="600" :color="activeTab === 'events' ? 'yellowNew' : 'secondary'">Events</Text>
							</Flex>
						</Flex>
					</Flex>

					<Flex v-if="activeTab === 'transactions'" direction="column"
						:class="[$style.table, isLoading && $style.disabled]">
						<Flex wrap="wrap" align="center" justify="start" gap="8" :class="$style.filters">
							<Popover :open="isStatusPopoverOpen" @on-close="onStatusPopoverClose" width="200">
								<Button @click="handleOpenStatusPopover" type="secondary" size="mini"
									:disabled="!transactions.length" :class="$style.settingsBtn">
									<Icon name="plus-circle" size="12" color="yellowNew" />
									<Text class="openSans_font" color="yellowNew">Status</Text>

									<template v-if="Object.keys(filters.status).find((f) => filters.status[f])">
										<div :class="$style.vertical_divider" />

										<Text class="openSans_font" size="12" weight="600" color="yellowNew" style="text-transform: capitalize">
											{{
			Object.keys(filters.status)
				.filter((f) => filters.status[f])
				.join(", ")
		}}
										</Text>

										<Icon @click.stop="resetFilters('status', true)" name="close-circle" size="12"
											color="secondary" />
									</template>
								</Button>

								<template #content>
									<Flex direction="column" gap="12">
										<Text class="openSans_font" size="12" weight="500" color="secondary">Filter by Status</Text>

										<Flex direction="column" gap="8">
											<Checkbox v-model="filters.status.success">
												<Text class="openSans_font" size="12" weight="500" color="primary">Success</Text>
											</Checkbox>
											<Checkbox v-model="filters.status.failed">
												<Text class="openSans_font" size="12" weight="500" color="primary">Failed</Text>
											</Checkbox>
										</Flex>

										<Button class="openSans_font" @click="handleApplyStatusFilters" type="secondary" size="mini"
											wide>Apply</Button>
									</Flex>
								</template>
							</Popover>

							<Popover :open="isMessageTypePopoverOpen" @on-close="onMessageTypePopoverClose" width="250">
								<Button @click="handleOpenMessageTypePopover" type="secondary" size="mini"
									:disabled="!transactions.length" :class="$style.settingsBtn">
									<Icon name="plus-circle" size="12" color="yellowNew" />
									<Text class="openSans_font" color="yellowNew">Message Type</Text>

									<template
										v-if="Object.keys(filters.message_type).find((f) => filters.message_type[f])">
										<div :class="$style.vertical_divider" />

										<Text class="openSans_font" size="12" weight="600" color="yellowNew">
											{{
			Object.keys(filters.message_type).filter((f) =>
				filters.message_type[f]).length < 3 ? Object.keys(filters.message_type)
					.filter((f) => filters.message_type[f])
					.map((f) => f.replace("Msg", ""))
					.join(", ")
				: `${Object.keys(filters.message_type)
					.filter((f) => filters.message_type[f])[0]
					.replace("Msg", "")} and ${Object.keys(filters.message_type).filter((f) =>
						filters.message_type[f]).length - 1
				} more`
		}}
										</Text>

										<Icon @click.stop="resetFilters('message_type', true)" name="close-circle"
											size="12" color="secondary" />
									</template>
								</Button>

								<template #content>
									<Flex direction="column" gap="12">
										<Text class="openSans_font" size="12" weight="500" color="secondary">Filter by Message Type</Text>

										<Input class="openSans_font" v-model="searchTerm" size="small" placeholder="Search" autofocus />

										<Flex direction="column" gap="8" :class="$style.message_types_list">
											<template v-if="Object.keys(filters.message_type).filter((t) =>
			t.toLowerCase().includes(searchTerm.trim().toLowerCase()),
		).length
			">
												<Checkbox v-for="msg_type in Object.keys(filters.message_type).filter((t) =>
			t.toLowerCase().includes(searchTerm.trim().toLowerCase()),
		)" :key="msg_type" v-model="filters.message_type[msg_type]">
													<Text class="openSans_font" size="12" weight="500" color="primary">{{
			msg_type.replace("Msg", "") }}</Text>
												</Checkbox>
											</template>
											<Flex v-else direction="column" gap="8">
												<Text class="openSans_font" size="12" weight="500" color="tertiary">Nothing was found</Text>
											</Flex>
										</Flex>

										<Button class="openSans_font" @click="handleApplyMessageTypeFilters" type="secondary" size="mini"
											wide>Apply</Button>
									</Flex>
								</template>
							</Popover>
						</Flex>

						<Flex v-if="transactions.length" :class="$style.table_scroller">
							<table>
								<thead>
									<tr>
										<th><Text size="12" weight="600" color="tertiary">Hash</Text></th>
										<th><Text size="12" weight="600" color="tertiary">Messages</Text></th>
										<th><Text size="12" weight="600" color="tertiary">Gas</Text></th>
										<th><Text size="12" weight="600" color="tertiary">Fee</Text></th>
									</tr>
								</thead>

								<tbody>
									<tr v-for="tx in transactions" :key="tx.hash">
										<td style="width: 1px">
											<NuxtLink :to="`/tx/${tx.hash}`">
												<Tooltip position="start" delay="500">
													<Flex align="center" gap="8">
														<Icon
															:name="tx.status === 'success' ? 'check-circle' : 'close-circle'"
															size="14"
															:color="tx.status === 'success' ? 'green' : 'red'" />

														<Text class="rubik_font" size="13" weight="600" color="primary" mono>{{
			tx.hash.slice(0, 4).toUpperCase()
		}}</Text>

														<Flex align="center" gap="3">
															<div v-for="dot in 3" :key="dot" class="dot rubik_font" />
														</Flex>

														<Text class="rubik_font" size="13" weight="600" color="primary" mono>{{
			tx.hash.slice(tx.hash.length - 4,
				tx.hash.length).toUpperCase()
		}}</Text>

														<CopyButton :text="tx.hash" />
													</Flex>

													<template #content>
														<Flex direction="column" gap="6">
															<Flex align="center" gap="4">
																<Icon
																	:name="tx.status === 'success' ? 'check-circle' : 'close-circle'"
																	size="13"
																	:color="tx.status === 'success' ? 'green' : 'red'" />
																<Text size="13" weight="600" color="primary">
																	{{ tx.status === "success" ? "Successful" : "Failed"
																	}} Transaction
																</Text>
															</Flex>

															{{ space(tx.hash).toUpperCase() }}

															<Text height="120" color="tertiary" style="max-width: 400px"
																mono align="left">
																{{ tx.error }}
															</Text>
														</Flex>
													</template>
												</Tooltip>
											</NuxtLink>
										</td>
										<td>
											<NuxtLink :to="`/tx/${tx.hash}`">
												<Flex align="center">
													<Tooltip position="start" textAlign="left">
														<MessageTypeBadge :types="tx.message_types" />

														<template #content>
															<Flex direction="column" gap="8">
																<Text v-for="type in tx.message_types" :key="type"
																	color="primary">
																	{{ type.replace("Msg", "") }}
																</Text>
															</Flex>
														</template>
													</Tooltip>
												</Flex>
											</NuxtLink>
										</td>
										<td style="width: 1px">
											<NuxtLink :to="`/tx/${tx.hash}`">
												<Tooltip>
													<Flex align="center" gap="8">
														<GasBar :percent="(tx.gas_used * 100) / tx.gas_wanted" />

														<Text v-if="tx.gas_wanted > 0" size="13" weight="600"
															color="primary">
															{{ ((tx.gas_used * 100) / tx.gas_wanted).toFixed(2) }}%
														</Text>
													</Flex>

													<template #content>
														<Flex align="center" gap="4">
															<Text size="13" weight="600" color="primary">{{
			comma(tx.gas_used) }}</Text>
															<Text size="13" weight="600" color="tertiary">/</Text>
															<Text size="13" weight="600" color="secondary">{{
			comma(tx.gas_wanted)
		}}</Text>
														</Flex>
													</template>
												</Tooltip>
											</NuxtLink>
										</td>
										<td>
											<NuxtLink :to="`/tx/${tx.hash}`">
												<AmountInCurrency :amount="{ value: block.stats.fee, decimal: 6 }"
													:styles="{ amount: { size: '13' }, currency: { size: '13' } }" />
											</NuxtLink>
										</td>
									</tr>
								</tbody>
							</table>
						</Flex>
						<Flex v-else-if="hasActiveFilters && !transactions.length" align="center" justify="center"
							direction="column" gap="20" wide :class="$style.empty">
							<Icon name="search" size="24" color="support" />

							<Flex direction="column" gap="8">
								<Text size="13" weight="600" color="secondary" align="center"> Nothing was found </Text>
								<Text size="12" weight="500" height="160" color="tertiary" align="center"
									style="max-width: 220px">
									Clear filters to see all transactions
								</Text>
							</Flex>

							<Button @click="handleClearAllFilters" type="secondary" size="small">Clear all
								filters</Button>
						</Flex>

						<Flex v-else direction="column" align="center" justify="center" gap="8" :class="$style.empty">
							<Text size="13" weight="600" color="secondary" align="center"> No transactions </Text>
							<Text size="12" weight="500" height="160" color="tertiary" align="center"
								style="max-width: 220px">
								This block does not contain any transactions
							</Text>
						</Flex>

						<!-- Pagination -->
						<Flex v-if="transactions.length" align="center" gap="6" :class="$style.pagination">
							<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
								<Icon name="arrow-left-stop" size="12" color="primary" />
							</Button>
							<Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
								<Icon name="arrow-left" size="12" color="primary" />
							</Button>

							<Button type="secondary" size="mini" disabled>
								<Text class="openSans_font" size="12" weight="600" color="primary">Page {{ page }}</Text>
							</Button>

							<Button @click="handleNext" type="secondary" size="mini"
								:disabled="transactions.length !== 10">
								<Icon name="arrow-right" size="12" color="primary" />
							</Button>
						</Flex>
					</Flex>
					<Events v-else :block="block">

					</Events>
				</Flex>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.blockDetailsName {
	width: 130px;
	height: 32px;
	border-radius: 4px 4px 4px 4px;
	border: 1px solid rgba(255, 255, 255, 0.3);
	display: flex;
	justify-content: center;
	align-items: center
}

.blockDetailsValue {
	width: 170px;
	height: 32px;
	border-radius: 4px 4px 4px 4px;
	border: 1px solid rgba(255, 255, 255, 0.3);
	display: flex;
	justify-content: center;
	align-items: center
}

.header {
	border-radius: 8px 8px 0 0;
	background: rgba(255, 255, 255, 0.1);
	padding: 20px 20px 0 20px;
}

.data {
	min-width: 384px;
	border-radius: 0 0 0 8px;
	background: rgba(255, 255, 255, 0.1);
	padding: 20px;

	.top {
		padding: 16px 16px 0 16px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 4px 4px 0 0;
	}

	.main {
		padding: 16px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 0 0 4px 4px;
		height: 100%;

		& .key_value {
			max-width: 100%;
		}
	}
}

.txs_wrapper {
	min-width: 0;
	background: rgba(255, 255, 255, 0.1);
	padding: 20px 20px 20px 0;
}

.txs_wrapper_container {
	height: 100%;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 4px;
	padding: 20px;
}

.tabs_wrapper {
	min-height: 44px;
	overflow-x: auto;
}

.tabs_wrapper::-webkit-scrollbar {
	display: none;
}

.tab {
	height: 28px;

	cursor: pointer;
	border-radius: 6px;

	padding: 0 8px;

	transition: all 0.1s ease;

	& span {
		transition: all 0.1s ease;
	}

}

.tab.active {
	border-radius: 4px 4px 4px 4px;
    border: 1px solid rgb(243 57 40 / 50%);
    background: linear-gradient(rgb(243 57 40 / 20%), var(--op-3));
}

.tab.hide {
	display: none;
}

.table_scroller {
	min-width: 100%;
	width: 0;
	height: 100%;

	overflow-x: auto;
}

.inner {
	height: 100%;
	border-radius: 0 0 8px 0;
	background: rgba(255, 255, 255, 0.1);
}

.events {
	padding: 16px;
}

.table {
	height: 100%;
	border-radius: 0 0 8px 0;

	& table {
		width: 100%;
		height: fit-content;

		border-spacing: 0px;

		padding-bottom: 8px;

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
			padding-top: 4px;
			padding-bottom: 8px;

			&:first-child {
				padding-left: 16px;
			}

			& span {
				display: flex;
			}
		}

		& tr td {
			padding: 0;

			white-space: nowrap;

			&:first-child {
				padding-left: 16px;
			}

			&>a {
				display: flex;

				min-height: 40px;

				padding-right: 24px;
			}
		}
	}
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

.filters {
	padding: 0 16px;
	height: 56px;
	background: rgba(255,255,255,0.05);
	border-radius: 8px 8px 8px 8px;
	margin-top: 8px;
}

.empty {
	flex: 1;
	padding: 16px 0;
}

.pagination {
	padding: 8px 16px 16px 16px;
}

@media (max-width: 800px) {
	.content {
		flex-direction: column;
	}

	.data {
		min-width: initial;

		border-radius: 4px;
	}

	.blockDetailsValue {
		width: 250px;
	}

	.table {
		border-radius: 4px 4px 8px 8px;
	}

	.txs_wrapper {
		padding: 20px;
	}
}

@media (max-width: 400px) {
	.tabs_wrapper {
		overflow-x: auto;

		&::-webkit-scrollbar {
			display: none;
		}
	}

	.hint {
		display: none;
	}
}
</style>
