<template>
	<kbd :class="$style.wrapper">
		<slot />
	</kbd>
</template>

<style module>
.wrapper {
	height: 20px;

	display: flex;
	align-items: center;

	background: var(--op-15);
	border-radius: 4px;
	box-shadow: inset 0 0 0 1px var(--op-5);

	padding: 2px 6px;
}
</style>
