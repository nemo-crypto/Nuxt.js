<script setup>
const props = defineProps(["modelValue", "checked", "disabled"])
const emit = defineEmits(["update:modelValue"])
</script>

<template>
	<Flex
		@click="emit('update:modelValue', !modelValue)"
		@keydown.enter="emit('update:modelValue', !modelValue)"
		align="center"
		gap="8"
		:class="[$style.wrapper, disabled && $style.disabled]"
		tabindex="0"
	>
		<Flex align="center" justify="center" :class="[$style.checkbox, (modelValue || checked) && $style.active]">
			<Icon v-if="modelValue || checked" name="check" size="12" color="black" />
		</Flex>

		<slot />
	</Flex>
</template>

<style module>
.wrapper {
	cursor: pointer;

	&:hover {
		.checkbox {
			border-color: var(--op-10);
		}
	}

	&.disabled {
		cursor: not-allowed;

		& .checkbox {
			opacity: 0.5;
			background: var(--op-30);
		}
	}
}

.wrapper:focus-visible {
	outline: none;

	.checkbox {
		border: 1px solid var(--op-15);
	}

	.checkbox.active {
		background: var(--op-15);
	}
}

.checkbox {
	min-width: 14px;
	min-height: 14px;

	border-radius: 4px;
	border: 1px solid var(--op-5);
	background: rgba(0, 0, 0, 5%);

	transition: all 0.1s ease;

	&.active {
		background: var(--green);
	}
}
</style>
