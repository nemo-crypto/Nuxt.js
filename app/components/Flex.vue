<script setup>
/** Vendor */
import { ref, computed } from "vue"

const wrapper = ref(null)
defineExpose({ wrapper })

const props = defineProps({
	tag: {
		default: "div",
	},
	to: {
		type: String,
		required: false,
	},
	align: {
		type: String,
		validator(value) {
			return ["center", "between", "around", "evenly", "start", "end"].includes(value)
		},
	},
	justify: {
		type: String,
		validator(value) {
			return ["center", "between", "around", "evenly", "start", "end"].includes(value)
		},
	},
	wrap: {
		type: String,
		validator(value) {
			return ["nowrap", "wrap", "wrapReverse"].includes(value)
		},
	},
	direction: {
		type: String,
		validator(value) {
			return ["column", "columnReversed", "row", "rowReversed"].includes(value)
		},
	},
	gap: {
		type: String,
	},
	wide: {
		type: Boolean,
		default: false,
	},
})

const classes = computed(() => {
	const flexClasses = ["flex"]

	if (props.align) {
		flexClasses.push(`items-${props.align}`)
	}
	if (props.justify) {
		flexClasses.push(`justify-${props.justify}`)
	}
	if (props.wrap) {
		flexClasses.push(`wrap-${props.wrap}`)
	}
	if (props.direction) {
		flexClasses.push(`flex-direction-${props.direction}`)
	}
	if (props.gap) {
		flexClasses.push(`gap--${props.gap}`)
	}
	if (props.wide) {
		flexClasses.push("flex-wide")
	}

	return flexClasses
})
</script>

<template>
	<component :is="tag" v-bind="{ to: to ? to : null }" ref="wrapper" :class="classes">
		<slot />
	</component>
</template>
