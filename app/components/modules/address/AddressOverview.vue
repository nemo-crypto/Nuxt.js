<script setup>
/** UI */
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"
import Button from "@/components/ui/Button.vue"
import Popover from "@/components/ui/Popover.vue"
import Checkbox from "@/components/ui/Checkbox.vue"
import Input from "@/components/ui/Input.vue"

/** Components */
import TransactionsTable from "./tables/TransactionsTable.vue"
import MessagesTable from "@/components/modules/namespace/tables/MessagesTable.vue"
import BlobsTable from "@/components/modules/namespace/tables/BlobsTable.vue"
import DelegationsTable from "./tables/DelegationsTable.vue"
import RedelegationsTable from "./tables/RedelegationsTable.vue"
import UndelegationsTable from "./tables/UndelegationsTable.vue"
import AmountInCurrency from "@/components/AmountInCurrency.vue"

/** Services */
import { comma, tia } from "@/services/utils"
import { MsgTypes } from "@/services/constants/messages"

/** API */
import {
	fetchTxsByAddressHash,
	fetchMessagesByAddressHash,
	fetchBlobsByAddressHash,
	fetchAddressDelegations,
	fetchAddressRedelegations,
	fetchAddressUndelegations,
} from "@/services/api/address"

/** Store */
import { useModalsStore } from "@/store/modals"
import { useCacheStore } from "@/store/cache"
import { useBookmarksStore } from "@/store/bookmarks"
import { useNotificationsStore } from "@/store/notifications"
const modalsStore = useModalsStore()
const cacheStore = useCacheStore()
const bookmarksStore = useBookmarksStore()
const notificationsStore = useNotificationsStore()

const route = useRoute()
const router = useRouter()

const props = defineProps({
	address: {
		type: Object,
		required: true,
	},
})

const isBookmarkButtonHovered = ref(false)
const isBookmarked = ref(false)
const bookmarkText = computed(() => {
	if (isBookmarkButtonHovered.value && isBookmarked.value) return "Remove"
	return isBookmarked.value ? "Saved" : "Save"
})

const isRefetching = ref(false)
const transactions = ref([])
const messages = ref([])
const blobs = ref([])

/** Tabs */
const tabs = ref([
	{
		alias: "transactions",
		displayName: "Signed Transactions",
		icon: "tx",
		show: true,
	},
	{
		alias: "messages",
		displayName: "Messages",
		icon: "message",
		show: true,
	},
	{
		alias: "blobs",
		displayName: "Blobs",
		icon: "blob",
		show: true,
	},
	{
		alias: "delegations",
		displayName: "Delegations",
		icon: "coins_up",
		show: true,
	},
	{
		alias: "redelegations",
		displayName: "Redelegations",
		icon: "redelegate",
		show: true,
	},
	{
		alias: "undelegations",
		displayName: "Undelegations",
		icon: "unlock",
		show: props.address.balance.unbonding > 0,
	},
])

const activeTab = ref(tabs.value[0].alias)
const tabsEl = ref(null)

const handleSelect = (tab) => {
	if (activeTab.value !== tab) {
		activeTab.value = tab

		let tabCenter = 0
		for (let i = 0; i < tabsEl.value.wrapper.children.length; i++) {
			if (tabsEl.value.wrapper.children[i].dataset.tab === tab) {
				tabCenter = tabsEl.value.wrapper.children[i].offsetLeft + tabsEl.value.wrapper.children[i].offsetWidth / 2
				break
			}
		}

		if (tabCenter) {
			let wrapperCenter = tabsEl.value.wrapper.offsetLeft + tabsEl.value.wrapper.offsetWidth / 2

			tabsEl.value.wrapper.scroll({ left: tabCenter - wrapperCenter })
		}
	}
}

/** Pagination */
const page = ref(1)
const handleNextCondition = ref(true)
const handleNext = () => {
	page.value += 1
}
const handlePrev = () => {
	if (page.value === 1) return
	page.value -= 1
}

/** Sorting */
const sort = reactive({
	by: "time",
	dir: "desc",
})

const onSort = (by) => {
	switch (sort.dir) {
		case "desc":
			if (sort.by == by) sort.dir = "asc"
			break

		case "asc":
			sort.dir = "desc"

			break
	}

	sort.by = by

	getTransactions()
}

/** Filters */
const filters = reactive({
	status: {
		success: false,
		failed: false,
	},
	message_type: MsgTypes.reduce((a, b) => ({ ...a, [b]: false }), {}),
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
	isRefetching.value = true

	const { data } = await fetchTxsByAddressHash({
		hash: props.address.hash,
		limit: 10,
		offset: (page.value - 1) * 10,
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
	cacheStore.current.transactions = transactions.value
	handleNextCondition.value = transactions.value.length < 10

	isRefetching.value = false
}

const getMessages = async () => {
	isRefetching.value = true

	const { data } = await fetchMessagesByAddressHash({
		hash: props.address.hash,
		limit: 10,
		offset: (page.value - 1) * 10,
		sort: "desc",
	})

	messages.value = data.value
	cacheStore.current.messages = messages.value
	handleNextCondition.value = messages.value.length < 10

	isRefetching.value = false
}

const getBlobs = async () => {
	isRefetching.value = true

	const { data } = await fetchBlobsByAddressHash({
		hash: props.address.hash,
		limit: 10,
		offset: (page.value - 1) * 10,
		sort: "desc",
	})

	if (data.value?.length) {
		blobs.value = data.value.map((b) => ({ ...b, signer: props.address.hash }))
	}
	handleNextCondition.value = data.value.length < 10

	isRefetching.value = false
}

await getTransactions()

/** Delegation */
const isActiveDelegator = props.address.balance.delegated > 0 || props.address.balance.unbonding > 0
const collapseBalances = ref(!isActiveDelegator)
const totalBalance =
	parseInt(props.address.balance.spendable) + parseInt(props.address.balance.delegated) + parseInt(props.address.balance.unbonding)
const delegations = ref([])
const redelegations = ref([])
const undelegations = ref([])

const getDelegations = async () => {
	isRefetching.value = true

	const { data } = await fetchAddressDelegations({
		hash: props.address.hash,
		limit: 10,
		offset: (page.value - 1) * 10,
	})

	if (data.value?.length) {
		delegations.value = data.value
	}
	handleNextCondition.value = data.value.length < 10

	isRefetching.value = false
}

const getRedelegations = async () => {
	isRefetching.value = true

	const { data } = await fetchAddressRedelegations({
		hash: props.address.hash,
		limit: 10,
		offset: (page.value - 1) * 10,
	})

	if (data.value?.length) {
		redelegations.value = data.value
	}
	handleNextCondition.value = data.value.length < 10

	isRefetching.value = false
}

const getUndelegations = async () => {
	isRefetching.value = true

	const { data } = await fetchAddressUndelegations({
		hash: props.address.hash,
		limit: 10,
		offset: (page.value - 1) * 10,
	})

	if (data.value?.length) {
		undelegations.value = data.value
	}
	handleNextCondition.value = data.value.length < 10

	isRefetching.value = false
}

/** Refetch transactions */
watch(
	() => activeTab.value,
	() => {
		page.value = 1

		switch (activeTab.value) {
			case "transactions":
				getTransactions()
				break

			case "messages":
				getMessages()
				break

			case "blobs":
				getBlobs()
				break

			case "delegations":
				getDelegations()
				break

			case "redelegations":
				getRedelegations()
				break

			case "undelegations":
				getUndelegations()
				break
		}
	},
)

watch(
	() => page.value,
	() => {
		switch (activeTab.value) {
			case "transactions":
				getTransactions()
				break

			case "blobs":
				getBlobs()
				break

			case "messages":
				getMessages()
				break

			case "delegations":
				getDelegations()
				break

			case "redelegations":
				getRedelegations()
				break

			case "undelegations":
				getUndelegations()
				break
		}
	},
)

const handleBookmark = () => {
	if (!isBookmarked.value) {
		bookmarksStore.bookmarks.addresses.push({
			id: props.address.hash,
			type: "Address",
			ts: new Date().getTime(),
		})
		isBookmarked.value = true

		notificationsStore.create({
			notification: {
				type: "success",
				icon: "check",
				title: "Address added to bookmarks",
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
		const bookmarkIdx = bookmarksStore.bookmarks.addresses.findIndex((t) => t.id === props.address.hash)
		bookmarksStore.bookmarks.addresses.splice(bookmarkIdx, 1)
		isBookmarked.value = false

		notificationsStore.create({
			notification: {
				type: "success",
				icon: "check",
				title: "Address removed from bookmarks",
				autoDestroy: true,
			},
		})
	}
}

const handleSend = () => {
	modalsStore.open("send")
}

const handleViewRawAddress = () => {
	cacheStore.current._target = "address"
	modalsStore.open("rawData")
}

const handleViewRawTransactions = () => {
	cacheStore.current._target = "transactions"
	modalsStore.open("rawData")
}

const handleOpenQRModal = () => {
	cacheStore.qr.data = props.address.hash
	cacheStore.qr.description = "Scan QR code to get this address"
	cacheStore.qr.icon = "address"

	modalsStore.open("qr")
}
</script>

<template>
	<Flex direction="column" gap="0">
		<Flex align="center" justify="between" :class="$style.header">
			<Flex align="center" gap="8">
				<!-- <Icon name="address" size="14" color="primary" /> -->
				<Text as="h1" size="20" weight="600" color="primary">Address</Text>
			</Flex>

			<Flex align="center" gap="8">
				<!-- <Button class="openSans_font" @click="handleSend" type="secondary" size="mini">
					<Icon name="coins" size="12" color="primary" />
					Send
				</Button> -->

				<Button
					@click="handleBookmark"
					@mouseenter="isBookmarkButtonHovered = true"
					@mouseleave="isBookmarkButtonHovered = false"
					type="secondary"
					size="mini"
					class="openSans_font"
				>
					<Icon
						:name="isBookmarkButtonHovered && isBookmarked ? 'close' : isBookmarked ? 'bookmark-check' : 'bookmark-plus'"
						size="12"
						:color="isBookmarked && !isBookmarkButtonHovered ? 'yellowNew' : 'primary'"
					/>
					{{ bookmarkText }}
				</Button>

				<!-- <Dropdown>
					<Button class="openSans_font" type="secondary" size="mini">
						<Icon name="dots" size="12" color="primary" />
						More
					</Button>

					<template #popup>
						<DropdownItem @click="handleOpenQRModal">
							<Flex class="openSans_font" align="center" gap="8">
								<Icon name="qr" size="12" color="secondary" />
								Get QR Code
							</Flex>
						</DropdownItem>
						<DropdownItem @click="handleViewRawAddress">
							<Flex class="openSans_font" align="center" gap="8">
								<Icon name="address" size="12" color="secondary" />
								View Raw Address
							</Flex>
						</DropdownItem>
					</template>
				</Dropdown> -->
			</Flex>
		</Flex>

		<Flex gap="0" :class="$style.content">
			<Flex direction="column" justify="between" gap="32" :class="$style.data">
				<Flex direction="column" gap="24" :class="$style.main">
					<Flex direction="column" gap="8" :class="$style.key_value">
						<Text size="12" weight="600" color="secondary">Hash</Text>

						<Flex align="center" gap="10">
							<AddressBadge :hash="address.hash" />

							<CopyButton :text="address.hash" />
						</Flex>
					</Flex>

					<Flex direction="column" gap="16" :class="$style.key_value">
						<Flex @click="collapseBalances = !collapseBalances" align="center" justify="between" style="cursor: pointer">
							<Flex direction="column" gap="8">
								<Text size="12" weight="600" color="secondary">Total Balance</Text>
									<AmountInCurrency
									:amount="{ value: totalBalance }"
									:styles="{ amount: { size: '13' ,color:'yellowNew' }, currency: { size: '13', color: 'yellowNew' } }"
								/>
								<!-- <Text size="13" weight="600" color="primary" selectable>{{ tia(totalBalance).toLocaleString('en-US') }} NUB</Text> -->
							</Flex>

							<Icon
								name="chevron"
								size="14"
								color="secondary"
								:style="{
									transform: `rotate(${collapseBalances ? '0' : '180'}deg)`,
									transition: 'all 400ms ease',
								}"
							/>
						</Flex>

						<Flex v-if="!collapseBalances" direction="column" gap="12" :class="$style.key_value">
							<Flex align="center" justify="between">
								<Text size="12" weight="600" color="yellowNew" :class="$style.blockDetailsName"> Spendable</Text>
								<div :class="$style.blockDetailsValue">
									<AmountInCurrency
									:amount="{ value: address.balance.spendable }"
									:styles="{ amount: { color: 'secondary' }, currency: { color: 'secondary' } }"
								/>
								</div>
							</Flex>

							<Flex align="center" justify="between">
								<Text size="12" weight="600" color="yellowNew" :class="$style.blockDetailsName"> Delegated</Text>
								<div :class="$style.blockDetailsValue">
									<AmountInCurrency
									:amount="{ value: address.balance.delegated }"
									:styles="{ amount: { color: 'secondary' }, currency: { color: 'secondary' } }"
								/>
								</div>
							</Flex>

							<Flex align="center" justify="between">
								<Text size="12" weight="600" color="yellowNew" :class="$style.blockDetailsName"> Unbonding</Text>
								<div :class="$style.blockDetailsValue">
									<AmountInCurrency
									:amount="{ value: address.balance.unbonding }"
									:styles="{ amount: { color: 'secondary' }, currency: { color: 'secondary' } }"
								/>
								</div>
							</Flex>
						</Flex>
					</Flex>

					<Flex direction="column" gap="16">
						<Text size="12" weight="600" color="secondary">Details</Text>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="yellowNew" :class="$style.blockDetailsName"> First Height</Text>
							<Text class="rubik_font" size="12" weight="600" color="secondary" :class="$style.blockDetailsValue"> {{ comma(address.first_height) }} </Text>
						</Flex>
						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="yellowNew" :class="$style.blockDetailsName"> Last Height</Text>
							<Text class="rubik_font" size="12" weight="600" color="secondary" :class="$style.blockDetailsValue"> {{ comma(address.last_height) }} </Text>
						</Flex>
					</Flex>
				</Flex>
			</Flex>

			<Flex direction="column" gap="0" wide :class="$style.txs_wrapper">
				<Flex align="center" gap="4" :class="$style.tabs_wrapper" ref="tabsEl">
					<template v-for="tab in tabs" :key="tab.displayName">
						<Flex
							v-if="tab.show"
							:data-tab="tab.alias"
							@click="handleSelect(tab.alias)"
							align="center"
							gap="6"
							:class="[$style.tab, activeTab === tab.alias && $style.active]"
							:style="{ transition: 'all 200ms ease' }"
						>
							<Icon :name="tab.icon" size="14" :color="activeTab === tab.alias ? 'yellowNew' : 'secondary'" />

							<Text size="14" weight="600" :color="activeTab === tab.alias ? 'yellowNew' : 'secondary'">{{ tab.displayName }}</Text>
						</Flex>
					</template>
				</Flex>

				<Flex direction="column" justify="center" :class="[$style.tables, isRefetching && $style.disabled]">
					<Flex v-if="activeTab === 'transactions'" wrap="wrap" align="center" gap="8" :class="$style.filters">
						<Popover :open="isStatusPopoverOpen" @on-close="onStatusPopoverClose" width="200">
							<Button
								@click="handleOpenStatusPopover"
								type="secondary"
								size="mini"
								:disabled="!transactions.length && !hasActiveFilters"
							>
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

									<Icon @click.stop="resetFilters('status', true)" name="close-circle" size="12" color="secondary" />
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

									<Button class="openSans_font" @click="handleApplyStatusFilters" type="secondary" size="mini" wide>Apply</Button>
								</Flex>
							</template>
						</Popover>

						<Popover :open="isMessageTypePopoverOpen" @on-close="onMessageTypePopoverClose" width="250">
							<Button
								@click="handleOpenMessageTypePopover"
								type="secondary"
								size="mini"
								:disabled="!transactions.length && !hasActiveFilters"
							>
								<Icon name="plus-circle" size="12" color="yellowNew" />
								<Text class="openSans_font" color="yellowNew">Message Type</Text>

								<template v-if="Object.keys(filters.message_type).find((f) => filters.message_type[f])">
									<div :class="$style.vertical_divider" />

									<Text class="openSans_font" size="12" weight="600" color="yellowNew">
										{{
											Object.keys(filters.message_type).filter((f) => filters.message_type[f]).length < 3
												? Object.keys(filters.message_type)
														.filter((f) => filters.message_type[f])
														.map((f) => f.replace("Msg", ""))
														.join(", ")
												: `${Object.keys(filters.message_type)
														.filter((f) => filters.message_type[f])[0]
														.replace("Msg", "")} and ${
														Object.keys(filters.message_type).filter((f) => filters.message_type[f]).length - 1
												  } more`
										}}
									</Text>

									<Icon
										@click.stop="resetFilters('message_type', true)"
										name="close-circle"
										size="12"
										color="secondary"
									/>
								</template>
							</Button>

							<template #content>
								<Flex direction="column" gap="12">
									<Text size="12" weight="500" color="secondary">Filter by Message Type</Text>

									<Input v-model="searchTerm" size="small" placeholder="Search" autofocus />

									<Flex direction="column" gap="8" :class="$style.message_types_list">
										<template
											v-if="
												Object.keys(filters.message_type).filter((t) =>
													t.toLowerCase().includes(searchTerm.trim().toLowerCase()),
												).length
											"
										>
											<Checkbox
												v-for="msg_type in Object.keys(filters.message_type).filter((t) =>
													t.toLowerCase().includes(searchTerm.trim().toLowerCase()),
												)"
												:key="msg_type"
												v-model="filters.message_type[msg_type]"
											>
												<Text class="openSans_font" size="12" weight="500" color="primary">{{ msg_type.replace("Msg", "") }}</Text>
											</Checkbox>
										</template>
										<Flex v-else direction="column" gap="8">
											<Text size="12" weight="500" color="tertiary">Nothing was found</Text>
										</Flex>
									</Flex>

									<Button class="openSans_font" @click="handleApplyMessageTypeFilters" type="secondary" size="mini" wide>Apply</Button>
								</Flex>
							</template>
						</Popover>
					</Flex>

					<Flex :class="$style.table">
						<!-- Transactions Table -->
						<template v-if="activeTab === 'transactions'">
							<TransactionsTable v-if="transactions.length" :transactions="transactions" :sort="sort" @onSort="onSort" />

							<Flex
								v-else-if="hasActiveFilters && !transactions.length"
								align="center"
								justify="center"
								direction="column"
								gap="20"
								wide
								:class="$style.empty"
							>
								<Icon name="search" size="24" color="support" />

								<Flex direction="column" gap="8">
									<Text size="13" weight="600" color="primary" align="center"> Nothing was found </Text>
									<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
										Clear filters to see all transactions
									</Text>
								</Flex>

								<Button @click="handleClearAllFilters" type="secondary" size="small">Clear all filters</Button>
							</Flex>

							<Flex v-else direction="column" align="center" justify="center" gap="8" :class="$style.empty">
								<Text size="13" weight="600" color="primary" align="center"> No transactions </Text>
								<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
									This address did not signed any {{ page === 1 ? "" : "more" }} transactions
								</Text>
							</Flex>
						</template>

						<!-- Messages Table -->
						<template v-if="activeTab === 'messages'">
							<MessagesTable v-if="messages.length" :messages="messages" />

							<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
								<Text size="13" weight="600" color="primary" align="center"> No Messages </Text>
								<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
									No {{ page === 1 ? "activity" : "more messages" }} with this address
								</Text>
							</Flex>
						</template>

						<!-- Blobs Table -->
						<template v-if="activeTab === 'blobs'">
							<BlobsTable v-if="blobs.length" :blobs="blobs" />

							<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
								<Text size="13" weight="600" color="primary" align="center"> No Blobs </Text>
								<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
									This address did not push any {{ page === 1 ? "" : "more" }} blobs
								</Text>
							</Flex>
						</template>

						<!-- Delegations Table -->
						<template v-if="activeTab === 'delegations'">
							<DelegationsTable v-if="delegations.length" :delegations="delegations" />

							<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
								<Text size="13" weight="600" color="primary" align="center"> No Delegations </Text>
								<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
									This address doesn't have any {{ page === 1 ? "" : "more" }} delegations
								</Text>
							</Flex>
						</template>

						<!-- Redelegations Table -->
						<template v-if="activeTab === 'redelegations'">
							<RedelegationsTable v-if="redelegations.length" :redelegations="redelegations" />

							<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
								<Text size="13" weight="600" color="primary" align="center"> No Redelegations </Text>
								<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
									This address doesn't have any {{ page === 1 ? "" : "more" }} redelegations
								</Text>
							</Flex>
						</template>

						<!-- Undelegations Table -->
						<template v-if="activeTab === 'undelegations'">
							<UndelegationsTable v-if="undelegations.length" :undelegations="undelegations" />

							<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
								<Text size="13" weight="600" color="primary" align="center"> No Undelegations </Text>
								<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
									This address doesn't have any {{ page === 1 ? "" : "more" }} undelegations
								</Text>
							</Flex>
						</template>
					</Flex>

					<!-- Pagination -->
					<Flex align="center" gap="6" :class="$style.pagination">
						<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
							<Icon name="arrow-left-stop" size="12" color="primary" />
						</Button>
						<Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
							<Icon name="arrow-left" size="12" color="primary" />
						</Button>

						<Button type="secondary" size="mini" disabled>
							<Text size="12" weight="600" color="primary">Page {{ page }}</Text>
						</Button>

						<Button @click="handleNext" type="secondary" size="mini" :disabled="handleNextCondition">
							<Icon name="arrow-right" size="12" color="primary" />
						</Button>
					</Flex>
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

	.main {
		padding: 16px;
		background: rgba(255, 255, 255, 0.05);
		border-radius:  4px;
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
	border-radius: 0 0 8px 0;
}

.message_types_list {
	height: 200px;

	overflow-y: auto;
	overflow-x: hidden;
}

.tabs_wrapper {
	min-height: 44px;
	overflow-x: auto;
	background: rgba(255, 255, 255, 0.05);
	padding: 16px;
	border-radius: 8px 8px 0 0;

	scroll-behavior: smooth;
}

.tabs_wrapper::-webkit-scrollbar {
	display: none;
}

.tab {
	height: 28px;

	white-space: nowrap;

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

.tables {
	height: 100%;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 0 0 8px 8px;
	padding: 0 16px 16px 16px;
}

.tables.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.table {
	flex: 1;
}

.filters {
	border-bottom: 1px dashed var(--op-8);

	padding: 12px 8px 12px 8px;
}

.badge {
	border-radius: 5px;
	background: var(--op-5);
	box-shadow: inset 0 0 0 1px var(--op-10);

	padding: 4px 6px;
}

.empty {
	flex: 1;

	padding-top: 16px;
	padding-bottom: 16px;
}

.pagination {
	padding: 16px;
}

.qrcode {
	max-width: 60px;

	filter: invert(1);
	opacity: 0.2;

	transition: all 0.2s ease;

	&:hover {
		opacity: 1;

		transform: scale(1.2);
	}
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

		scroll-behavior: smooth;

		&::-webkit-scrollbar {
			display: none;
		}
	}

	.hint {
		display: none;
	}
}
</style>
