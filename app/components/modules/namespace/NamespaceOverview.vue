import { getNamespaceID } from '~/services/utils';
<script setup>
/** UI */
import Button from "@/components/ui/Button.vue"
import { Dropdown, DropdownItem, DropdownDivider } from "@/components/ui/Dropdown"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Tables */
import BlobsTable from "./tables/BlobsTable.vue"
import MessagesTable from "./tables/MessagesTable.vue"

/** Services */
import { comma, space, formatBytes, getNamespaceID } from "@/services/utils"

/** API */
import { fetchNamespaceBlobs, fetchNamespaceMessagesById, fetchNamespaceRollups } from "@/services/api/namespace"

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
	namespace: {
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

const tabs = ref([
	{
		name: "Blobs",
		icon: "blob",
	},
	{
		name: "Messages",
		icon: "message",
	},
])
const activeTab = ref(tabs.value[0].name)

const isRefetching = ref(false)
const messages = ref([])
const blobs = ref([])
const rollups = ref([])

const page = ref(1)
const pages = computed(() => {
	return Math.ceil((activeTab.value === "Blobs" ? props.namespace.blobs_count : props.namespace.pfb_count) / 10)
})
const handleNext = () => {
	if (page.value === pages.value) return
	page.value += 1
}
const handlePrev = () => {
	if (page.value === 1) return
	page.value -= 1
}

const getBlobs = async () => {
	isRefetching.value = true

	const { data } = await fetchNamespaceBlobs({
		id: props.namespace.namespace_id,
		version: props.namespace.version,
		offset: (page.value - 1) * 10,
		limit: 10,
	})

	if (data.value?.length) {
		blobs.value = data.value
		cacheStore.current.blobs = blobs.value
	}

	isRefetching.value = false
}
const getMessages = async () => {
	isRefetching.value = true

	const { data } = await fetchNamespaceMessagesById({
		id: props.namespace.namespace_id,
		version: props.namespace.version,
		offset: (page.value - 1) * 10,
		limit: 10,
	})

	if (data.value?.length) {
		messages.value = data.value
		cacheStore.current.messages = messages.value
	}

	isRefetching.value = false
}
const getRollups = async () => {
	const { data } = await fetchNamespaceRollups({
		id: props.namespace.namespace_id,
		version: props.namespace.version,
	})

	if (data.value?.length) {
		rollups.value = data.value
	}
}

/** Initital fetch for blobs and rollups */
await getBlobs()
await getRollups()

onMounted(() => {
	isBookmarked.value = !!bookmarksStore.bookmarks.namespaces.find((t) => t.id === props.namespace.namespace_id)
})

/** Refetch Blobs/Messages on new page */
watch(
	() => page.value,
	() => {
		switch (activeTab.value) {
			case "Blobs":
				getBlobs()
				break

			case "Messages":
				getMessages()
				break
		}
	},
)

/** Refetch Blobs/Messages on tab changing */
watch(
	() => activeTab.value,
	() => {
		page.value = 1

		switch (activeTab.value) {
			case "Blobs":
				getBlobs()
				break

			case "Messages":
				getMessages()
				break
		}
	},
)

const handleBookmark = () => {
	if (!isBookmarked.value) {
		bookmarksStore.bookmarks.namespaces.push({
			id: props.namespace.namespace_id,
			type: "Namespace",
			ts: new Date().getTime(),
		})
		isBookmarked.value = true

		notificationsStore.create({
			notification: {
				type: "success",
				icon: "check",
				title: "Namespace added to bookmarks",
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
		const bookmarkIdx = bookmarksStore.bookmarks.namespaces.findIndex((t) => t.id === props.namespace.namespace_id)
		bookmarksStore.bookmarks.namespaces.splice(bookmarkIdx, 1)
		isBookmarked.value = false

		notificationsStore.create({
			notification: {
				type: "success",
				icon: "check",
				title: "Namespace removed from bookmarks",
				autoDestroy: true,
			},
		})
	}
}

const handleViewRawNamespace = () => {
	cacheStore.current._target = "namespace"
	modalsStore.open("rawData")
}

const handleViewRawBlobs = () => {
	cacheStore.current._target = "blobs"
	modalsStore.open("rawData")
}

const handleViewRawMessages = () => {
	cacheStore.current._target = "messages"
	modalsStore.open("rawData")
}
</script>

<template>
	<Flex direction="column" gap="0">
		<Flex align="center" justify="between" :class="$style.header">
			<Flex align="center" gap="8">
				<!-- <Icon name="namespace" size="14" color="primary" /> -->
				<Text as="h1" size="20" weight="600" color="primary">Namespace</Text>
			</Flex>

			<Flex align="center" gap="8">
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
						<Icon name="dots" size="16" color="primary" />
						More
					</Button>

					<template #popup>
						<DropdownItem class="openSans_font" @click="modalsStore.open('pfb')"> Submit data blob </DropdownItem>
						<DropdownDivider />
						<DropdownItem class="openSans_font" @click="handleViewRawNamespace"> View Raw Namespace </DropdownItem>
						<DropdownItem class="openSans_font" @click="handleViewRawBlobs"> View Raw Blobs </DropdownItem>
						<DropdownItem class="openSans_font" @click="handleViewRawMessages"> View Raw Messages </DropdownItem>
					</template>
				</Dropdown> -->
			</Flex>
		</Flex>

		<Flex gap="0" :class="$style.content">
			<Flex direction="column" :class="$style.data">
				<Flex direction="column" gap="24" :class="$style.main">
					<Flex direction="column" gap="8" :class="$style.key_value">
						<Text size="12" weight="600" color="secondary">Namespace ID</Text>

						<Flex align="center" gap="10">
							<Text class="rubik_font" size="13" weight="600" color="primary">{{ space(getNamespaceID(namespace.namespace_id)) }} </Text>

							<CopyButton :text="getNamespaceID(namespace.namespace_id)" />
						</Flex>
					</Flex>

					<Flex
						v-if="getNamespaceID(namespace.namespace_id) !== namespace.name"
						direction="column"
						gap="8"
						:class="$style.key_value"
					>
						<Text size="12" weight="600" color="secondary">Alias</Text>

						<Text size="13" weight="600" color="primary">
							{{ namespace.name }}
						</Text>
					</Flex>

					<Flex direction="column" gap="8" :class="$style.key_value">
						<Text size="12" weight="600" color="secondary">Size</Text>

						<Text size="13" weight="600" color="primary">{{ formatBytes(namespace.size) }} </Text>
					</Flex>

					<Flex direction="column" gap="16">
						<Text size="12" weight="600" color="secondary">Details</Text>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="yellowNew" :class="$style.blockDetailsName"> Submit Blob Payment</Text>
							<Text size="12" weight="600" color="secondary" :class="$style.blockDetailsValue"> {{ comma(namespace.pfb_count) }} </Text>
						</Flex>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="yellowNew" :class="$style.blockDetailsName"> Blobs</Text>
							<Text size="12" weight="600" color="secondary" :class="$style.blockDetailsValue"> {{ comma(namespace.blobs_count) }} </Text>
						</Flex>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="yellowNew" :class="$style.blockDetailsName"> Version</Text>
							<Text size="12" weight="600" color="secondary" :class="$style.blockDetailsValue"> {{ namespace.version }} </Text>
						</Flex>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="yellowNew" :class="$style.blockDetailsName"> Reserved</Text>
							<Text size="12" weight="600" color="secondary" :class="$style.blockDetailsValue" :style="{ textTransform: 'capitalize' }">
								{{ namespace.reserved }}
							</Text>
						</Flex>
					</Flex>

					<Flex v-if="rollups.length" direction="column" gap="16">
						<div :class="$style.horizontal_divider" />

						<Text size="12" weight="600" color="secondary">Used By Rollups</Text>
						<Flex direction="row" gap="8">
							<Tooltip v-for="r in rollups" :key="r.slug">
								<NuxtLink :to="`/rollup/${r.slug}`">
									<Flex align="center" justify="center" :class="$style.avatar_container">
										<img :src="r.logo" :class="$style.avatar_image" />
									</Flex>
								</NuxtLink>

								<template #content>
									<Flex direction="column" gap="4">
										<Text color="secondary">{{ r.name }}</Text>
									</Flex>
								</template>
							</Tooltip>
						</Flex>
					</Flex>
				</Flex>
			</Flex>

			<Flex direction="column" gap="0" wide :class="$style.txs_wrapper">
				<Flex align="center" justify="between" :class="$style.tabs_wrapper">
					<Flex gap="4" :class="$style.tabs">
						<Flex
							@click="activeTab = tab.name"
							v-for="tab in tabs"
							:key="tab.name"
							align="center"
							gap="6"
							:class="[$style.tab, activeTab === tab.name && $style.active]"
						>
							<Icon :name="tab.icon" size="16" :color="activeTab === tab.name ? 'yellowNew' : 'secondary'" />
							<Text size="14" weight="600" :color="activeTab === tab.name ? 'yellowNew' : 'secondary'">{{ tab.name }}</Text>
						</Flex>
					</Flex>
				</Flex>

				<Flex direction="column" justify="center" gap="8" :class="[$style.table, isRefetching && $style.disabled]">
					<!-- Blobs Table -->
					<template v-if="activeTab === 'Blobs'">
						<BlobsTable v-if="blobs.length" :blobs="blobs" :namespace="namespace" />

						<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
							<Text size="13" weight="600" color="secondary" align="center"> No blobs </Text>
							<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
								This namespace does not contain any blobs
							</Text>
						</Flex>
					</template>
					<!-- Messages Table -->
					<template v-if="activeTab === 'Messages'">
						<MessagesTable v-if="messages.length" :messages="messages" />

						<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
							<Text size="13" weight="600" color="secondary" align="center"> No messages </Text>
							<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
								This namespace does not contain any messages
							</Text>
						</Flex>
					</template>

					<!-- Pagination -->
					<Flex v-if="pages > 1" align="center" gap="6" :class="$style.pagination">
						<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
							<Icon name="arrow-left-stop" size="12" color="primary" />
						</Button>
						<Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
							<Icon name="arrow-left" size="12" color="primary" />
						</Button>

						<Button type="secondary" size="mini" disabled>
							<Text class="openSans_font" size="12" weight="600" color="primary"> {{ comma(page) }} of {{ comma(pages) }} </Text>
						</Button>

						<Button @click="handleNext" type="secondary" size="mini" :disabled="page === pages">
							<Icon name="arrow-right" size="12" color="primary" />
						</Button>
						<Button @click="page = pages" type="secondary" size="mini" :disabled="page === pages">
							<Icon name="arrow-right-stop" size="12" color="primary" />
						</Button>
					</Flex>
				</Flex>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.blockDetailsName {
	width: 170px;
	height: 32px;
	border-radius: 4px 4px 4px 4px;
	border: 1px solid rgba(255, 255, 255, 0.3);
	display: flex;
	justify-content: center;
	align-items: center
}

.blockDetailsValue {
	width: 130px;
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

	.horizontal_divider {
		width: 100%;
		height: 2px;
		background: var(--op-5);

		margin-top: 4px;
		margin-bottom: 4px;
	}
}

.txs_wrapper {
	min-width: 0;
	background: rgba(255, 255, 255, 0.1);
	padding: 20px 20px 20px 0;
	border-radius: 0 0 8px 0;
}

.tabs_wrapper {
	min-height: 44px;
	overflow-x: auto;
	background: rgba(255, 255, 255, 0.05);
	padding: 16px 16px 0 16px;
	border-radius: 8px 8px 0 0;
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
}

.tab.active {
	border-radius: 4px 4px 4px 4px;
    border: 1px solid rgb(243 57 40 / 50%);
    background: linear-gradient(rgb(243 57 40 / 20%), var(--op-3));
}

.table {
	height: 100%;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 0 0 8px 8px;
	padding: 0 16px 16px 16px;
}

.table.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.empty {
	padding-top: 16px;
}

.pagination {
	padding: 0 16px 16px 0;
}

.avatar_container {
	position: relative;
	width: 25px;
	height: 25px;
	overflow: hidden;
	border-radius: 50%;
}

.avatar_image {
	width: 100%;
	height: 100%;
	object-fit: cover;
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
		width: 120px;
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
