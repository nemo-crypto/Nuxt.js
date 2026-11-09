<script setup>
/** Modules */
import GasPriceChart from "@/components/modules/gas/GasPriceChart.vue"
import GasPriceHeatmap from "@/components/modules/gas/GasPriceHeatmap.vue"
import GasEfficiencyChart from "@/components/modules/gas/GasEfficiencyChart.vue"
import GasFeeCalculator from "@/components/modules/gas/GasFeeCalculator.vue"

/** UI */
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"
import Button from "@/components/ui/Button.vue"

/** Store */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()

const route = useRoute()

const gasPrice = computed(() => appStore.gas)

const visualizations = ref([
	{
		title: "Heatmap",
		value: "heatmap",
	},
	{
		title: "Line Chart",
		value: "line",
	},
])
const selectedVisualization = ref(visualizations.value[0].value)

const selectedPeriodIdx = ref(0)
const periods = ref([
	{
		title: "24 hours",
		value: 24,
		timeframe: "hour",
	},
	{
		title: "31 days",
		value: 30,
		timeframe: "day",
	},
])
const selectedPeriod = computed(() => periods.value[selectedPeriodIdx.value])

useExplorerSeo({
	title: () => `Nubit Gas Tracker`,
	description: () => `Gas Tracker for Nubit Blockchain. Gas price, efficiency, etc.`,
})
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Breadcrumbs
			:items="[
				{ link: '/', name: 'Home' },
				{ link: '/gas', name: `Gas Tracker` },
			]"
			:class="$style.breadcrumbs"
		/>

		<Flex wide direction="column" gap="0">
			<Flex justify="between" :class="$style.header">
				<Flex align="center" gap="8">
					<Text as="h1" size="20" weight="600" color="primary">Gas Tracker</Text>
				</Flex>
			</Flex>

			<Flex gap="20" :class="$style.content">
				<Flex gap="0" :class="$style.leftContent">
					<Flex direction="column" justify="between" gap="20" :class="$style.left">
						<GasFeeCalculator />

						<Flex direction="column" gap="8" :class="$style.bottom">
							<Text size="12" weight="600" color="tertiary" height="140">
								Price is calculated on fee payments for the last <Text color="secondary">100</Text>
								blocks. Each gas price level is the percentage of transactions in which gas price was set below a specified
								value
							</Text>
						</Flex>
					</Flex>
				</Flex>

				<Flex direction="column" gap="0" :class="$style.charts">
					<Flex direction="column" gap="16" :class="$style.card">
						<Flex align="start" justify="between">
							<Flex align="center" gap="6">
								<Text size="16" weight="600" color="primary">Average Gas Price</Text>
							</Flex>

							<Flex align="center" gap="8">
								<Dropdown>
									<Button size="mini" type="secondary">
										<Icon name="chart" size="12" color="primary" />
										<Text color="primary" style="text-transform: capitalize">{{ selectedVisualization }}</Text>
										<Icon name="chevron" size="12" color="secondary" />
									</Button>

									<template #popup>
										<DropdownItem
											v-for="visualization in visualizations"
											:key="visualization.title"
											@click="selectedVisualization = visualization.value"
										>
											<Flex align="center" gap="8">
												<Icon
													:name="visualization.value === selectedVisualization ? 'check' : ''"
													size="12"
													color="secondary"
												/>
												{{ visualization.title }}
											</Flex>
										</DropdownItem>
									</template>
								</Dropdown>

								<Dropdown :disabled="selectedVisualization === 'heatmap'">
									<Button size="mini" type="secondary" :disabled="selectedVisualization === 'heatmap'">
										{{ selectedPeriod.title }}
										<Icon name="chevron" size="12" color="secondary" />
									</Button>

									<template #popup>
										<DropdownItem v-for="(period, idx) in periods" :key="idx" @click="selectedPeriodIdx = idx">
											<Flex align="center" gap="8">
												<Icon :name="idx === selectedPeriodIdx ? 'check' : ''" size="12" color="secondary" />
												{{ period.title }}
											</Flex>
										</DropdownItem>
									</template>
								</Dropdown>
							</Flex>
						</Flex>

						<GasPriceChart v-if="selectedVisualization === 'line'" :selectedPeriod="selectedPeriod" />
						<GasPriceHeatmap v-else-if="selectedVisualization === 'heatmap'" :selectedPeriod="periods[0]" />
					</Flex>

					<div :class="$style.card2">
						<GasEfficiencyChart />
					</div>
				</Flex>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);

	padding: 40px 24px 60px 24px;
}

.breadcrumbs {
	margin-bottom: 16px;
}

.header {
	border-radius: 8px 8px 0 0;
	background: rgba(255, 255, 255, 0.1);
	padding: 20px 20px 0 20px;
}

.content {
	display: grid;
	grid-template-columns: 384px 1fr;
	background: rgba(255, 255, 255, 0.1);
}

.leftContent {
	padding: 20px;
}

.left {
	min-width: 384px;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 8px;
	padding: 20px;
}

.charts {
	width: 100%;
	min-width: 0;
	padding: 20px;
}

.card {
	border-radius: 8px;
	background: rgba(255, 255, 255, 0.1);
	padding: 20px;
	margin-bottom: 20px;
}

.card2 {
	border-radius: 8px;
	background: rgba(255, 255, 255, 0.1);
	padding: 20px;
}

.bottom {
	opacity: 0.6;

	padding-top: 12px;
}

@media (max-width: 800px) {
	.content {
		grid-template-columns: 1fr;
	}

	.left {
		min-width: initial;
		max-width: initial;
	}
}

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}
}
</style>
