<script setup>
const props = defineProps({
	size: String,
})

const calcStyles = computed(() => {
	return {
		height: `${props.size}px`,
		minHeight: `${props.size}px`,
		width: `${props.size}px`,
		minWidth: `${props.size}px`,
	}
})
</script>

<template>
	<div :class="$style.wrapper" :style="calcStyles" />
</template>

<style module>
.wrapper {
	border-radius: 100px;
	border: 2px rgba(255, 255, 255, 0.1) solid;
	border-top: 2px rgba(255, 255, 255, 1) solid;
	animation: material-spinner 4s infinite;
}

@keyframes material-spinner {
	0% {
		transform: rotate(0deg);
	}
	25% {
		transform: rotate(360deg);
	}
	50% {
		transform: rotate(720deg);
	}
	75% {
		transform: rotate(1080deg);
	}
	100% {
		transform: rotate(1440deg);
	}
}
</style>
