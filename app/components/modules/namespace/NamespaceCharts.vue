<script setup>
/** Vendor */
import * as d3 from "d3"
import { DateTime } from "luxon"
import { useDebounceFn } from "@vueuse/core"

/** UI */
import Button from "@/components/ui/Button.vue"
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown"

/** Services */
import { abbreviate, formatBytes } from "@/services/utils"

/** API */
import { fetchNamespaceSeries } from "@/services/api/stats"

const props = defineProps({
	id: {
		type: String,
		required: true,
	},
})

const selectedPeriodIdx = ref(1)
const periods = ref([
	{
		title: "Last 24 hours",
		value: 24,
		timeframe: "hour",
	},
	{
		title: "Last 7 days",
		value: 7,
		timeframe: "day",
	},
	{
		title: "Last 31 days",
		value: 30,
		timeframe: "day",
	},
])
const selectedPeriod = computed(() => periods.value[selectedPeriodIdx.value])

/** Charts */
const chartWrapperEl = ref()
const sizeSeriesChartEl = ref()
const pfbSeriesChartEl = ref()

/** Data */
const sizeSeries = ref([])
const pfbSeries = ref([])

/** Tooltip */
const showSeriesTooltip = ref(false)
const showPfbTooltip = ref(false)
const tooltipEl = ref()
const tooltipXOffset = ref(0)
const tooltipYOffset = ref(0)
const tooltipYDataOffset = ref(0)
const tooltipDynamicXPosition = ref(0)
const tooltipText = ref("")

const badgeEl = ref()
const badgeText = ref("")
const badgeOffset = ref(0)

const buildChart = (chartEl, data, onEnter, onLeave) => {
	const width = chartWrapperEl.value.wrapper.getBoundingClientRect().width
	const height = 180
	const marginTop = 0
	const marginRight = 0
	const marginBottom = 24
	const marginLeft = 40

	const MAX_VALUE = d3.max(data, (d) => d.value) ? d3.max(data, (d) => d.value) : 1

	/** Scale */
	const x = d3.scaleUtc(
		d3.extent(data, (d) => d.date),
		[marginLeft, width - marginRight],
	)
	const y = d3.scaleLinear([0, MAX_VALUE], [height - marginBottom - 6, marginTop])
	const line = d3
		.line()
		.x((d) => x(d.date))
		.y((d) => y(d.value))

	/** Tooltip */
	const bisect = d3.bisector((d) => d.date).center
	const onPointermoved = (event) => {
		onEnter()

		const idx = bisect(data, x.invert(d3.pointer(event)[0]))

		tooltipXOffset.value = x(data[idx].date)
		tooltipYDataOffset.value = y(data[idx].value)
		tooltipYOffset.value = event.layerY
		tooltipText.value = data[idx].value

		if (tooltipEl.value) {
			if (idx > parseInt(selectedPeriod.value.value / 2)) {
				tooltipDynamicXPosition.value = tooltipXOffset.value - tooltipEl.value.wrapper.getBoundingClientRect().width - 16
			} else {
				tooltipDynamicXPosition.value = tooltipXOffset.value + 16
			}
		}

		badgeText.value =
			selectedPeriod.value.timeframe === "day"
				? DateTime.fromJSDate(data[idx].date).toFormat("LLL dd")
				: DateTime.fromJSDate(data[idx].date).set({ minutes: 0 }).toFormat("hh:mm a")

		if (!badgeEl.value) return
		if (idx < 2) {
			badgeOffset.value = 0
		} else if (idx > selectedPeriod.value.value - 3) {
			badgeOffset.value = badgeEl.value.getBoundingClientRect().width
		} else {
			badgeOffset.value = badgeEl.value.getBoundingClientRect().width / 2
		}
	}
	const onPointerleft = () => {
		onLeave()
		badgeText.value = ""
	}

	/** SVG Container */
	const svg = d3
		.create("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("viewBox", [0, 0, width, height])
		.attr("preserveAspectRatio", "none")
		.attr("style", "max-width: 100%;  height: intrinsic;")
		.style("-webkit-tap-highlight-color", "transparent")
		.on("pointerenter pointermove", onPointermoved)
		.on("pointerleave", onPointerleft)
		.on("touchstart", (event) => event.preventDefault())

	/** Vertical Lines */
	svg.append("path")
		.attr("fill", "none")
		.attr("stroke", "var(--op-10)")
		.attr("stroke-width", 2)
		.attr("d", `M${marginLeft},${height - marginBottom + 2} L${marginLeft},${height - marginBottom - 5}`)
	svg.append("path")
		.attr("fill", "none")
		.attr("stroke", "var(--op-10)")
		.attr("stroke-width", 2)
		.attr("d", `M${width - 1},${height - marginBottom + 2} L${width - 1},${height - marginBottom - 5}`)

	/** Default Horizontal Line  */
	svg.append("path")
		.attr("fill", "none")
		.attr("stroke", "var(--op-10)")
		.attr("stroke-width", 2)
		.attr("d", `M${0},${height - marginBottom - 6} L${width},${height - marginBottom - 6}`)

	/** Chart Line */
	svg.append("path")
		.attr("fill", "none")
		.attr("stroke", "var(--redNew)")
		.attr("stroke-width", 2)
		.attr("stroke-linecap", "round")
		.attr("stroke-linejoin", "round")
		.attr("d", line(data.slice(0, data.length - 1)))
	svg.append("path")
		.attr("fill", "none")
		.attr("stroke", "var(--redNew)")
		.attr("stroke-width", 2)
		.attr("stroke-linecap", "round")
		.attr("stroke-linejoin", "round")
		.attr("stroke-dasharray", "8")
		.attr("d", line(data.slice(data.length - 2, data.length)))

	svg.append("circle")
		.attr("cx", x(data[data.length - 1].date))
		.attr("cy", y(data[data.length - 1].value))
		.attr("fill", "var(--redNew)")
		.attr("r", 3)

	if (chartEl.children[0]) chartEl.children[0].remove()
	chartEl.append(svg.node())
}

const getSizeSeries = async () => {
	sizeSeries.value = []

	const sizeSeriesRawData = await fetchNamespaceSeries({
		id: props.id,
		name: "size",
		timeframe: selectedPeriod.value.timeframe,
		from: parseInt(
			DateTime.now().minus({
				days: selectedPeriod.value.timeframe === "day" ? selectedPeriod.value.value : 0,
				hours: selectedPeriod.value.timeframe === "hour" ? selectedPeriod.value.value : 0,
			}).ts / 1_000,
		),
	})

	const sizeSeriesMap = {}
	sizeSeriesRawData.forEach((item) => {
		sizeSeriesMap[DateTime.fromISO(item.time).toFormat(selectedPeriod.value.timeframe === "day" ? "y-LL-dd" : "y-LL-dd-HH")] =
			item.value
	})

	for (let i = 1; i < selectedPeriod.value.value + 1; i++) {
		const dt = DateTime.now().minus({
			days: selectedPeriod.value.timeframe === "day" ? selectedPeriod.value.value - i : 0,
			hours: selectedPeriod.value.timeframe === "hour" ? selectedPeriod.value.value - i : 0,
		})
		sizeSeries.value.push({
			date: dt.toJSDate(),
			value: parseInt(sizeSeriesMap[dt.toFormat(selectedPeriod.value.timeframe === "day" ? "y-LL-dd" : "y-LL-dd-HH")]) || 0,
		})
	}
}

const getPfbSeries = async () => {
	pfbSeries.value = []

	const pfbSeriesRawData = await fetchNamespaceSeries({
		id: props.id,
		name: "pfb_count",
		timeframe: selectedPeriod.value.timeframe,
		from: parseInt(
			DateTime.now().minus({
				days: selectedPeriod.value.timeframe === "day" ? selectedPeriod.value.value : 0,
				hours: selectedPeriod.value.timeframe === "hour" ? selectedPeriod.value.value : 0,
			}).ts / 1_000,
		),
	})

	const pfbSeriesMap = {}
	pfbSeriesRawData.forEach((item) => {
		pfbSeriesMap[DateTime.fromISO(item.time).toFormat(selectedPeriod.value.timeframe === "day" ? "y-LL-dd" : "y-LL-dd-HH")] = item.value
	})

	for (let i = 1; i < selectedPeriod.value.value + 1; i++) {
		const dt = DateTime.now().minus({
			days: selectedPeriod.value.timeframe === "day" ? selectedPeriod.value.value - i : 0,
			hours: selectedPeriod.value.timeframe === "hour" ? selectedPeriod.value.value - i : 0,
		})
		pfbSeries.value.push({
			date: dt.toJSDate(),
			value: parseInt(pfbSeriesMap[dt.toFormat(selectedPeriod.value.timeframe === "day" ? "y-LL-dd" : "y-LL-dd-HH")]) || 0,
		})
	}
}

const buildNamespaceCharts = async () => {
	await getSizeSeries()
	buildChart(
		sizeSeriesChartEl.value.wrapper,
		sizeSeries.value,
		() => (showSeriesTooltip.value = true),
		() => (showSeriesTooltip.value = false),
	)

	await getPfbSeries()
	buildChart(
		pfbSeriesChartEl.value.wrapper,
		pfbSeries.value,
		() => (showPfbTooltip.value = true),
		() => (showPfbTooltip.value = false),
	)
}

watch(
	() => selectedPeriodIdx.value,
	() => {
		buildNamespaceCharts()
	},
)

const debouncedRedraw = useDebounceFn((e) => {
	buildNamespaceCharts()
}, 500)

onMounted(async () => {
	window.addEventListener("resize", debouncedRedraw)

	buildNamespaceCharts()
})

onBeforeUnmount(() => {
	window.removeEventListener("resize", debouncedRedraw)
})
</script>

<template>
	<Flex direction="column" gap="0">
		<Flex align="center" justify="between" :class="$style.header">
			<Flex align="center" gap="8">
				<!-- <Icon name="chart" size="14" color="primary" /> -->
				<Text size="20" weight="600" color="primary">Analytics</Text>
			</Flex>

			<Dropdown>
				<Button size="mini" type="secondary">
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

		<Flex justify="between" gap="32" :class="$style.data">
			<Flex direction="column" gap="20" wide :class="$style.dataContainer">
				<Text size="13" weight="600" color="primary">DA Usage</Text>

				<Flex ref="chartWrapperEl" direction="column" :class="$style.chart_wrapper">
					<Flex direction="column" justify="between" :class="[$style.axis, $style.y]">
						<Text
							v-if="sizeSeries.length"
							size="12"
							weight="600"
							color="tertiary"
							:style="{ opacity: Math.max(...sizeSeries.map((d) => d.value)) ? 1 : 0 }"
						>
							{{ formatBytes(Math.max(...sizeSeries.map((d) => d.value)), 0) }}
						</Text>
						<Skeleton v-else-if="!sizeSeries.length" w="32" h="12" />

						<Text
							v-if="sizeSeries.length"
							size="12"
							weight="600"
							color="tertiary"
							:style="{
								opacity:
									Math.round(Math.max(...sizeSeries.map((d) => d.value)) / 2) !==
									Math.max(...sizeSeries.map((d) => d.value))
										? 1
										: 0,
							}"
						>
							{{ formatBytes(Math.round(Math.max(...sizeSeries.map((d) => d.value)) / 2), 0) }}
						</Text>
						<Skeleton v-else-if="!sizeSeries.length" w="24" h="12" />

						<Text v-if="sizeSeries.length" size="12" weight="600" color="tertiary"> 0 </Text>
						<Skeleton v-else-if="!sizeSeries.length" w="16" h="12" />
					</Flex>

					<Flex :class="[$style.axis, $style.x]">
						<Flex align="end" justify="between" wide>
							<Text v-if="selectedPeriod.timeframe === 'day'" size="12" weight="600" color="tertiary">
								{{
									DateTime.now()
										.minus({ days: selectedPeriod.value - 1 })
										.toFormat("LLL dd")
								}}
							</Text>
							<Text v-else size="12" weight="600" color="tertiary">
								{{ DateTime.now().minus({ hours: selectedPeriod.value }).set({ minutes: 0 }).toFormat("hh:mm a") }}
							</Text>

							<Text size="12" weight="600" color="tertiary">{{ selectedPeriod.timeframe === "day" ? "Today" : "Now" }}</Text>
						</Flex>
					</Flex>

					<Transition name="fastfade">
						<div v-if="showSeriesTooltip" :class="$style.tooltip_wrapper">
							<div
								:style="{ transform: `translate(${tooltipXOffset - 3}px, ${tooltipYDataOffset - 4}px)` }"
								:class="$style.dot"
							/>
							<div :style="{ transform: `translateX(${tooltipXOffset}px)` }" :class="$style.line" />
							<div
								ref="badgeEl"
								:style="{ transform: `translateX(${tooltipXOffset - badgeOffset}px)` }"
								:class="$style.badge"
							>
								<Text size="12" weight="600" color="secondary">
									{{ badgeText }}
								</Text>
							</div>
							<Flex
								ref="tooltipEl"
								:style="{ transform: `translate(${tooltipDynamicXPosition}px, ${tooltipYDataOffset - 40}px)` }"
								direction="column"
								gap="8"
								:class="$style.tooltip"
							>
								<Flex align="center" gap="16">
									<Text size="12" weight="600" color="secondary">Usage</Text>
									<Text size="12" weight="600" color="primary"> {{ formatBytes(tooltipText) }} </Text>
								</Flex>
							</Flex>
						</div>
					</Transition>

					<Flex ref="sizeSeriesChartEl" :class="$style.chart" />
				</Flex>
			</Flex>

			<Flex direction="column" gap="16" wide :class="$style.dataContainer">
				<Text size="13" weight="600" color="primary">Submit Blob Payment Count</Text>

				<Flex direction="column" :class="$style.chart_wrapper">
					<Flex direction="column" justify="between" :class="[$style.axis, $style.y]">
						<Text
							v-if="pfbSeries.length"
							size="12"
							weight="600"
							color="tertiary"
							:style="{ opacity: Math.max(...pfbSeries.map((d) => d.value)) ? 1 : 0 }"
						>
							{{ abbreviate(Math.max(...pfbSeries.map((d) => d.value)), 0) }}
						</Text>
						<Skeleton v-else-if="!pfbSeries.length" w="32" h="12" />

						<Text
							v-if="pfbSeries.length"
							size="12"
							weight="600"
							color="tertiary"
							:style="{
								opacity:
									Math.round(Math.max(...pfbSeries.map((d) => d.value)) / 2) != Math.max(...pfbSeries.map((d) => d.value))
										? 1
										: 0,
							}"
						>
							{{ abbreviate(Math.round(Math.max(...pfbSeries.map((d) => d.value)) / 2), 0) }}
						</Text>
						<Skeleton v-else-if="!pfbSeries.length" w="24" h="12" />

						<Text v-if="pfbSeries.length" size="12" weight="600" color="tertiary"> 0 </Text>
						<Skeleton v-else-if="!pfbSeries.length" w="16" h="12" />
					</Flex>

					<Flex :class="[$style.axis, $style.x]">
						<Flex align="end" justify="between" wide>
							<Text v-if="selectedPeriod.timeframe === 'day'" size="12" weight="600" color="tertiary">
								{{
									DateTime.now()
										.minus({ days: selectedPeriod.value - 1 })
										.toFormat("LLL dd")
								}}
							</Text>
							<Text v-else size="12" weight="600" color="tertiary">
								{{ DateTime.now().minus({ hours: selectedPeriod.value }).set({ minutes: 0 }).toFormat("hh:mm a") }}
							</Text>

							<Text size="12" weight="600" color="tertiary">{{ selectedPeriod.timeframe === "day" ? "Today" : "Now" }}</Text>
						</Flex>
					</Flex>

					<Transition name="fastfade">
						<div v-if="showPfbTooltip" :class="$style.tooltip_wrapper">
							<div
								:style="{ transform: `translate(${tooltipXOffset - 3}px, ${tooltipYDataOffset - 4}px)` }"
								:class="$style.dot"
							/>
							<div :style="{ transform: `translateX(${tooltipXOffset}px)` }" :class="$style.line" />
							<div
								ref="badgeEl"
								:style="{ transform: `translateX(${tooltipXOffset - badgeOffset}px)` }"
								:class="$style.badge"
							>
								<Text size="12" weight="600" color="secondary">
									{{ badgeText }}
								</Text>
							</div>
							<Flex
								ref="tooltipEl"
								:style="{ transform: `translate(${tooltipDynamicXPosition}px, ${tooltipYDataOffset - 40}px)` }"
								direction="column"
								gap="8"
								:class="$style.tooltip"
							>
								<Flex align="center" gap="16">
									<Text size="12" weight="600" color="secondary">Count</Text>
									<Text size="12" weight="600" color="primary"> {{ abbreviate(tooltipText) }} </Text>
								</Flex>
							</Flex>
						</div>
					</Transition>

					<Flex ref="pfbSeriesChartEl" :class="$style.chart" />
				</Flex>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.dataContainer {
	padding: 20px;
	background: rgba(255,255,255,0.05);
	border-radius: 4px;
}

.header {
	border-radius: 8px 8px 0 0;
	background: rgba(255, 255, 255, 0.1);
	padding: 20px;
}

.data {
	border-radius: 0 0 8px 8px;
	background: rgba(255, 255, 255, 0.1);
	padding: 0 20px 20px 20px;
}

.chart_wrapper {
	position: relative;

	height: 180px;
}

.chart {
	position: absolute;

	& svg {
		overflow: visible;
	}
}

.axis {
	position: absolute;
	top: 0;
	right: 0;

	&.x {
		bottom: 6px;
		left: 40px;
	}

	&.y {
		bottom: 34px;
		left: 0;
	}
}

.tooltip_wrapper {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;

	& .dot {
		width: 6px;
		height: 6px;
		border-radius: 50px;
		background: #F7931A;
		box-shadow: 0 0 0 4px #ecae62;
		transition: all 0.15s ease;
	}

	& .line {
		position: absolute;
		top: 0;
		bottom: 32px;

		border-left: 1px dashed var(--op-10);

		transition: all 0.15s ease;
	}

	& .badge {
		position: absolute;
		bottom: 4px;

		background: var(--card-background);

		transition: all 0.15s ease;
	}

	& .tooltip {
		pointer-events: none;
		position: absolute;
		z-index: 10;

		background: var(--card-background);
		border-radius: 6px;
		box-shadow: inset 0 0 0 1px var(--op-5), 0 14px 34px rgba(0, 0, 0, 15%), 0 4px 14px rgba(0, 0, 0, 5%);

		padding: 8px;

		transition: all 0.2s ease;
	}
}

@media (max-width: 800px) {
	.data {
		flex-direction: column;
	}
}
</style>
