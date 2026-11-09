<script setup>
/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { truncate } from "@/services/utils"

/** API */
import { fetchGasPrice } from "@/services/api/gas"

const gasPrice = ref({})

onMounted(async () => {
	const data = await fetchGasPrice()
	gasPrice.value = data
})
</script>

<template>
	<NuxtLink to="/gas" :class="$style.wrapper">
		<Flex align="center" justify="between">
			<Flex align="center" gap="6">
				<img width="20" height="20" src="/img/blobsGraph.svg" />
				<Text size="20" weight="600" height="110" color="primary">Gas Price Tracker</Text>
			</Flex>

			<Tooltip side="top" position="end" width="150">
				<img width="16" height="16" src="/img/heloInfo.svg" />

				<template #content>
					<Flex direction="column" gap="6" style="max-width: 230px; text-align: end">
						<Text color="secondary" height="140">Gas price is calculated on fee payments for the last 100
							blocks. </Text>
						<Text color="tertiary" height="140">
							Each gas price level is the percentage of transactions in which gas price was set below a
							specified value</Text>
						<Text color="tertiary">Values in UNUB</Text>
					</Flex>
				</template>
			</Tooltip>
		</Flex>

		<Flex align="center" justify="between" wide :class="$style.bars">
			<Flex align="center" gap="4" :class="[$style.bar, $style.fast]">
				<Icon name="gas_fast" size="14" color="greenNew" />
				<Skeleton v-if="!gasPrice.fast" w="34" h="12" c="greenNew" />
				<Text v-else size="12" weight="600" color="greenNew">
					{{
		Number(gasPrice.fast)
			.toFixed(3)
			.replace(/\.?0*$/, "")
	}}
				</Text>
				<Text size="12" weight="600" color="greenNew"> Fast</Text>
			</Flex>

			<Flex align="center" gap="4" :class="[$style.bar, $style.medium]">
				<Icon name="gas_median" size="14" color="yellowNew" />
				<Skeleton v-if="!gasPrice.fast" w="34" h="12" c="yellowNew" />
				<Text v-else size="12" weight="600" color="yellowNew">
					{{
		Number(gasPrice.median)
			.toFixed(3)
			.replace(/\.?0*$/, "")
	}}
				</Text>
				<Text size="12" weight="600" color="yellowNew">Med</Text>
			</Flex>

			<Flex align="center" gap="4" :class="[$style.bar, $style.slow]">
				<Icon name="gas_slow" size="14" color="secondary" />
				<Skeleton v-if="!gasPrice.fast" w="34" h="12" c="gray" />
				<Text v-else size="12" weight="600" color="secondary">
					{{
		Number(gasPrice.slow)
			.toFixed(3)
			.replace(/\.?0*$/, "")
	}}
				</Text>
				<Text size="12" weight="600" color="secondary"> Slow </Text>
			</Flex>
		</Flex>
	</NuxtLink>
</template>

<style module>
.wrapper {
	display: flex;
	justify-content: space-between;
	flex-direction: column;

	min-height: 85px;

	background: rgba(255, 255, 255, 0.1);
	border-radius: 12px;
	overflow: hidden;

	padding: 12px;

	transition: all 0.2s ease;

	&:hover {
		box-shadow: inset 0 0 0 2px var(--op-5);
	}

	&:focus-visible {
		box-shadow: inset 0 0 0 2px var(--op-8);
	}

	&:active {
		box-shadow: inset 0 0 0 2px var(--op-10);
	}
}

.bar {
	height: 28px;

	border-radius: 8px;

	padding: 0 12px;

	&.fast {
		background: linear-gradient(rgba(10, 219, 111, 25%), rgba(10, 219, 111, 10%));
		box-shadow: inset 0 0 0 1px rgba(10, 219, 111, 50%);
	}

	&.medium {
		background: linear-gradient(rgba(255, 212, 0, 25%), rgba(255, 212, 0, 10%));
		box-shadow: inset 0 0 0 1px rgba(255, 212, 0, 50%);
	}

	&.slow {
		background: linear-gradient(var(--op-15), var(--op-5));
		box-shadow: inset 0 0 0 1px var(--op-30);
	}

	& span:nth-child(3) {
		opacity: 0.6;
	}
}
</style>
