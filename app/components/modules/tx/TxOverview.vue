<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Events from "@/components/shared/tables/Events.vue"
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"
import Button from "~/components/ui/Button.vue"
import AmountInCurrency from "@/components/AmountInCurrency.vue"

/** Shared Components */
import MessageTypeBadge from "@/components/shared/MessageTypeBadge.vue"
import MessagesTable from "@/components/modules/tx/MessagesTable.vue"

/** Services */
import { comma, splitAddress, tia } from "@/services/utils"

/** API */
import { fetchTxMessages } from "@/services/api/tx"

/** Store */
import { useModalsStore } from "@/store/modals"
import { useCacheStore } from "@/store/cache"
import { useBookmarksStore } from "@/store/bookmarks"
import { useNotificationsStore } from "@/store/notifications"
const modalsStore = useModalsStore()
const cacheStore = useCacheStore()
const bookmarksStore = useBookmarksStore()
const notificationsStore = useNotificationsStore()

const router = useRouter()

const props = defineProps({
	tx: {
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

const activeTab = ref("messages")
const messages = ref([])

onMounted(async () => {
	isBookmarked.value = !!bookmarksStore.bookmarks.txs.find((t) => t.id === props.tx.hash)

	const data = await fetchTxMessages(props.tx.hash)
	messages.value = data
})

const handleBookmark = () => {
	if (!isBookmarked.value) {
		bookmarksStore.bookmarks.txs.push({
			id: props.tx.hash,
			type: "Transaction",
			ts: new Date().getTime(),
		})
		isBookmarked.value = true

		notificationsStore.create({
			notification: {
				type: "success",
				icon: "check",
				title: "Transaction added to bookmarks",
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
		const bookmarkIdx = bookmarksStore.bookmarks.txs.findIndex((t) => t.id === props.tx.hash)
		bookmarksStore.bookmarks.txs.splice(bookmarkIdx, 1)
		isBookmarked.value = false

		notificationsStore.create({
			notification: {
				type: "success",
				icon: "check",
				title: "Transaction removed from bookmarks",
				autoDestroy: true,
			},
		})
	}
}

const handleViewRawTransaction = () => {
	cacheStore.current._target = "transaction"
	modalsStore.open("rawData")
}
</script>

<template>
	<Flex direction="column" gap="0">
		<Flex align="center" justify="between" :class="$style.header">
			<Flex align="center" gap="8">
				<!-- <Icon name="tx" size="14" color="primary" /> -->
				<Text as="h1" size="20" weight="600" color="primary">Transaction</Text>
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
					<Button class="openSans_font" type="secondary" size="mini">
						<Icon name="dots" size="16" color="primary" />
						More
					</Button>

					<template #popup>
						<DropdownItem class="openSans_font" @click="handleViewRawTransaction"> View Raw Transaction </DropdownItem>
					</template>
</Dropdown> -->
			</Flex>
		</Flex>

		<Flex gap="0" :class="$style.content">
			<Flex direction="column" :class="$style.data">
				<Flex direction="column" gap="24" :class="$style.main">
					<Flex align="center" gap="40">
						<Flex direction="column" gap="10" :class="$style.key_value">
							<Text size="12" weight="600" color="secondary">Status</Text>

							<Flex align="center" gap="6">
								<Icon :name="tx.status === 'success' ? 'check-circle' : 'close-circle'" size="14"
									:color="tx.status === 'success' ? 'green' : 'red'" />
								<Text size="13" weight="600" color="primary" style="text-transform: capitalize">
									{{ tx.status }}
								</Text>
							</Flex>
						</Flex>

						<Flex direction="column" gap="10" :class="$style.key_value">
							<Text size="12" weight="600" color="secondary">Time</Text>
							<Text size="13" weight="600" color="primary">
								{{ DateTime.fromISO(tx.time).setLocale("en").toFormat("ff") }}
							</Text>
						</Flex>
					</Flex>

					<Flex v-if="tx.error" direction="column" gap="6">
						<Text size="12" weight="600" color="secondary">Error Message</Text>

						<Text size="12" height="140" weight="600" color="tertiary" mono selectable>{{ tx.error }}</Text>
					</Flex>

					<Flex direction="column" gap="10" :class="$style.key_value">
						<Text size="12" weight="600" color="secondary">Type</Text>

						<Flex v-if="tx.message_types.length" align="center" gap="8" wrap="wrap">
							<MessageTypeBadge v-for="type in tx.message_types" :key="type" :types="[type]" />
						</Flex>
						<Text v-else size="13" weight="600" color="tertiary">No Message Types</Text>
					</Flex>

					<Flex direction="column" gap="10" :class="$style.key_value">
						<Text size="12" weight="600" color="secondary">Block</Text>

						<NuxtLink :to="`/block/${tx.height}`">
							<Outline>
								<Flex align="center" gap="6">
									<Icon name="block" size="14" color="yellowNew" />

									<Text class="rubik_font" size="13" weight="600" color="yellowNew">{{
			comma(tx.height)
		}}</Text>
								</Flex>
							</Outline>
						</NuxtLink>
					</Flex>

					<Flex direction="column" gap="8" :class="$style.key_value">
						<Text size="12" weight="600" color="secondary">Hash</Text>
						<BadgeValue :text="tx.hash" />
					</Flex>

					<Flex v-if="tx.memo" direction="column" gap="6">
						<Text size="12" weight="600" color="secondary">Memo</Text>

						<Flex align="center" gap="6">
							<CopyButton :text="tx.memo" />
							<Text size="12" height="140" weight="600" color="tertiary" mono selectable
								:class="$style.memo">
								{{ tx.memo }}
							</Text>
						</Flex>
					</Flex>

					<!-- <Flex direction="column" gap="10">
						<Text size="12" weight="600" color="secondary">Gas Used</Text>

						<div :class="$style.gas_bar">
							<div :style="{
			width: `${(tx.gas_used * 100) / tx.gas_wanted > 100 ? 100 : (tx.gas_used * 100) / tx.gas_wanted}%`,
		}" :class="[$style.gas_used, (tx.gas_used * 100) / tx.gas_wanted > 100 && $style.error]" />
						</div>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="secondary">{{ ((tx.gas_used * 100) /
			tx.gas_wanted).toFixed(2)
								}}%</Text>
							<Text size="12" weight="600" color="tertiary">{{ comma(tx.gas_used) }} / {{
			comma(tx.gas_wanted)
		}}</Text>
						</Flex>
					</Flex> -->

					<Flex direction="column" gap="16">
						<Text size="12" weight="600" color="secondary">Details</Text>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="yellowNew" :class="$style.txDetailsName"> Signer</Text>
							<Flex align="center" gap="6" :class="$style.txDetailsValue">
								<AddressBadge :hash="tx.signers[0]" color="secondary" />

								<CopyButton :text="tx.signers[0]" size="16" />
							</Flex>
							<!-- <Text size="12" weight="600" color="secondary"> {{ splitAddress(tx.signers[0]) }} </Text> -->
						</Flex>
						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="yellowNew" :class="$style.txDetailsName"> Events</Text>
							<Text size="12" weight="600" color="secondary" :class="$style.txDetailsValue"> {{
			tx.events_count }}
							</Text>
						</Flex>
						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="yellowNew" :class="$style.txDetailsName">
								Messages</Text>
							<Text size="12" weight="600" color="secondary" :class="$style.txDetailsValue"> {{
			tx.messages_count
		}} </Text>
						</Flex>
						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="yellowNew" :class="$style.txDetailsName"> Fee </Text>
							<div :class="$style.txDetailsValue">
								<AmountInCurrency :amount="{ value: tx.fee, decimal: 6 }"
									:styles="{ amount: { color: 'secondary' }, currency: { color: 'secondary' } }" />
							</div>
						</Flex>
						<Flex v-if="tx.codespace" align="center" justify="between">
							<Text size="12" weight="600" color="yellowNew"
								:class="$style.txDetailsName">Codespace</Text>
							<Text size="12" weight="600" color="secondary" no-wrap style="text-transform: capitalize"
								:class="$style.txDetailsValue">
								{{ tx.codespace }}</Text>
						</Flex>
						<Flex v-if="tx.timeout_height" align="center" justify="between">
							<Text size="12" weight="600" color="yellowNew" :class="$style.txDetailsName">Timeout
								Height</Text>
							<Text size="12" weight="600" color="secondary" no-wrap :class="$style.txDetailsValue"> {{
			comma(tx.timeout_height) }}</Text>
						</Flex>
					</Flex>
				</Flex>
			</Flex>

			<Flex direction="column" gap="0" wide :class="$style.events_wrapper">
				<Flex direction="column" wide :class="$style.events_wrapper_container">
					<Flex align="center" justify="between" :class="$style.tabs_wrapper">
						<Flex gap="4" :class="$style.tabs">
							<Flex @click="activeTab = 'messages'" align="center" gap="6"
								:class="[$style.tab, activeTab === 'messages' && $style.active]">
								<Icon name="message" size="14"
									:color="activeTab === 'messages' ? 'yellowNew' : 'secondary'" />

								<Text class="openSans_font" size="14" weight="600">Messages</Text>
							</Flex>

							<Flex @click="activeTab = 'events'" align="center" gap="6"
								:class="[$style.tab, activeTab === 'events' && $style.active]">
								<Icon name="zap" size="14"
									:color="activeTab === 'events' ? 'yellowNew' : 'secondary'" />

								<Text class="openSans_font" size="14" weight="600">Events</Text>
							</Flex>
						</Flex>
					</Flex>

					<Flex v-if="activeTab === 'messages'" :class="$style.inner">
						<MessagesTable :messages="messages" />
					</Flex>
					<Flex v-if="activeTab === 'events'" :class="$style.inner">
						<Events :tx="tx" />
					</Flex>
				</Flex>

			</Flex>

		</Flex>
	</Flex>
</template>

<style module>
.txDetailsName {
	width: 130px;
	height: 32px;
	border-radius: 4px 4px 4px 4px;
	border: 1px solid rgba(255, 255, 255, 0.3);
	display: flex;
	justify-content: center;
	align-items: center
}

.txDetailsValue {
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

.content {
	display: grid;
	grid-template-columns: 384px 1fr;
}

.data {
	max-width: 384px;
	border-radius: 0 0 0 8px;
	background: rgba(255, 255, 255, 0.1);
	padding: 20px;

	.main {
		background: rgba(255, 255, 255, 0.05);
		padding: 16px;
		border-radius: 4px;
		height: 100%;

		& .key_value {
			max-width: 100%;
		}
	}
}

.gas_bar {
	width: 100%;
	height: 6px;

	border-radius: 50px;
	background: linear-gradient(var(--op-10), var(--op-5));

	& .gas_used {
		height: 6px;

		border-radius: 50px;
		background: var(--green);
		box-shadow: 0 0 6px rgba(10, 222, 112, 80%);

		&.error {
			background: var(--red);
			box-shadow: 0 0 6px var(--red);
		}
	}
}

.badge {
	border-radius: 5px;
	background: var(--op-5);
	box-shadow: inset 0 0 0 1px var(--op-10);

	padding: 4px 6px;
}

.events_wrapper {
	min-width: 0;
	background: rgba(255, 255, 255, 0.1);
	padding: 20px 20px 20px 0;
}

.events_wrapper_container {
	height: 100%;
}

.tabs_wrapper {
	min-height: 44px;
	overflow-x: auto;
	background: rgba(255, 255, 255, 0.1);
	padding: 16px 16px 0 16px;
	border-radius: 4px 4px 0 0;
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
		color: var(--txt-tertiary);
		transition: all 0.1s ease;
	}

}

.tab.active {
	border-radius: 4px 4px 4px 4px;
    border: 1px solid rgb(243 57 40 / 50%);
    background: linear-gradient(rgb(243 57 40 / 20%), var(--op-3));

	span {
		color: #FFFFFF;
	}
}

.inner {
	height: 100%;
	border-radius: 0 0 4px 4px;
	background: rgba(255, 255, 255, 0.1);
	padding: 0 16px;
}

.events {
	padding: 16px;
}

.message_types {
	width: fit-content;

	border-radius: 50px;
	background: var(--op-5);
	border: 1px solid var(--op-5);

	padding: 6px 10px;
	margin-bottom: 8px;
}

.event {
	height: 36px;

	cursor: pointer;

	& .left {
		height: 100%;

		& div {
			width: 2px;
			height: 100%;
			background: var(--op-5);
		}
	}

	& .left.first {
		& div {
			&:first-child {
				background: transparent;
			}
		}
	}

	& .left.last {
		& div {
			&:last-child {
				background: transparent;
			}
		}
	}

	& .right {
		min-width: 0;
		height: 100%;

		border-bottom: 1px solid var(--op-5);

		& .text {
			display: inline-block;
			color: var(--txt-tertiary);

			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;

			&>* {
				margin-right: 4px;
			}

			& .tooltip {
				display: inline-block;
			}
		}
	}
}

.memo {
	text-overflow: ellipsis;
	overflow: hidden;
}

@media (max-width: 800px) {
	.content {
		grid-template-columns: 1fr;
	}

	.data {
		padding: 10px;
		max-width: initial;
		min-width: 0;

		border-radius: 4px;
	}

	.txDetailsValue {
		width: 180px;
	}

	.txDetailsName {
		width: 100px;
	}

	.events_wrapper {
		padding: 10px;
	}

}

@media (max-width: 500px) {
	.data {
		.main {
			min-width: initial;
		}
	}
}

@media (max-width: 400px) {
	.tabs_wrapper {
		overflow-x: auto;

		&::-webkit-scrollbar {
			display: none;
		}
	}
}
</style>
