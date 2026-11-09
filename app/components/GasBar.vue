<script setup>
const props = defineProps({
	percent: Number,
})

const getBarColor = () => {
	if (props.percent > 100) {
		return "var(--red)"
	} else if (props.percent < 30) {
		return "var(--orange)"
	} else if (props.percent < 60) {
		return "var(--yellow)"
	} else {
		return "var(--green)"
	}
}
</script>

<template>
	<div :class="$style.wrapper">
		<div
			:style="{
				width: `${percent > 100 ? 100 : percent}%`,
				background: getBarColor(),
			}"
		/>
	</div>
</template>

<style module>
.wrapper {
	width: 40px;
	height: 4px;

	border-radius: 50px;
	background: var(--op-10);
	overflow: hidden;

	& div {
		height: 4px;
	}
}
</style>
