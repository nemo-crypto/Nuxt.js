<script setup>
/**
 * Vendor
 */
import { ref, watch, computed } from "vue"

const emit = defineEmits(["update:modelValue", "focus", "blur"])
const props = defineProps({
	size: {
		type: String,
		default: "medium",
	},
	type: {
		type: String,
	},
	label: {
		type: String,
	},
	leftText: {
		type: String,
		required: false,
	},
	suffix: {
		type: String,
		required: false,
	},
	icon: {
		type: String,
	},
	placeholder: {
		type: String,
		required: true,
	},
	modelValue: {
		type: [String, Number],
	},
	disabled: {
		type: Boolean,
	},
	autofocus: {
		type: Boolean,
		default: false,
	},
	disablePaste: {
		type: Boolean,
		default: false,
	},
})

const isFocused = ref(false)

const inputEl = ref(null)
defineExpose({ inputEl })

const text = ref(props.modelValue ? props.modelValue : "")

onMounted(() => {
	if (props.autofocus) {
		inputEl.value.focus()
	}
})

watch(
	() => props.modelValue,
	() => {
		text.value = props.modelValue
	},
)

const getInputType = computed(() => {
	if (!!props.type) return props.type
	return "text"
})

const handleInput = () => {
	if (props.disabled) return

	if (props.type === "number") {
		emit("update:modelValue", isNaN(parseFloat(text.value)) ? text.value : parseFloat(text.value))
	} else {
		emit("update:modelValue", text.value)
	}
}

const handleKeydown = (e) => {
	if (props.disabled && e.key !== "Tab") e.preventDefault()
	if (props.type == "number") {
		if (e.key === "-") e.preventDefault()
	}
}

const handleClick = () => {
	if (inputEl.value) inputEl.value.focus()
}

const handleFocus = () => {
	isFocused.value = true
	emit("focus")
}

const handleBlur = () => {
	isFocused.value = false
	emit("blur")
}

const handlePaste = (e) => {
	if (props.disablePaste) e.preventDefault()
}
</script>

<template>
	<Flex direction="column" gap="8">
		<Flex v-if="label" align="center" justify="between">
			<Text size="12" weight="600" color="secondary">{{ label }}</Text>

			<slot name="rightText" />
		</Flex>

		<div ref="base" @click="handleClick" :class="[$style.base, isFocused && $style.focused, disabled && $style.disabled, $style[size]]">
			<Flex align="center" gap="6" wide :class="$style.left">
				<Icon v-if="icon" :name="icon" size="14" color="tertiary" />
				<Text size="13" weight="600" color="tertiary">{{ leftText }}</Text>

				<input
					ref="inputEl"
					:type="getInputType"
					v-model="text"
					@input="handleInput"
					@focus="handleFocus"
					@blur="handleBlur"
					@keydown="handleKeydown"
					@paste="handlePaste"
					:placeholder="placeholder"
					spellcheck="false"
				/>
			</Flex>

			<Text size="12" weight="600" color="tertiary">{{ suffix }}</Text>
		</div>
	</Flex>
</template>

<style module>
.base {
	display: flex;
	align-items: center;
	justify-content: space-between;

	border-radius: 6px;
	box-shadow: inset 0 0 0 1px var(--op-5);
	background: var(--op-3);
	padding: 0 8px;
	cursor: text;

	transition: all 0.2s ease;
}

.base.medium {
	height: 32px;
}

.base.small {
	height: 28px;
}

.base:hover {
	box-shadow: inset 0 0 0 1px var(--op-10);
}

.base.focused {
	box-shadow: inset 0 0 0 1px var(--op-20);
}

.base.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.base input {
	border: none;
	outline: none;
	width: 100%;
	height: 100%;
	padding: 0;

	font-size: 13px;
	font-weight: 600;
	color: var(--txt-primary);
}

.base input::placeholder {
	font-weight: 500;
	color: var(--txt-tertiary);
}

.base input::-webkit-outer-spin-button,
.base input::-webkit-inner-spin-button {
	-webkit-appearance: none;
	margin: 0;
}

.left {
	height: 100%;
}
</style>
