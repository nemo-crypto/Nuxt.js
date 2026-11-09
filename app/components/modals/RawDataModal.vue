<script setup>
/** Vendor */
import { EditorView } from "codemirror"
import { EditorState } from "@codemirror/state"
import { keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, highlightSpecialChars, drawSelection } from "@codemirror/view"
import { bracketMatching } from "@codemirror/language"
import { defaultKeymap } from "@codemirror/commands"
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search"
import { json } from "@codemirror/lang-json"

/** Services */
import { customViewerTheme } from "@/services/editor/theme.js"

/** UI */
import Modal from "@/components/ui/Modal.vue"
import Button from "@/components/ui/Button.vue"

/** Store */
import { useCacheStore } from "@/store/cache"
import { useNotificationsStore } from "@/store/notifications"
const cacheStore = useCacheStore()
const notificationsStore = useNotificationsStore()

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
})

const editorRef = ref(null)

watch(
	() => props.show,
	() => {
		nextTick(() => {
			const state = EditorState.create({
				doc: JSON.stringify(cacheStore.current[cacheStore.current._target], null, 2),
				extensions: [
					lineNumbers(),
					highlightActiveLine(),
					highlightActiveLineGutter(),
					highlightSpecialChars(),
					drawSelection(),
					bracketMatching(),
					highlightSelectionMatches(),
					keymap.of([...defaultKeymap, ...searchKeymap]),
					customViewerTheme,
					EditorState.readOnly.of(true),
					EditorView.lineWrapping,
					json(),
				],
			})

			const editorView = new EditorView({
				state,
				parent: editorRef.value,
			})
		})
	},
)

const handleCopy = () => {
	window.navigator.clipboard.writeText(JSON.stringify(cacheStore.current[cacheStore.current._target]))

	notificationsStore.create({
		notification: {
			type: "info",
			icon: "check",
			title: "Successfully copied to clipboard",
			autoDestroy: true,
		},
	})
}
</script>

<template>
	<Modal :show="show" @onClose="emit('onClose')" width="600" disable-trap>
		<Flex direction="column" gap="8">
			<Text size="14" weight="600" color="primary">Raw Data Overview</Text>

			<div ref="editorRef" :class="$style.editor" />

			<Button @click="handleCopy" type="secondary" size="small" wide>
				<Icon name="copy" size="12" color="secondary" />
				Copy
			</Button>
		</Flex>
	</Modal>
</template>

<style module>
.data {
	max-height: 200px;
	min-height: 200px;

	user-select: text;
	border-radius: 6px;
	background: rgba(0, 0, 0, 15%);
	box-shadow: inset 0 0 0 1px var(--op-10);
	overflow-x: hidden;

	padding: 16px;

	& .field {
		min-width: 100%;
		width: 0;
		max-height: 200px;

		display: -webkit-box;
		-webkit-box-orient: vertical;
		word-wrap: break-word;

		text-overflow: ellipsis;
		overflow: hidden;
		-webkit-line-clamp: 8;

		&.full {
			overflow: initial;
		}
	}
}

.value_wrapper {
	max-width: 100%;

	& a {
		text-overflow: ellipsis;
		overflow: hidden;
	}
}

.value {
	text-overflow: ellipsis;
	overflow: hidden;
	max-width: 100%;
}

.editor {
	max-height: 500px;
	overflow: auto;
}

@media (max-width: 550px) {
	.metadata {
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
	}
}

@media (max-width: 400px) {
	.buttons {
		flex-direction: column;
		align-items: flex-start;
	}
}
</style>
