<script setup>
import CommandMenuNew from "@/components/cmd/CommandMenuNew.vue"
</script>

<template>
	<Flex direction="column">
		<Flex direction="column" align="center" :class="$style.wrapper">
			<TheHeader />

			<div :class="$style.searchBtn">
				<CommandMenuNew />
			</div>

			<Feed />

			<Flex tag="main" id="main-content" direction="column" align="center" wide :class="$style.container">
				<slot />

				<div :class="$style.bg" />
			</Flex>
		</Flex>

		<TheFooter />
	</Flex>
</template>

<style module>
.wrapper {
	min-height: calc(100vh - 116px);
}

.searchBtn {
	margin-top: 92px;
	margin-bottom: -72px;
}

.container {
	position: relative;
}

.bg {
	position: absolute;
	top: 28px;
	left: 40px;
	right: 40px;
	height: 600px;
	z-index: -1;

	background-image: radial-gradient(circle at 2px 2px, var(--op-5) 2px, transparent 0);
	background-size: 48px 48px;
}
</style>
