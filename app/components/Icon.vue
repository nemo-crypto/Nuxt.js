<script setup>
import { computed } from "vue"

import icons from "@/assets/icons.json"

const props = defineProps({
	name: { type: String, required: true, default: "warning" },
	size: { type: [String, Number], default: "16" },
	color: { type: String, default: null },
	rotate: { type: [String, Number], default: 0 },
	fill: { type: Boolean, default: false },
})

const styles = computed(() => {
	return {
		minWidth: `${props.size}px`,
		minHeight: `${props.size}px`,
		transform: props.rotate ? `rotate(${props.rotate}deg)` : null,
	}
})

const classes = computed(() => {
	const iconClasses = []

	if (props.color) iconClasses.push(`fill--${props.color}`)

	return iconClasses
})

const getIcon = () => {
	return icons[props.name.charAt(0).toLowerCase() + props.name.slice(1)]
}

const isSplitted = () => {
	return typeof icons[props.name.charAt(0).toLowerCase() + props.name.slice(1)] == "object"
}
</script>

<template>
	<svg viewBox="0 0 24 24" :width="size" :height="size" :style="styles" :class="classes" role="img">
		<path v-if="!isSplitted(name)" :d="getIcon(name)" />
		<template v-else>
			<path v-if="!Array.isArray(getIcon(name))" :d="getIcon(name)" :style="{ opacity: path.opacity }" />

			<template v-else>
				<path
					v-for="(icon, i) in getIcon(name)"
					:key="i"
					:d="icon.path"
					:style="{ opacity: fill ? 1 : icon.opacity, fill: icon.color && icon.color }"
				/>
			</template>
		</template>
	</svg>
</template>
