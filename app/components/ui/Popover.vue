<script setup>
/**
 * Composable
 */
import { useOutside } from "@/composables/outside"
let removeOutside = null

const props = defineProps({
	open: {
		type: Boolean,
		default: false,
	},
	width: {
		type: String,
		default: null,
	},
	height: {
		type: String,
		default: null,
	},
	side: {
		type: String,
		default: "left",
	},
})
const emit = defineEmits(["onClose"])

const triggerEl = ref()
const cardEl = ref()

const popoverStyles = reactive({})

const onClose = () => {
	emit("onClose")
}

const onKeydown = (e) => {
	if (e.code === "Escape") onClose()
}

watch(
	() => props.open,
	() => {
		if (props.open) {
			const triggerRect = triggerEl.value.getBoundingClientRect()

			popoverStyles.top = `${triggerRect.y + triggerRect.height + 8}px`
			popoverStyles[props.side] = `${props.side === "left" ? triggerRect.x : window.innerWidth - triggerRect.x - triggerRect.width}px`

			document.addEventListener("scroll", onClose)
			document.addEventListener("keydown", onKeydown)

			nextTick(() => {
				removeOutside = useOutside(cardEl.value, onClose)
			})
		} else {
			document.removeEventListener("scroll", onClose)
			document.removeEventListener("keydown", onKeydown)
			removeOutside()
		}
	},
)
</script>

<template>
	<Flex>
		<div ref="triggerEl">
			<slot />
		</div>

		<ClientOnly>
			<teleport to="#popover">
				<div v-if="open" :class="$style.canvas" />

				<Transition name="fastfade">
					<div v-if="open" :style="popoverStyles" :class="$style.popover">
						<div ref="cardEl" :style="{ width: `${width}px`, height: `${height}px` }" :class="$style.card">
							<slot name="content" />
						</div>
					</div>
				</Transition>
			</teleport>
		</ClientOnly>
	</Flex>
</template>

<style module>
.popover {
	position: fixed;
	z-index: 2010;
}

.canvas {
	position: fixed;
	inset: 0;
	z-index: 2005;
}

.card {
	overflow: hidden;

	border-radius: 6px;
	background: var(--card-background);
	box-shadow: inset 0 0 0 1px var(--op-5), 0 14px 34px rgba(0, 0, 0, 15%), 0 4px 14px rgba(0, 0, 0, 5%);

	padding: 12px;
}
</style>
