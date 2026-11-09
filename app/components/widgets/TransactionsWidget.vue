<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { comma, abbreviate } from "@/services/utils"

/** API */
import { fetchSeries } from "@/services/api/stats"

const histogram = ref([])

const sectors = ref([[], [], [], []])
const hoursMap = [
	[0, 1, 2, 3, 4, 5],
	[6, 7, 8, 9, 10, 11],
	[12, 13, 14, 15, 16, 17],
	[18, 19, 20, 21, 22, 23],
]

const min = ref(0)
const max = ref(0)
const roundedMax = ref(0)

const getHistogram = async (sectorOffset) => {
	const data = await fetchSeries({
		table: "tx_count",
		period: "hour",
		from: parseInt(DateTime.now().minus({ hours: 24 - sectorOffset }).ts / 1_000),
	})
	histogram.value = data.reverse()
}

const buildHistogram = async () => {
	sectors.value.forEach((s) => {
		while (s.length) {
			s.pop()
		}
	})

	const currentHour = DateTime.now().hour
	const currentSector = hoursMap.find((m) => m.includes(currentHour))
	const currentHourIdx = currentSector.indexOf(currentHour)
	const sectorOffset = 5 - currentHourIdx

	await getHistogram(sectorOffset)

	const items = [...histogram.value]

	let target = 0
	while (items.length) {
		if (sectors.value[target].length === 6) target += 1
		sectors.value[target].push(items[0])

		items.shift()
	}

	while (sectors.value[sectors.value.length - 1].length < 6) {
		sectors.value[sectors.value.length - 1].push({
			time: null,
			value: 0,
		})
	}

	max.value = Math.max(...histogram.value.map((item) => parseInt(item.value)))
	roundedMax.value = Math.ceil(max.value / 5) * 5

	setTimeout(() => {
		buildHistogram()
	}, (60 - DateTime.now().minute) * 60 * 1_000)
}

onMounted(async () => {
	buildHistogram()
})

const txCounter = computed(() => {
	return histogram.value.reduce((a, b) => (a += parseInt(b.value)), 0)
})

const getPercentageRatio = (v) => {
	return (parseInt(v) * 100) / roundedMax.value
}

const getSectorName = (item) => {
	return item.time ? DateTime.fromISO(item.time).hour : DateTime.now().hour
}
</script>

<template>
	<Flex direction="column" gap="20" :class="$style.wrapper">
		<Flex justify="between">
			<Flex align="center" gap="6">
				<img width="16" height="16" src="/img/hometxicon.svg" />

				<Flex gap="4" align="end">
					<Tooltip v-if="txCounter">
						<Flex gap="4" align="end">
							<Text class="rubik_font" size="16" weight="600" color="primary">{{ abbreviate(txCounter) }}</Text>

							<Text size="12" weight="700" color="tertiary">TXs</Text>
						</Flex>
						<template #content>
							<Flex gap="4" align="end">
								<Text class="rubik_font" size="14" weight="600" color="primary">{{ txCounter }}</Text>
								<Text size="11" weight="700" color="tertiary">TXs/24h</Text>
							</Flex>
						</template>
					</Tooltip>

					<Skeleton v-else w="36" h="16" />
				</Flex>
			</Flex>

			<Text size="12" weight="600" color="tertiary">24h</Text>
		</Flex>

		<!-- Chart -->
		<Flex gap="16" :class="$style.chart">
			<Flex direction="column" justify="between" :class="$style.yAxis">
				<Skeleton w="35" h="12" v-if="!roundedMax" />
				<Text v-else size="12" weight="600" color="tertiary">{{ abbreviate(roundedMax) }}</Text>

				<Skeleton w="15" h="12" v-if="!roundedMax" />
				<Text v-else size="12" weight="600" color="tertiary">{{ comma(min) }}</Text>
			</Flex>

			<Flex v-if="!sectors[0].length" wide :class="$style.sectors">
				<Flex v-for="i in 4" :key="i" direction="column" gap="8" wide :class="$style.sector">
					<Flex justify="between" wide :class="$style.hours">
						<Flex v-for="j in 6" :key="j" direction="column" justify="end" gap="6" :class="$style.hour">
							<Skeleton w="4" :style="{ height: `${Math.random(20, 80) * 100}%` }" />
							<div :class="$style.dot" />
						</Flex>
					</Flex>

					<Skeleton w="20" h="12" />
				</Flex>
			</Flex>

			<Flex v-else wide :class="$style.sectors">
				<Flex v-for="(sector, idx) in sectors" :key="idx" direction="column" gap="8" wide
					:class="$style.sector">
					<Flex justify="between" :class="$style.hours">
						<Tooltip v-for="item in sector" :key="item.value" :disabled="!item.time">
							<Flex direction="column" justify="end" gap="6"
								:class="[$style.hour, DateTime.now().hour === DateTime.fromISO(item.time).hour && $style.current]">
								<div :style="{ flex: getPercentageRatio(item.value) / 100 }"
									:class="[$style.bar, getPercentageRatio(item.value) > 20 && $style.green]" />

								<div :class="$style.dot" />
							</Flex>

							<template #content>
								<Flex direction="column" gap="4">
									<Flex justify="between" align="center" gap="8">
										<Text color="secondary">Time</Text>
										<Text color="primary">
											{{
		DateTime.fromISO(item.time).setLocale("en").toLocaleString(DateTime.TIME_SIMPLE)
	}}
										</Text>
									</Flex>

									<Flex justify="between" align="center" gap="8">
										<Text color="secondary">Txs</Text>
										<Text color="primary">{{ comma(item.value) }}</Text>
									</Flex>
								</Flex>
							</template>
						</Tooltip>
					</Flex>

					<Text size="12" weight="600" color="tertiary">
						{{ getSectorName(sector[0]) }}
					</Text>
				</Flex>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	height: 100%;
	min-height: 164px;

	background: var(--card-background);
	border-radius: 12px;
	overflow: hidden;

	padding: 16px;
}

.chart {
	flex: 1;
}

.yAxis {
	height: auto;

	padding-bottom: 20px;
}

.sector {
	border-left: 2px solid var(--op-5);

	padding: 0 8px;

	&:last-child {
		border-right: 2px solid var(--op-5);
	}
}

.hours {
	height: 100%;
}

.hour.current {
	.bar {
		background: var(--blue);
		animation: blink 1.5s ease infinite;
	}
}

@keyframes blink {
	0% {
		opacity: 0.4;
	}

	50% {
		opacity: 0.8;
	}

	100% {
		opacity: 0.4;
	}
}

.bar {
	width: 4px;

	border-radius: 50px;
	background: var(--txt-tertiary);

	&.green {
		background: var(--yellowNew);
	}
}

.dot {
	min-width: 4px;
	min-height: 4px;

	border-radius: 50%;
	background: var(--op-5);
}

.empty {
	height: 100%;
}

@media (max-width: 1100px) {
	.bar {
		width: 8px;
	}

	.dot {
		min-width: 8px;
		min-height: 8px;
	}
}

@media (max-width: 540px) {
	.bar {
		width: 4px;
	}

	.dot {
		min-width: initial;
		min-height: initial;
	}
}
</style>
