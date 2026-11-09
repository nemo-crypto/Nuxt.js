<script setup>
/**
 * Vendor
 */
import { ref, onMounted, onBeforeUnmount } from "vue"

const emit = defineEmits(["toggle"])
const props = defineProps({
	width: {
		type: [String, Number],
		default: 140,
	},
	label: {
		type: String,
	},
	isOpen: {
		type: Boolean,
	},
})

const triggerEl = ref(null)

const handleFocus = () => {
	triggerEl.value.wrapper.addEventListener("keydown", handleEnterKey)
}

const handleBlur = () => {
	triggerEl.value.wrapper.removeEventListener("keydown", handleEnterKey)
}

const handleEnterKey = (e) => {
	if (e.key !== "Enter") return

	emit("toggle")
}

onMounted(() => {
	if (!triggerEl.value.wrapper) return

	triggerEl.value.wrapper.addEventListener("focus", handleFocus)
	triggerEl.value.wrapper.addEventListener("blur", handleBlur)
})

onBeforeUnmount(() => {
	if (!triggerEl.value.wrapper) return

	triggerEl.value.wrapper.removeEventListener("focus", handleFocus)
	triggerEl.value.wrapper.removeEventListener("blur", handleBlur)
})
</script>

<template>
	<Flex ref="triggerEl" align="center" justify="between" :class="$style.wrapper" :style="{ width: `${width}px` }" tabindex="0">
		<Text size="13" weight="600" color="primary" height="11">
			{{ label }}
		</Text>

		<Icon name="chevron" size="12" color="secondary" :style="{ transform: `rotate(${isOpen ? '180deg' : '0'})` }" />
	</Flex>
</template>

<style module>
.wrapper {
	height: 34px;

	box-shadow: inset 0 0 0 2px var(--op-5);
	border-radius: 6px;
	cursor: pointer;

	padding: 0 10px;

	transition: all 0.2s ease;
}

.wrapper:hover {
	box-shadow: inset 0 0 0 2px var(--op-10);
	background: rgba(255, 255, 255, 0.05);
}

.wrapper:active {
	box-shadow: inset 0 0 0 2px var(--op-20);
}

.wrapper:focus {
	outline: none;
	box-shadow: inset 0 0 0 2px var(--op-20);
}
</style>
