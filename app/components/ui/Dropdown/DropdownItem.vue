<script setup>
defineProps({
	disabled: Boolean,
})
</script>

<template>
	<div :class="[$style.wrapper, disabled && $style.disabled]" tabindex="1">
		<slot />
	</div>
</template>

<style module>
.wrapper {
	display: flex;
	align-items: center;

	min-width: 120px;
	padding: 10px 20px;

	transform-style: preserve-3d;
	-webkit-transform-style: preserve-3d;
	backface-visibility: hidden;
	-webkit-backface-visibility: hidden;
	transform: translateZ(0);

	font-size: 16px;
	font-weight: 500;
	line-height: 14px;
	color: #fff;
	white-space: nowrap;

	cursor: pointer;

	transition: all 0.1s var(--bezier);
}

.wrapper.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.wrapper:hover {
	background: var(--op-5);
}

.wrapper:focus {
	outline: none;
	background: rgba(255, 255, 255, 0.05);
}
</style>
