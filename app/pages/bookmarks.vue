<script setup>
/** Components */
import BookmarkItem from "@/components/modules/bookmarks/BookmarkItem.vue"

/** UI */
import Button from "@/components/ui/Button.vue"
import { Dropdown, DropdownItem, DropdownDivider } from "@/components/ui/Dropdown"

/** Store */
import { useAppStore } from "@/store/app"
import { useModalsStore } from "@/store/modals"
import { useBookmarksStore } from "@/store/bookmarks"
import { useNotificationsStore } from "@/store/notifications"
const appStore = useAppStore()
const modalsStore = useModalsStore()
const bookmarksStore = useBookmarksStore()
const notificationsStore = useNotificationsStore()

useExplorerSeo({
	title: () => `My Bookmarks`,
	description: () => "Manage your locally saved Nubit blocks, transactions, addresses and namespaces.",
	noindex: true,
})

const cache = reactive({
	bookmark: null,
	type: null,
})

const handleRemove = (type, bookmark) => {
	cache.bookmark = bookmark
	cache.type = type

	const bookmarkIdx = bookmarksStore.bookmarks[type].findIndex((b) => b.id === bookmark.id)

	if (bookmarkIdx >= 0) {
		bookmarksStore.bookmarks[type].splice(bookmarkIdx, 1)

		notificationsStore.create({
			notification: {
				type: "info",
				icon: "check",
				title: `Bookmark removed`,
				autoDestroy: true,
				actions: [
					{
						name: "Undo",
						callback: () => {
							bookmarksStore.bookmarks[cache.type].push(cache.bookmark)
						},
					},
				],
			},
		})
	}
}

const handleImport = () => {
	modalsStore.open("import")
}

const handleExport = () => {
	if (!bookmarksStore.hasBookmarks) return

	const blob = new Blob([JSON.stringify(JSON.parse(localStorage.bookmarks), null, "\t")], { type: "text/json" })
	const link = document.createElement("a")

	link.download = "nubit_bookmarks.json"
	link.href = window.URL.createObjectURL(blob)
	link.dataset.downloadurl = ["text/json", link.download, link.href].join(":")

	const evt = new MouseEvent("click", {
		view: window,
		bubbles: true,
		cancelable: true,
	})

	link.dispatchEvent(evt)
	link.remove()
}

const handleClearBookmarks = () => {
	if (!bookmarksStore.hasBookmarks) return

	appStore.createConfirmation({
		title: `Do you want to clear your bookmarks?`,
		description: "Your local storage for bookmarks will be cleared",

		buttons: {
			confirm: {
				color: "red",
				title: "Yes, delete all bookmarks",
			},
			cancel: {
				title: "Cancel",
			},
		},

		confirmCb: () => {
			localStorage.removeItem("bookmarks")
			bookmarksStore.clearBookmarks()

			notificationsStore.create({
				notification: {
					type: "info",
					icon: "check",
					title: `Your bookmarks successfully cleared`,
					autoDestroy: true,
				},
			})

			modalsStore.close("confirmation")
		},
		cancelCb: () => {
			modalsStore.close("confirmation")
		},
	})
}
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Breadcrumbs
			:items="[
				{ link: '/', name: 'Home' },
				{ link: '/bookmarks', name: `My Bookmarks` },
			]"
			:class="$style.breadcrumbs"
		/>

		<Flex wide direction="column" gap="0">
			<Flex justify="between" :class="$style.header">
				<Flex align="center" gap="8">
					<Text as="h1" size="20" weight="600" color="primary">My Bookmarks</Text>
				</Flex>

				<Flex align="center" gap="8">
					<Dropdown>
						<Button type="secondary" size="mini">
							<Icon name="dots" size="16" color="secondary" />
						</Button>

						<template #popup>
							<DropdownItem @click="handleImport">
								<Flex align="center" gap="8">
									<Icon name="upload" size="12" color="secondary" />
									Import Bookmarks
								</Flex>
							</DropdownItem>
							<DropdownDivider />
							<DropdownItem @click="handleClearBookmarks" :disabled="!bookmarksStore.hasBookmarks">
								<Flex align="center" gap="8">
									<Icon name="trash" size="12" color="red" />
									Clear Bookmarks
								</Flex>
							</DropdownItem>
						</template>
					</Dropdown>
				</Flex>
			</Flex>

			<Flex wide direction="column" gap="0" :class="$style.contentList">
				<Flex direction="column" gap="8" :class="$style.content">
					<Text size="16" weight="600" color="primary">Namespaces</Text>

					<Flex v-if="bookmarksStore.bookmarks.namespaces.length" direction="column" gap="4">
						<BookmarkItem
							v-for="bookmark in bookmarksStore.bookmarks.namespaces"
							:item="bookmark"
							:key="bookmark"
							@onRemove="handleRemove('namespaces', bookmark)"
						/>
					</Flex>
					<Text v-else size="14" weight="500" color="tertiary" :class="$style.contentNull">
						There is no bookmarks for namespaces
					</Text>
				</Flex>

				<Flex direction="column" gap="8" :class="$style.content">
					<Text size="16" weight="600" color="primary">Addresses</Text>

					<Flex v-if="bookmarksStore.bookmarks.addresses.length" direction="column" gap="4">
						<BookmarkItem
							v-for="bookmark in bookmarksStore.bookmarks.addresses"
							:item="bookmark"
							:key="bookmark"
							@onRemove="handleRemove('addresses', bookmark)"
						/>
					</Flex>
					<Text v-else size="14" weight="500" color="tertiary" :class="$style.contentNull">
						There is no bookmarks for addresses
					</Text>
				</Flex>

				<Flex direction="column" gap="8" :class="$style.content">
					<Text size="16" weight="600" color="primary">Transactions</Text>

					<Flex v-if="bookmarksStore.bookmarks.txs.length" direction="column" gap="4">
						<BookmarkItem
							v-for="bookmark in bookmarksStore.bookmarks.txs"
							:item="bookmark"
							:key="bookmark"
							@onRemove="handleRemove('txs', bookmark)"
						/>
					</Flex>
					<Text v-else size="14" weight="500" color="tertiary" :class="$style.contentNull">
						There is no bookmarks for transactions
					</Text>
				</Flex>

				<Flex direction="column" gap="8" :class="$style.content">
					<Text size="16" weight="600" color="primary">Blocks</Text>

					<Flex v-if="bookmarksStore.bookmarks.blocks.length" direction="column" gap="4">
						<BookmarkItem
							v-for="bookmark in bookmarksStore.bookmarks.blocks"
							:item="bookmark"
							:key="bookmark"
							@onRemove="handleRemove('blocks', bookmark)"
						/>
					</Flex>
					<Text v-else size="14" weight="500" color="tertiary" :class="$style.contentNull">
						There is no bookmarks for blocks
					</Text>
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
	margin-bottom: 20px;
}

.header {
	border-radius: 8px 8px 0 0;
	background: rgba(255, 255, 255, 0.1);
	padding: 20px 20px 0 20px;
}

.contentList {
	background: rgba(255, 255, 255, 0.1);
	padding: 20px 20px;
	border-radius: 4px 4px 4px 4px;
}

.contentNull {
	margin-top: 10px;
}

.content {
	background: rgba(255, 255, 255, 0.05);
	border-radius: 4px 4px 4px 4px;
	padding: 20px 30px;
	margin-bottom: 10px;

	&:last-of-type {
		border-radius: 4px 4px 8px 8px;
	}
}

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}
}
</style>
