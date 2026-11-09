<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** Services */
import { comma } from "@/services/utils"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** API */
import { fetchAvgBlockTime } from "@/services/api/block"

/** Store */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()

const lastBlock = computed(() => appStore.latestBlocks[0])

const isInited = ref(false)

let blockProgressInterval = null
let delayInterval = null

const avgBlockTime = ref(0)

const delay = ref(0)
const isDelayed = ref(false)

const blockProgress = ref(0)
const fillOffset = computed(() => {
	if (!blockProgress.value) return 0

	const offset = (100 * blockProgress.value) / avgBlockTime.value
	return offset
})

const init = async () => {
	const { data } = await fetchAvgBlockTime({ from: parseInt(DateTime.now().minus({ hours: 3 }).ts / 1_000) })
	avgBlockTime.value = data.value / 1_000

	const offsetSinceLastBlock = Math.abs(DateTime.fromISO(lastBlock.value.time).diffNow("seconds").values.seconds + avgBlockTime.value)

	if (offsetSinceLastBlock > avgBlockTime.value) {
		isDelayed.value = true
		delay.value = Math.floor(offsetSinceLastBlock - avgBlockTime.value)
		delayInterval = setInterval(() => {
			delay.value += 1
		}, 1_000)
	}

	blockProgress.value = Math.floor(offsetSinceLastBlock)
	if (!isDelayed.value) startBlockProgress()

	isInited.value = true
}

onMounted(() => {
	if (appStore.isLatestBlocksLoaded) init()
})

watch(
	() => appStore.isLatestBlocksLoaded,
	() => {
		init()
	},
)

const startBlockProgress = () => {
	blockProgressInterval = setInterval(() => {
		blockProgress.value += 1

		if (blockProgress.value > avgBlockTime.value) {
			isDelayed.value = true
			clearInterval(blockProgressInterval)

			delayInterval = setInterval(() => {
				delay.value += 1
			}, 1_000)
		}
	}, 1_000)
}

watch(
	() => lastBlock.value,
	() => {
		if (!isInited.value) return

		isDelayed.value = false

		clearInterval(blockProgressInterval)
		clearInterval(delayInterval)

		blockProgress.value = 0
		delay.value = 0

		startBlockProgress()
	},
)

onBeforeUnmount(() => {
	clearInterval(blockProgressInterval)
})
</script>

<template>
	<NuxtLink :to="lastBlock && `/block/${lastBlock.height}`" :class="$style.wrapper">
		<Flex justify="between">
			<Flex direction="column" gap="10">
				<Flex align="center" gap="4">
					<Text size="20" weight="600" color="primary"> Block </Text>

					<Text class="rubik_font" v-if="lastBlock" size="20" weight="600" color="yellowNew"> {{ comma(lastBlock.height) }}</Text>
					<Skeleton v-else w="60" h="12" />
				</Flex>

				<Flex align="center" gap="6">
					<Icon name="time" size="12" color="tertiary" :class="$style.time_icon" />
					<Text size="12" weight="500" color="tertiary">Awaiting new block</Text>
				</Flex>
			</Flex>

			<Tooltip>
				<Flex direction="column" gap="8" align="end">
					<Text class="rubik_font" v-if="lastBlock" size="14" weight="600" color="primary"> ~{{ Math.ceil(avgBlockTime) }}s </Text>
					<Skeleton v-else w="32" h="14" />

					<Flex align="center" gap="4">
						<Text size="12" weight="500" color="tertiary"> Block Time </Text>
						<Icon name="help" size="12" color="tertiary" />
					</Flex>
				</Flex>

				<template #content> Average block time based on the last 3 hours </template>
			</Tooltip>
		</Flex>

		<Flex align="center" justify="center" :class="$style.bar">
			<Transition name="fade">
				<svg width="200%" height="28" :class="$style.lines">
					<pattern id="diagonalHatch1" width="20" height="20" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
						<line x1="0" y1="0" x2="0" y2="20" style="stroke: var(--op-10); stroke-width: 15" />
					</pattern>
					<rect x="0" y="0" width="100%" height="100%" fill="url(#diagonalHatch1)"></rect>
				</svg>
			</Transition>

			<Flex v-if="!isDelayed" align="center" justify="between" wide>
				<Icon name="block" size="16" color="primary" />

				<div v-for="item in 14" :key="item" :class="$style.dot" />

				<Flex justify="end" :class="$style.timer">
					<Text size="13" weight="600" color="primary">{{ blockProgress }}</Text>
					<Text size="13" weight="600" color="tertiary">s</Text>
				</Flex>
			</Flex>
			<Flex v-else align="center" gap="4">
				<Text size="13" weight="600" color="secondary">Delayed by </Text>
				<Text size="13" weight="600" color="primary">{{ delay }}s</Text>
			</Flex>

			<div v-if="!isDelayed" :style="{ transform: `scaleX(${fillOffset / 100})` }" :class="$style.fill"></div>
			<div v-else :class="[$style.fill, $style.delayed]" />
		</Flex>
	</NuxtLink>
</template>

<style module>
.wrapper {
	display: flex;
	justify-content: space-between;
	flex-direction: column;
	min-height: 122px;
	border-radius: 12px;
	background: rgba(255,255,255,0.1);

	padding: 16px;

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
	position: relative;
	height: 28px;
	z-index: 0;

	box-shadow: 0 0 0 2px var(--op-5);
	border-radius: 6px;
	background: var(--block-progress-background);
	overflow: hidden;

	padding: 0 8px;

	.lines {
		position: absolute;

		top: 0;
		left: 0;
		bottom: 0;

		transform: translateX(-50%);

		animation: lines-movement 25s linear infinite;
	}
}

@keyframes lines-movement {
	0% {
		transform: translateX(-50%);
	}

	50% {
		transform: translateX(0%);
	}

	100% {
		transform: translateX(-50%);
	}
}

.dot {
	width: 4px;
	height: 4px;

	border-radius: 50%;
	background: var(--op-30);
}

.timer {
	width: 22px;
}

.fill {
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;

	width: 100%;

	background: #F7931A;

	z-index: -1;

	will-change: transform;
	transition: all 0.9s ease;
	transform-origin: left;

	&.delayed {
		background: var(--op-10);
	}
}

.time_icon {
	animation: rotation 1.5s ease infinite;
}

@keyframes rotation {
	0% {
		transform: rotate(0deg);
	}

	20% {
		transform: rotate(180deg);
	}

	30% {
		transform: rotate(-30deg);
	}

	50% {
		transform: rotate(0deg);
	}

	100% {
		transform: rotate(0deg);
	}
}
</style>
