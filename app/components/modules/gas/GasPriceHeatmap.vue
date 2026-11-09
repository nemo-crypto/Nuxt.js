<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** API */
import { fetchGasPriceSeries } from "@/services/api/gas"

const props = defineProps({
	selectedPeriod: Object,
})

const days = [7, 6, 5, 4, 3, 2, 1]
const seriesByDay = ref({})
const minValue = ref(0)
const maxValue = ref(0)

const calculateOpacity = (val) => {
	const normalizedValue = (val - minValue.value) / (maxValue.value - minValue.value);
	const opacity = 0.2 + normalizedValue * 0.8;

	return opacity;
}

onMounted(async () => {
	let rawSeries = []

	const data = await fetchGasPriceSeries({
		timeframe: props.selectedPeriod.timeframe,
		to: parseInt(DateTime.now().plus({ minutes: 1 }).ts / 1_000),
		from: parseInt(DateTime.now().set({ minutes: 0, seconds: 0 }).minus({ days: 4 }).ts / 1_000),
	})
	const data1 = await fetchGasPriceSeries({
		timeframe: props.selectedPeriod.timeframe,
		to: parseInt(DateTime.now().minus({ days: 4 }).ts / 1_000),
		from: parseInt(DateTime.now().set({ minutes: 0, seconds: 0 }).minus({ days: 7 }).ts / 1_000),
	})

	rawSeries = [...data, ...data1.slice(1, data1.length)]

	minValue.value = Math.min(...rawSeries.map((i) => i.value))
	maxValue.value = Math.max(...rawSeries.map((i) => i.value))

	for (let idx = 0; idx < 7; idx++) {
		seriesByDay.value[DateTime.now().minus({ days: idx }).toFormat("d")] = []
	}

	rawSeries.forEach((d) => {
		seriesByDay.value[DateTime.fromISO(d.time).toFormat("d")]?.push(d)
	})

	Object.keys(seriesByDay.value).forEach((d) => {
		seriesByDay.value[d].reverse();
		if (seriesByDay.value[d].length !== 24) {
			while (seriesByDay.value[d].length !== 24) {
				seriesByDay.value[d].push({
					time: DateTime.fromISO(seriesByDay.value[d][seriesByDay.value[d].length - 1].time).toISO(),
					value: 0,
				})
			}
		}
	})
})
</script>

<template>
	<div :class="$style.wrapper">
		<table>
			<thead>
				<tr>
					<th v-for="hourIdx in 24" :key="hourIdx">
						<Text size="12" weight="600" color="support">
							{{
								DateTime.now()
									.set({ hours: hourIdx - 1, minutes: 0 })
									.toFormat("HH")
							}}
						</Text>
					</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="dayIdx in days" :key="dayIdx">
					<td
						v-for="hour in seriesByDay[
							DateTime.now()
								.minus({ days: dayIdx - 1 })
								.toFormat('d')
						]"
						:key="hour.value"
						:class="[!hour.value && $style.not_available]"
						:style="{ opacity: calculateOpacity(hour.value) }"
					>
						<Tooltip :disabled="!hour.value">
							<div :class="$style.inner" />

							<template #content>
								<Flex direction="column" gap="8">
									<Flex align="center" gap="12" justify="between" wide>
										<Text color="secondary">Gas Price</Text>
										<Text color="primary">{{ parseFloat(hour.value).toFixed(4) }} UNUB</Text>
									</Flex>
									<Flex align="center" gap="12" justify="between" wide>
										<Text color="secondary">Time</Text>
										<Text color="primary">{{ DateTime.fromISO(hour.time).setLocale("en").toFormat("LLL d, yyyy, H:mm") }}</Text>
									</Flex>
								</Flex>
							</template>
						</Tooltip>
					</td>
					<th>
						<Text size="12" weight="600" color="tertiary">
							{{
								DateTime.now()
									.minus({ days: dayIdx - 1 })
									.toFormat("d")
							}}
						</Text>
					</th>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style module>
.wrapper {
	height: 186px;

	overflow: auto;

	& table {
		width: 100%;
		border-spacing: 0;

		& thead {
			& tr th {
				width: 22px;

				padding: 2px 0;
			}
		}

		& tbody {
			& tr td {
				background: var(--yellowNew);
				border: 1px solid var(--card-background);
			}

			& tr td.not_available {
				opacity: 0;
			}

			& tr td:hover {
				outline: 1px solid #fff;
			}

			& tr th {
				position: sticky;
				right: 0;
				padding: 0 4px;
			}
		}
	}
}

.inner {
	width: 18px;
	height: 16px;
}
</style>
