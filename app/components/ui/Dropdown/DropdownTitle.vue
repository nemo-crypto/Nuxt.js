<template>
	<Text size="12" weight="600" color="tertiary" :class="[$style.wrapper]">
		<slot />
	</Text>
</template>

<style module>
.wrapper {
	padding: 6px 8px 4px 8px;

	transform-style: preserve-3d;
	-webkit-transform-style: preserve-3d;
	backface-visibility: hidden;
	-webkit-backface-visibility: hidden;
	transform: translateZ(0);
}
</style>
