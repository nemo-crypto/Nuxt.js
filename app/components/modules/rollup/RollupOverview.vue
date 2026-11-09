<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Components */
import AmountInCurrency from "@/components/AmountInCurrency.vue"

/** Tables */
import BlobsTable from "./tables/BlobsTable.vue"
import NamespacesTable from "./tables/NamespacesTable.vue"

/** Services */
import { comma, formatBytes } from "@/services/utils"

/** API */
import { fetchRollupBlobs, fetchRollupExportData, fetchRollupNamespaces } from "@/services/api/rollup"

/** Store */
import { useCacheStore } from "@/store/cache"
import { useNotificationsStore } from "@/store/notifications"
const cacheStore = useCacheStore()
const notificationsStore = useNotificationsStore()

const props = defineProps({
	rollup: {
		type: Object,
		required: true,
	},
})

const tabs = ref([
	{
		name: "Blobs",
		icon: "blob",
	},
	{
		name: "Namespaces",
		icon: "namespace",
	},
])
const activeTab = ref(tabs.value[0].name)

const isRefetching = ref(false)
const namespaces = ref([])
const blobs = ref([])

const page = ref(1)
const pages = computed(() => activeTab.value === "Blobs" ? Math.ceil(props.rollup.blobs_count / 10) : 1)

const handleNext = () => {
	page.value += 1
}
const handlePrev = () => {
	page.value -= 1
}

const getBlobs = async () => {
	isRefetching.value = true

	const { data } = await fetchRollupBlobs({
		id: props.rollup.id,
		offset: (page.value - 1) * 10,
		limit: 10,
	})

	if (data.value?.length) {
		blobs.value = data.value
		cacheStore.current.blobs = blobs.value
	}

	isRefetching.value = false
}
const getNamespaces = async () => {
	isRefetching.value = true

	const { data } = await fetchRollupNamespaces({
		id: props.rollup.id,
		offset: (page.value - 1) * 10,
		limit: 10,
	})

	if (data.value?.length) {
		namespaces.value = data.value
		cacheStore.current.namespaces = namespaces.value
	}

	isRefetching.value = false
}

/** Initital fetch for blobs */
await getBlobs()

/** Refetch Blobs/Messages on new page */
watch(
	() => page.value,
	() => {
		switch (activeTab.value) {
			case "Blobs":
				getBlobs()
				break

			case "Namespaces":
				getNamespaces()
				break
		}
	},
)

/** Refetch Blobs/Namespaces on tab changing */
watch(
	() => activeTab.value,
	() => {
		page.value = 1

		switch (activeTab.value) {
			case "Blobs":
				getBlobs()
				break

			case "Namespaces":
				getNamespaces()
				break
		}
	},
)

const periods = ref([
	{
		title: "Last 24 hours",
		timeRange: "day",
	},
	{
		title: "Last 7 days",
		timeRange: "week",
	},
	{
		title: "Last 31 days",
		timeRange: "month",
	},
])

const handleCSVDownload = async (period) => {
	let from
	switch (period) {
		case "day":
			from = parseInt(DateTime.now().minus({ days: 1 }).toMillis() / 1_000)
			break
		case "week":
			from = parseInt(DateTime.now().minus({ weeks: 1 }).toMillis() / 1_000)
			break
		case "month":
			from = parseInt(DateTime.now().minus({ months: 1 }).toMillis() / 1_000)
			break
		default:
			break
	}
	let to = parseInt(DateTime.now().toMillis() / 1_000)

	const { data } = await fetchRollupExportData({
		id: props.rollup.id,
		from: from,
		to: to,
	})

	if (!data.value) {
		notificationsStore.create({
			notification: {
				type: "error",
				icon: "close",
				title: "Failed to load data",
				autoDestroy: true,
			},
		})

		return
	}

	const blob = new Blob([data.value], { type: 'text/csv;charset=utf-8;' })
	const link = document.createElement("a")

	link.href = URL.createObjectURL(blob)
	link.download = `${props.rollup.slug}-blobs-last-${period}.csv`

	link.style.visibility = 'hidden'
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)

	notificationsStore.create({
		notification: {
			type: "success",
			icon: "check",
			title: "Data successfully downloaded",
			autoDestroy: true,
		},
	})
}

</script>

<template>
	<Flex direction="column" gap="0">
		<Flex align="center" justify="between" :class="$style.header">
			<Flex align="center" gap="0">
				<!-- <Icon name="rollup" size="14" color="primary" /> -->

				<Text as="h1" size="20" weight="600" color="primary">Rollup</Text>
			</Flex>

			<Dropdown>
				<Tooltip>
					<Button type="secondary" size="mini" :class="$style.exportBtc">
						<Icon name="download" size="16" color="primary" />
						<Text size="16" weight="400" color="primary">Export</Text>
					</Button>

					<template #content>
						<Text color="tertiary">Export blobs to CSV</Text>
					</template>
				</Tooltip>

				<template #popup>
					<DropdownItem v-for="period in periods" :key="period.title"
						@click="handleCSVDownload(period.timeRange)">
						{{ period.title }}
					</DropdownItem>
				</template>
			</Dropdown>
		</Flex>

		<Flex gap="0" :class="$style.content">
			<Flex direction="column" :class="$style.data">
				<Flex direction="column" gap="24" :class="$style.main">
					<Flex align="center" gap="12" :class="$style.key_value">
						<Flex v-if="rollup.logo" align="center" justify="center" :class="$style.avatar_container">
							<img :src="rollup.logo" :class="$style.avatar_image" />
						</Flex>

						<Flex direction="column" gap="8" :class="$style.key_value">
							<Text size="12" weight="600" color="secondary">Rollup</Text>

							<Flex align="center" gap="10">
								<Text size="13" weight="600" color="primary">{{ rollup.name }} </Text>

								<CopyButton size="16" :text="rollup.name" />
							</Flex>
						</Flex>
					</Flex>
					<Flex direction="column" gap="6">
						<Text size="12" weight="600" color="secondary">Description</Text>

						<Flex align="center" gap="6">
							<Text size="12" height="140" weight="600" color="tertiary" mono selectable
								:class="$style.memo">
								{{ rollup.description }}
							</Text>
						</Flex>
					</Flex>
					<Flex align="center" justify="start" gap="12">
						<Tooltip v-if="rollup.website" position="start" delay="500">
							<a :href="rollup.website" target="_blank">
								<Icon name="globe" size="16" color="yellowNew" :class="$style.btn" />
							</a>

							<template #content>
								{{ rollup.website }}
							</template>
						</Tooltip>

						<Tooltip v-if="rollup.twitter" position="start" delay="500">
							<a :href="rollup.twitter" target="_blank">
								<Icon name="twitter" size="16" color="yellowNew" :class="$style.btn" />
							</a>

							<template #content>
								{{ rollup.twitter }}
							</template>
						</Tooltip>

						<Tooltip v-if="rollup.github" position="start" delay="500">
							<a :href="rollup.github" target="_blank">
								<Icon name="github" size="16" color="yellowNew" :class="$style.btn" />
							</a>

							<template #content>
								{{ rollup.github }}
							</template>
						</Tooltip>
					</Flex>

					<Flex direction="column" gap="16">
						<Text size="16" weight="600" color="primary">Details</Text>

						<Flex align="center" justify="between">
							<Text size="14" weight="600" color="yellowNew" :class="$style.detailsName">Size</Text>
							<Text size="14" class="rubik_font" weight="400" color="secondary" :class="$style.detailsValue"> {{
			formatBytes(rollup.size) }} </Text>
						</Flex>

						<Flex align="center" justify="between">
							<Text size="14" weight="600" color="yellowNew" :class="$style.detailsName">Blobs</Text>
							<Text class="rubik_font" size="14" weight="400" color="secondary" :class="$style.detailsValue"> {{
			comma(rollup.blobs_count) }} </Text>
						</Flex>

						<Flex align="center" justify="between">
							<Text size="14" weight="600" color="yellowNew" :class="$style.detailsName">Blob Fees
								Paid</Text>
							<div :class="$style.detailsValue">
								<AmountInCurrency :amount="{ value: rollup.fee }"
									:styles="{ amount: { color: 'secondary' }, currency: { color: 'secondary' } }" />
							</div>
						</Flex>

						<Flex align="start" justify="between">
							<Text size="16" weight="600" color="yellowNew" :class="$style.detailsName">First Seen</Text>
							<Tooltip position="start" delay="500">
								<Text size="14" weight="400" color="primary" :class="$style.detailsValue">
									{{ DateTime.fromISO(rollup.first_message_time).toRelative({
			locale: "en", style:
				"short"
		})
									}}
								</Text>

								<template #content>
									{{ DateTime.fromISO(rollup.first_message_time).setLocale("en").toFormat("LLL d, t")
									}}
								</template>
							</Tooltip>
						</Flex>

						<Flex align="start" justify="between">
							<Text size="14" weight="600" color="yellowNew" :class="$style.detailsName">Last
								Active</Text>
							<Tooltip position="start" delay="500">
								<Text size="14" weight="400" color="primary" :class="$style.detailsValue">
									{{ DateTime.fromISO(rollup.last_message_time).toRelative({
			locale: "en", style:
				"short"
		})
									}}
								</Text>

								<template #content>
									{{ DateTime.fromISO(rollup.last_message_time).setLocale("en").toFormat("LLL d, t")
									}}
								</template>
							</Tooltip>
						</Flex>
					</Flex>
				</Flex>
			</Flex>

			<Flex direction="column" gap="0" wide :class="$style.txs_wrapper">
				<div :class="$style.txs_wrapper_container">
					<Flex align="center" justify="between" :class="$style.tabs_wrapper">
						<Flex gap="20" :class="$style.tabs">
							<Flex @click="activeTab = tab.name" v-for="tab in tabs" :key="tab.name" align="center"
								gap="6" :class="[$style.tab, activeTab === tab.name && $style.active]">
								<Icon :name="tab.icon" size="16"
									:color="activeTab === tab.name ? 'yellowNew' : 'secondary'" />
								<Text class="openSans_font" size="14" weight="600" :color="activeTab === tab.name ? 'yellowNew' : 'secondary'">{{ tab.name }}</Text>
							</Flex>
						</Flex>
					</Flex>

					<Flex direction="column" justify="center" gap="0"
						:class="[$style.table, isRefetching && $style.disabled]">
						<!-- Blobs Table -->
						<template v-if="activeTab === 'Blobs'">
							<BlobsTable v-if="blobs.length" :blobs="blobs" />

							<Flex v-else align="center" justify="center" direction="column" gap="8" wide
								:class="$style.empty">
								<Text size="13" weight="600" color="secondary" align="center"> No blobs </Text>
								<Text size="12" weight="500" height="160" color="tertiary" align="center"
									style="max-width: 220px">
									This rollup did not push any blob
								</Text>
							</Flex>

							<!-- Pagination -->
							<Flex v-if="blobs.length" align="center" gap="6" :class="$style.pagination">
								<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
									<Icon name="arrow-left-stop" size="12" color="primary" />
								</Button>
								<Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
									<Icon name="arrow-left" size="12" color="primary" />
								</Button>

								<Button type="secondary" size="mini" disabled>
									<Text class="openSans_font" size="12" weight="600" color="primary"> {{ comma(page) }} of {{ comma(pages)
										}}
									</Text>
								</Button>

								<Button @click="handleNext" type="secondary" size="mini" :disabled="page === pages">
									<Icon name="arrow-right" size="12" color="primary" />
								</Button>
								<Button @click="page = pages" type="secondary" size="mini" :disabled="page === pages">
									<Icon name="arrow-right-stop" size="12" color="primary" />
								</Button>
							</Flex>
						</template>
						<!-- Namespaces Table -->
						<template v-if="activeTab === 'Namespaces'">
							<NamespacesTable v-if="namespaces.length" :namespaces="namespaces" />

							<Flex v-else align="center" justify="center" direction="column" gap="8" wide
								:class="$style.empty">
								<Text size="13" weight="600" color="secondary" align="center"> No namespaces </Text>
								<Text size="12" weight="500" height="160" color="tertiary" align="center"
									style="max-width: 220px">
									This rollup is not linked to any namespace
								</Text>
							</Flex>

							<!-- Pagination -->
							<Flex v-if="namespaces.length" align="center" gap="6" :class="$style.pagination">
								<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
									<Icon name="arrow-left-stop" size="12" color="primary" />
								</Button>
								<Button @click="handlePrev" type="secondary" size="mini" :disabled="page === 1">
									<Icon name="arrow-left" size="12" color="primary" />
								</Button>

								<Button type="secondary" size="mini" disabled>
									<Text class="openSans_font" size="12" weight="600" color="primary">Page {{ page }}</Text>
								</Button>

								<Button @click="handleNext" type="secondary" size="mini"
									:disabled="namespaces.length <= 10">
									<Icon name="arrow-right" size="12" color="primary" />
								</Button>
							</Flex>

						</template>
					</Flex>
				</div>

			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.header {
	border-radius: 8px 8px 0 0;
	background: rgba(255, 255, 255, 0.1);
	padding: 20px;
}

.exportBtc {
	height: 34px !important;
	background: linear-gradient(90deg, #FF9502 0%, #FF6B00 100%) !important;
	border-radius: 4px 4px 4px 4px !important;
}

.data {
	min-width: 384px;
	border-radius: 0 0 0 8px;
	background: rgba(255, 255, 255, 0.1);
	padding: 0 10px 20px 20px;

	.main {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 4px 4px 4px 4px;
		padding: 20px;
		height: 100%;

		& .key_value {
			max-width: 100%;
		}
	}

	.avatar_container {
		position: relative;
		width: 50px;
		height: 50px;
		overflow: hidden;
		border-radius: 50%;
	}

	.avatar_image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.memo {
		max-width: 352px;
		text-overflow: ellipsis;
		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 4;
		overflow: hidden;
		text-overflow: ellipsis;
	}
}

.txs_wrapper {
	min-width: 0;
}

.txs_wrapper_container {
	padding: 0 20px 20px 10px;
	background: rgba(255, 255, 255, 0.1);
}

.tabs_wrapper {
	min-height: 44px;
	overflow-x: auto;
	background: rgba(255, 255, 255, 0.1);
	padding: 20px 20px 0px 20px;
	border-radius: 4px 4px 0 0;
}

.tabs_wrapper::-webkit-scrollbar {
	display: none;
}

.tab {
	height: 30px;
	cursor: pointer;
	padding: 0 8px;
	transition: all 0.1s ease;
}

.tab.active {
	background: rgba(247, 147, 26, 0.1);
	border-radius: 4px 4px 4px 4px;
	border: 1px solid #F7931A;
}

.table {
	height: 558px;
	border-radius: 0 0 4px 4px;
	padding: 0px 20px 20px 20px;
	background: rgba(255, 255, 255, 0.1);
}

tbody tr td{
	border-bottom: 1px solid rgba(255,255,255,0.1);
}

.table.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.empty {
	padding-top: 16px;
}

.pagination {
	padding: 0 20px;
}

.detailsName {
	width: 140px;
	height: 35px;
	border-radius: 4px 4px 4px 4px;
	border: 1px solid rgba(255, 255, 255, 0.3);
	display: flex;
	font-size: 14px;
	align-items: center;
	justify-content: center;
}

.detailsValue {
	width: 140px;
	height: 35px;
	border-radius: 4px 4px 4px 4px;
	border: 1px solid rgba(255, 255, 255, 0.3);
	display: flex;
	font-size: 14px;
	align-items: center;
	justify-content: center;
}

@media (max-width: 800px) {
	.content {
		flex-direction: column;
	}

	.data {
		min-width: initial;

		border-radius: 4px;
	}

	.table {
		border-radius: 4px 4px 8px 8px;
	}

	.detailsName {
		width: 180px;
	}

	.detailsValue {
		width: 180px;
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
