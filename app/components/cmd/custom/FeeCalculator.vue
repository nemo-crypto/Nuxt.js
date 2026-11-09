<script setup>
/** Services */
import { comma } from "@/services/utils"

/** Store */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()

const props = defineProps({
	searchTerm: String,
})
const emit = defineEmits(["shareCopyData"])

const tabs = ref([
	{
		name: "fast",
		icon: "gas_fast",
		color: "greenNew",
	},
	{
		name: "median",
		icon: "gas_median",
		color: "yellowNew",
	},
	{
		name: "slow",
		icon: "gas_slow",
		color: "secondary",
	},
])
const activeTab = ref(tabs.value[0].name)
const selectedGasPrice = computed(() => appStore.gas[activeTab.value])
const gasFee = computed(() => {
	const result = Math.ceil(Math.abs(selectedGasPrice.value * parseFloat(props.searchTerm)))
	emit("shareCopyData", result)
	return result
})
</script>

<template>
	<Flex direction="column" :class="$style.wrapper">
		<Text size="12" weight="500" color="tertiary" :class="$style.label"> Fee Calculator </Text>

		<Flex direction="column" align="center" gap="24" :class="$style.calculator">
			<Flex align="center" wide :class="$style.content">
				<Flex justify="center" align="center" gap="24" :class="$style.left">
					<Flex direction="column" align="center" gap="8">
						<Text size="20" weight="600" color="primary">{{ selectedGasPrice }}</Text>
						<Text size="12" weight="600" color="tertiary">Gas Price</Text>
					</Flex>

					<Text size="20" weight="600" color="tertiary">*</Text>

					<Flex direction="column" align="center" gap="8">
						<Text v-if="!isNaN(parseFloat(searchTerm))" size="20" weight="600" color="primary">
							{{ comma(Math.abs(parseFloat(searchTerm)), " ") }}
						</Text>
						<Text v-else size="20" weight="600" color="secondary">TBD</Text>

						<Text size="12" weight="600" color="tertiary">Gas Limit</Text>
					</Flex>
				</Flex>

				<Flex direction="column" align="center" gap="12" :class="$style.middle">
					<div :class="$style.border" />
					<Icon name="arrow-right" size="24" color="secondary" />
					<div :class="$style.border" />
				</Flex>

				<Flex justify="center" :class="$style.right">
					<template v-if="!isNaN(selectedGasPrice * parseFloat(searchTerm))">
						<Flex direction="column" align="center" gap="8">
							<Text size="20" weight="600" color="primary">
								{{ comma(gasFee, " ") }}
							</Text>
							<Text size="12" weight="600" color="tertiary">Gas Fee</Text>
						</Flex>
					</template>
				</Flex>
			</Flex>

			<Flex align="center" gap="8" :class="$style.tabs">
				<Flex
					v-for="tab in tabs"
					:key="tab.name"
					@click="activeTab = tab.name"
					align="center"
					gap="4"
					:class="[$style.badge, activeTab === tab.name && $style.active]"
				>
					<Icon :name="tab.icon" size="16" :color="tab.color" />
					<Text size="14" weight="600" color="primary" style="text-transform: capitalize">{{ tab.name }}</Text>
					<Text size="14" weight="600" color="tertiary" style="text-transform: capitalize">{{ appStore.gas[tab.name] }}</Text>
				</Flex>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	.actions {
		padding: 0 4px;
	}
}

.label {
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;

	background: var(--card-background);

	padding: 12px 12px 6px 12px;
}

.calculator {
	border-radius: 8px;
	background: var(--op-5);
	border: 1px solid var(--op-5);

	padding: 16px;
	margin: 0 12px 8px 12px;

	& .badge {
		border-radius: 6px;
		background: var(--op-5);
		cursor: pointer;

		padding: 6px 8px;

		transition: all 0.1s ease;

		&.active {
			background: var(--op-15);
		}

		&.active:hover {
			background: var(--op-15);
		}

		&:hover {
			background: var(--op-8);
		}
	}
}

.left,
.right {
	flex: 1;
}

.middle {
	height: 120px;
}

.border {
	width: 1px;
	height: 100%;

	background: var(--op-8);
}

.hint {
	& kbd {
		font-weight: 700;
		color: var(--txt-tertiary);
	}
}

@media (max-width: 700px) {
	.calculator {
		padding-top: 32px;
	}

	.content {
		flex-direction: column;
	}

	.middle {
		width: 100%;
		height: 80px;

		flex-direction: row;

		& svg {
			transform: rotate(90deg);
		}
	}

	.border {
		width: 100%;
		height: 1px;
	}

	.tabs {
		flex-direction: column;
	}
}
</style>
