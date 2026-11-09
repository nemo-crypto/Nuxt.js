<script setup>
/** UI */
import Modal from "@/components/ui/Modal.vue"
import Toggle from "@/components/ui/Toggle.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Store */
import { useBookmarksStore } from "@/store/bookmarks"
import { useNotificationsStore } from "@/store/notifications"
const bookmarksStore = useBookmarksStore()
const notificationsStore = useNotificationsStore()

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
})

const mergeEffect = ref(false)

watch(
	() => props.show,
	() => {
		if (!props.show) {
			mergeEffect.value = false
		}
	},
)

const handleDrop = (e) => {
	const file = e.dataTransfer.files[0]

	if (!file.type.match("application/json")) {
		notificationsStore.create({
			notification: {
				type: "error",
				icon: "close",
				title: "Upload only JSON format",
				autoDestroy: true,
			},
		})
	}

	const reader = new FileReader()
	reader.onloadend = function (e) {
		const result = JSON.parse(this.result)

		if (
			result &&
			Object.keys(result).length === 4 &&
			Array.isArray(result.txs) &&
			Array.isArray(result.addresses) &&
			Array.isArray(result.blocks) &&
			Array.isArray(result.namespaces)
		) {
			if (!mergeEffect.value) {
				notificationsStore.create({
					notification: {
						type: "success",
						icon: "bookmark-plus",
						title: "Successfully parsed & imported",
						autoDestroy: true,
					},
				})

				localStorage.bookmarks = result
				bookmarksStore.bookmarks = result
			} else {
				notificationsStore.create({
					notification: {
						type: "success",
						icon: "bookmark-plus",
						title: "Successfully parsed & imported & merged",
						autoDestroy: true,
					},
				})

				let merged = {}

				Object.keys(bookmarksStore.bookmarks).forEach((b) => {
					const updates = Object.fromEntries([...result[b], ...bookmarksStore.bookmarks[b]].map((o) => [o.id, o]))

					merged[b] = Object.keys(updates).map((u) => updates[u])
				})

				localStorage.bookmarks = merged
				bookmarksStore.bookmarks = merged
			}

			emit("onClose")
		} else {
			notificationsStore.create({
				notification: {
					type: "error",
					icon: "close",
					title: "JSON file is corrupted",
					autoDestroy: true,
				},
			})
		}
	}
	reader.readAsText(file)
}
</script>

<template>
	<Modal :show="show" @onClose="emit('onClose')" width="600" disableTrap>
		<Flex direction="column" gap="24">
			<Text size="14" weight="600" color="primary">Import Bookmarks</Text>

			<Flex
				id="drop_zone"
				@drop.prevent="handleDrop"
				@dragenter.prevent
				@dragover.prevent
				direction="column"
				align="center"
				justify="center"
				gap="16"
				:class="[$style.drop_zone]"
			>
				<Flex v-if="mergeEffect" align="center" gap="12">
					<Tooltip>
						<Icon name="upload" size="24" color="tertiary" />

						<template #content>Imported Bookmarks from file</template>
					</Tooltip>

					<Text size="20" weight="500" color="support">+</Text>

					<Tooltip>
						<Icon name="bookmark-plus" size="24" color="tertiary" />

						<template #content>Your current Bookmarks</template>
					</Tooltip>

					<Text size="20" weight="500" color="support">=</Text>

					<Tooltip>
						<Icon name="merge" size="20" color="green" />

						<template #content>Merged Bookmarks without conflicts</template>
					</Tooltip>
				</Flex>
				<Icon v-else name="upload" size="24" color="tertiary" />

				<Text size="13" weight="500" height="140" color="tertiary" align="center" style="max-width: 180px">
					Drop <Text weight="600" color="secondary">JSON</Text> file with saved bookmarks to import
				</Text>
			</Flex>

			<Flex v-if="bookmarksStore.hasBookmarks" gap="8" :class="$style.warning">
				<Icon name="info" size="12" color="orange" />
				<Flex direction="column" gap="4">
					<Text size="12" weight="600" color="orange"> Warning! You have existing bookmarks.</Text>

					<Text size="12" weight="600" height="140" color="tertiary">
						Importing a JSON file will <Text color="secondary">erase</Text> your existing bookmarks and set new ones from the
						file.<br />Toggle <Text color="secondary">Merge Effect</Text> depending on your purposes.
					</Text>
				</Flex>
			</Flex>

			<Flex justify="between" :class="[!bookmarksStore.hasBookmarks && $style.disabled]">
				<Flex direction="column" gap="6">
					<Text size="12" weight="600" color="primary">Merge Effect</Text>
					<Text size="12" weight="500" color="tertiary">Merge existing bookmarks with imported bookmarks</Text>
				</Flex>

				<Toggle v-model="mergeEffect" />
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
