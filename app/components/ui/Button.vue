<script setup>
/**
 * Vendor
 */
import { useCssModule } from "vue"
import { NuxtLink } from "#components"

const emit = defineEmits(["onKeybind"])
const props = defineProps({
	size: {
		type: String,
		default: "medium",
	},
	type: {
		type: String,
		default: "primary",
	},
	wide: {
		type: Boolean,
		default: false,
	},
	disabled: {
		type: Boolean,
	},
	loading: {
		type: Boolean,
	},
	link: {
		type: String,
		required: false,
	},
	target: {
		type: String,
		required: false,
	},
})

const style = useCssModule()

const getStyles = () => {
	const hasCorrectSize = ["large", "medium", "small", "mini"].includes(props.size)

	return [
		style.wrapper,
		style[props.type],
		props.wide && style.wide,
		hasCorrectSize && style[props.size],
		props.disabled && style.disabled,
		props.border && style.border,
	]
}
</script>

<template>
	<component
		:is="link ? NuxtLink : 'button'"
		v-bind="{ to: link ? link : null }"
		:target="target"
		:class="[...getStyles(), loading && $style.loading]"
	>
		<slot />
	</component>
</template>

<style module>
.wrapper {
	position: relative;

	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10px;

	cursor: pointer;
	box-sizing: border-box;

	background-clip: padding-box !important;

	color: var(--txt-primary);
	font-weight: 600;
	white-space: nowrap;

	transition: all 0.2s ease;
}

/* Focus */
.wrapper.primary:focus-visible {
	box-shadow: 0 0 0 3px rgba(39, 110, 241, 0.4);
}

.wrapper.secondary:focus-visible {
	box-shadow: 0 0 0 2px var(--op-10);
}

.wrapper.tertiary:focus-visible {
	box-shadow: inset 0 0 0 2px var(--op-5), 0 0 0 2px var(--op-10);
}

.wrapper.white:focus-visible {
	box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
}

.wrapper.loading {
	opacity: 0.5;
	pointer-events: none;
}

.wrapper.wide {
	width: 100%;
	justify-content: center;
}

/** SIZES */
.wrapper.large {
	height: 44px;
	font-size: 14px;
	line-height: 1;
}

.wrapper.medium {
	height: 36px;
	font-size: 14px;
	line-height: 1;
	gap: 8px;

	border-radius: 6px;

	padding: 0 12px;
}

.wrapper.small {
	height: 28px;
	padding: 0 10px;
	font-size: 12px;
	gap: 6px;

	border-radius: 6px;
}

.wrapper.mini {
	height: 26px;

	gap: 6px;

	border-radius: 6px;

	font-size: 12px;

	padding: 0 8px;
}

/** TYPES */
.wrapper.success {
	background: var(--btn-success-bg);
	fill: var(--txt-black);
	color: var(--txt-black);
}
.wrapper.success:hover {
	background: var(--btn-success-bg-hover);
	box-shadow: 0 0 0 0 transparent;
}

.wrapper.error {
	background: var(--btn-error-bg);
	fill: var(--txt-black);
	color: var(--txt-black);
}
.wrapper.error:hover {
	background: var(--btn-error-bg-hover);
	box-shadow: 0 0 0 0 transparent;
}

.wrapper.primary {
	background: var(--blue);
	fill: var(--txt-primary);
}
.wrapper.primary:hover {
	background: var(--btn-primary-bg-hover);
	box-shadow: 0 0 0 0 transparent;
}

.wrapper.white {
	background: var(--btn-white-bg);
	fill: var(--txt-black);
	color: var(--txt-black);
}
.wrapper.white:hover {
	background: var(--btn-white-bg-hover);
}
.wrapper.white:active {
	background: var(--btn-white-bg-active);
}

.wrapper.red {
	background: var(--btn-red-bg);
	fill: var(--txt-black);
	color: var(--txt-black);
}
.wrapper.red:hover {
	background: var(--btn-red-bg-hover);
}
.wrapper.red:active {
	background: var(--btn-red-bg-active);
}

.wrapper.secondary {
	background: linear-gradient(var(--op-10), var(--op-5));
	fill: var(--txt-secondary);
	box-shadow: inset 0 0 0 1px var(--op-10), inset 0 0 8px var(--op-5);
}
.wrapper.secondary:hover {
	box-shadow: inset 0 0 0 1px var(--op-10), inset 0 0 8px var(--op-10);
}
.wrapper.secondary:active {
	box-shadow: inset 0 0 0 1px var(--op-10), inset 0 0 8px transparent;
}
.wrapper.secondary.outline:active {
	background: var(--btn-secondary-bg-active);
}

.wrapper.tertiary {
	background: transparent;
	fill: var(--txt-tertiary);
	box-shadow: inset 0 0 0 1px var(--op-5);
}
.wrapper.tertiary:hover {
	background: var(--op-10);
}
.wrapper.tertiary:active {
	background: var(--op-5);
}

.wrapper.inline {
	height: initial;

	gap: 6px;
	background: transparent;

	padding: 0;
}
.wrapper.inline svg,
span {
	transition: all 0.2s ease;
}
.wrapper.inline:hover {
	box-shadow: 0 0 0 0 transparent;
}
.wrapper.inline:hover svg {
	fill: var(--txt-secondary);
}
.wrapper.inline:hover span {
	color: var(--txt-primary);
}
.wrapper.inline:active {
	transform: translateY(1px);
}

.wrapper.text {
	height: initial;

	color: var(--txt-blue);

	background: transparent;

	padding: 0;

	transition: color 0.2s ease;
}

.wrapper.text:hover {
	color: var(--blue);
}

.wrapper.text.small {
	font-size: 12px;
	line-height: 1;
}

/** OTHER */
.wrapper.disabled {
	pointer-events: none;
	opacity: 0.4;
}

.wrapper.border {
	border: 1px solid var(--border);
}
</style>
