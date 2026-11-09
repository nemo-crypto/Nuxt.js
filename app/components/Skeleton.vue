<script setup>
const props = defineProps({
	w: String,
	h: String,
	c: {
		type: String,
		default: "gray",
	},
	r: {
		type: String,
		default: "50",
	},
})
</script>

<template>
	<div :style="{ width: `${w}px`, height: `${h}px`, borderRadius: `${r}px` }" :class="[$style.wrapper, $style[c]]" />
</template>

<style module>
.wrapper {
	animation: skeleton 1s ease infinite;

	&.green {
		background: rgba(10, 219, 111, 30%);
	}

	&.yellow {
		background: rgba(255, 212, 0, 30%);
	}

	&.red {
		background: var(--red);
	}

	&.gray {
		background: var(--op-10);
	}
}

@keyframes skeleton {
	0% {
		opacity: 1;
	}

	50% {
		opacity: 0.5;
	}

	100% {
		opacity: 1;
	}
}
</style>
