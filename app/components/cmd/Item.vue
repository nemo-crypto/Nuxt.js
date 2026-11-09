<script setup>
const wrapper = ref()
defineExpose({ wrapper })

const props = defineProps({
	action: {
		type: Object,
	},
	isFocused: {
		type: Boolean,
		default: false,
	},
})
</script>

<template>
	<Flex ref="wrapper" align="center" justify="between" :class="[$style.wrapper, isFocused && $style.focused]">
		<Flex align="center" gap="8" :class="$style.left">
			<Icon :name="action.icon" size="16" color="primary" :class="$style.icon" />

			<Text size="13" weight="500" height="13" color="primary" :class="$style.title">
				{{ action.title }}
			</Text>
		</Flex>

		<Text v-if="action.subtitle" size="12" weight="600" color="tertiary">
			{{ action.subtitle }}
		</Text>
	</Flex>
</template>

<style module>
.wrapper {
	height: 34px;
	cursor: pointer;
	padding: 0 10px;

	&:hover {
		background: rgba(247, 147, 26, 0.1);
		border-radius: 4px 4px 4px 4px;
	}

	&:active {
		background: var(--op-8);
	}

	&.focused {
		background: rgba(247, 147, 26, 0.1);
		border-radius: 4px 4px 4px 4px;
		border: 1px solid #F7931A;
	}
}

.left {
	min-width: 0;
}

.icon {
	box-sizing: content-box;

	border-radius: 5px;
	background: var(--op-10);

	padding: 4px;
}

.title {
	overflow: hidden;
	text-overflow: ellipsis;
}
</style>
