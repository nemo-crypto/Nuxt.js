<script setup>
/** UI */
import Modal from "@/components/ui/Modal.vue"
import Toggle from "@/components/ui/Toggle.vue"
import Tooltip from "@/components/ui/Tooltip.vue"
import Input from "@/components/ui/Input.vue"
import Button from "@/components/ui/Button.vue"

/** Store */
import { useCacheStore } from "@/store/cache"
import { useBookmarksStore } from "@/store/bookmarks"
import { useNotificationsStore } from "@/store/notifications"
const cacheStore = useCacheStore()
const bookmarksStore = useBookmarksStore()
const notificationsStore = useNotificationsStore()

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
})

const alias = ref("")

const onKeydown = (e) => {
	if (e.key === "Enter") {
		handleSave()
	}
}

watch(
	() => props.show,
	() => {
		if (!props.show) {
			alias.value = ""

			document.removeEventListener("keydown", onKeydown)
		} else {
			alias.value = cacheStore.current.bookmark.alias ? cacheStore.current.bookmark.alias : ""

			document.addEventListener("keydown", onKeydown)
		}
	},
)

const handleSave = () => {
	if (!alias.value.length || alias.length > 100) return

	switch (cacheStore.current.bookmark.type) {
		case "Transaction": {
			const bookmarkIdx = bookmarksStore.bookmarks.txs.findIndex((b) => b.id === cacheStore.current.bookmark.id)
			bookmarksStore.bookmarks.txs.splice(bookmarkIdx, 1)
			bookmarksStore.bookmarks.txs.push({
				...cacheStore.current.bookmark,
				alias: alias.value,
			})

			break
		}

		case "Namespace": {
			const bookmarkIdx = bookmarksStore.bookmarks.namespaces.findIndex((b) => b.id === cacheStore.current.bookmark.id)
			bookmarksStore.bookmarks.namespaces.splice(bookmarkIdx, 1)
			bookmarksStore.bookmarks.namespaces.push({
				...cacheStore.current.bookmark,
				alias: alias.value,
			})

			break
		}

		case "Address": {
			const bookmarkIdx = bookmarksStore.bookmarks.addresses.findIndex((b) => b.id === cacheStore.current.bookmark.id)
			bookmarksStore.bookmarks.addresses.splice(bookmarkIdx, 1)
			bookmarksStore.bookmarks.addresses.push({
				...cacheStore.current.bookmark,
				alias: alias.value,
			})

			break
		}

		case "Block": {
			const bookmarkIdx = bookmarksStore.bookmarks.blocks.findIndex((b) => b.id === cacheStore.current.bookmark.id)
			bookmarksStore.bookmarks.blocks.splice(bookmarkIdx, 1)
			bookmarksStore.bookmarks.blocks.push({
				...cacheStore.current.bookmark,
				alias: alias.value,
			})

			break
		}
	}

	notificationsStore.create({
		notification: {
			type: "success",
			icon: "check",
			title: "Alias successfully updated",
			autoDestroy: true,
		},
	})
	emit("onClose")
}
</script>

<template>
	<Modal :show="show" @onClose="emit('onClose')" width="600" focus>
		<Flex direction="column" gap="24">
			<Text size="14" weight="600" color="primary">Edit Bookmark Alias</Text>

			<Flex direction="column" gap="16">
				<Input v-model="alias" placeholder="Bookmark alias" />

				<Button @click="handleSave" type="secondary" size="small" :disabled="!alias.length || alias.length > 100"> Save </Button>
			</Flex>
		</Flex>
	</Modal>
</template>

<style module>
.drop_zone {
	height: 150px;

	border: 2px dashed var(--op-5);
	border-radius: 12px;

	padding: 40px;

	animation: blink 3s ease infinite;
}

.warning {
	border-radius: 6px;
	background: var(--op-5);

	padding: 8px;
}

.disabled {
	opacity: 0.3;
	pointer-events: none;
}

@keyframes blink {
	0% {
		border-color: var(--op-5);
	}

	50% {
		border-color: var(--op-15);
	}

	100% {
		border-color: var(--op-5);
	}
}
</style>
