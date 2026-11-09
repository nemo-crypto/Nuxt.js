<script setup>
const props = defineProps({
	height: {
		type: String,
		default: "28",
	},
	radius: {
		type: String,
		default: "6",
	},
	padding: {
		type: String,
		default: "6",
	},
	wide: {
		type: Boolean,
		default: false,
	},
})
</script>

<template>
	<Flex :style="{ height: `${height}px`, borderRadius: `${radius}px`, width: wide ? '100%' : '' }" :class="$style.wrapper">
		<Flex wide :style="{ borderRadius: `${radius - 1}px`, padding: `0 ${padding}px` }" :class="$style.inner">
			<slot />
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	position: relative;
	width: fit-content;
	z-index: 0;
	/* background: rgba(247,147,26,0.1); */
	border-radius: 4px 4px 4px 4px;
	border: 1px solid #FFFFFF;

	padding: 1px;

	.inner {
		height: 100%;
		padding: 0 8px;
		transition: all 0.1s ease;
	}
	
}
</style>
