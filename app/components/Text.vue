<script setup>
import { computed } from "vue"

const props = defineProps({
	as: { type: String, default: "span" },
	size: {
		type: String,
	},
	weight: {
		type: String,
	},
	height: {
		type: String,
		default: "100",
	},
	align: {
		type: String,
	},
	color: {
		type: String,
	},
	noWrap: {
		type: Boolean,
	},
	mono: {
		type: Boolean,
		default: false,
	},
	tabular: {
		type: Boolean,
		default: false,
	},
	selectable: {
		type: Boolean,
		default: false,
	},
})

const classes = computed(() => {
	const flexClasses = []

	if (props.size) {
		flexClasses.push(`fz--${props.size}`)
	}
	if (props.weight) {
		flexClasses.push(`fw--${props.weight}`)
	}
	if (props.height) {
		flexClasses.push(`lh--${props.height}`)
	}
	if (props.align) {
		flexClasses.push(`ta--${props.align}`)
	}
	if (props.color) {
		flexClasses.push(`color--${props.color}`)
	}
	if (props.noWrap) {
		flexClasses.push(`no-wrap`)
	}
	if (props.mono) {
		flexClasses.push(`mono`)
	}
	if (props.tabular) {
		flexClasses.push(`tabular`)
	}
	if (props.selectable) {
		flexClasses.push(`selectable`)
	}

	return flexClasses
})
</script>

<template>
	<component :is="as" :class="classes">
		<slot />
	</component>
</template>

<style scoped>
h1, h2 { margin: 0; }
</style>
