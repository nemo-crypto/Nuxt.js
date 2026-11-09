<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** Services */
import { comma, formatBytes, abbreviate } from "@/services/utils"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** API */
import { fetchPriceSeries } from "@/services/api/stats"

/** Store */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()

const head = computed(() => appStore.lastHead)
const currentPrice = computed(() => appStore.currentPrice)

const totalSupply = computed(() => head.value.total_supply / 1_000_000)
const totalSupplyUSD = computed(() => totalSupply.value * currentPrice.value?.close)
const totalFees = computed(() => head.value.total_fee / 1_000_000)
const totalFeesUSD = computed(() => totalFees.value * currentPrice.value?.close)

const series = ref([])
const price = reactive({
	value: 0,
	diff: 0,
	side: null,
})

onMounted(async () => {
	const dataSeries = await fetchPriceSeries({ from: parseInt(DateTime.now().minus({ days: 3 }).ts / 1_000) })
	series.value = dataSeries
	appStore.currentPrice = series.value[0]
	price.value = parseFloat(series.value[0]?.close)

	const prevDayClosePrice = parseFloat(series?.value[1]?.close)
	price.diff = (Math.abs(prevDayClosePrice - price?.value) / ((prevDayClosePrice + price.value) / 2)) * 100
	let side = 'stay'
	if (price.value - prevDayClosePrice !== 0) {
		side = price.value - prevDayClosePrice > 0 ? 'rise' : 'fall'
	}
	price.side = side
})
</script>

<template>
	<Flex tag="section" justify="center" wide :class="$style.wrapper">
		<Flex align="center" justify="between" gap="24" wide :class="$style.container">
			<Flex align="center" gap="20" :class="$style.stats">
				<Tooltip>
					<Flex align="center" gap="6" :class="$style.stat" class="hvr-grow">
						<img class="animate__animated animate__fadeInDown" :class="$style.icon" width="20" height="20"
							src="/img/feed-icon-1.svg" />
						<Flex align="center" gap="4">
							<Text class="animate__animated animate__fadeInDown" size="16" weight="500" color="tertiary"
								noWrap :class="$style.key">Total Txs:</Text>

							<Text class="animate__animated animate__fadeInDown" v-if="head" size="16" weight="600"
								noWrap :class="$style.value">{{abbreviate(head.total_tx) }}
							</Text>
							<Skeleton v-else w="40" h="16" />
						</Flex>
					</Flex>

					<template #content>
						<span class="rubik_font">{{ comma(head.total_tx) }}</span>
					</template>
				</Tooltip>

				<div :class="$style.dot" />

				<Tooltip>
					<Flex align="center" gap="6" :class="$style.stat" class="hvr-grow">
						<img class="animate__animated animate__fadeInDown" :class="$style.icon" width="20" height="20"
							src="/img/feed-icon-2.svg" />
						<Flex align="center" gap="4">
							<Text class="animate__animated animate__fadeInDown" size="16" weight="500" color="tertiary"
								noWrap :class="$style.key">Total Supply:</Text>

							<Text class="animate__animated animate__fadeInDown" v-if="head" size="16" weight="600" noWrap
								:class="$style.value">
								{{ abbreviate(totalSupply) }} NUB
							</Text>
							<Skeleton v-else w="55" h="16" />
						</Flex>
					</Flex>

					<template #content>
						<span class="rubik_font">{{ abbreviate(totalSupply) }} NUB </span>
					</template>
				</Tooltip>

				<div :class="$style.dot" />

				<Tooltip>
					<Flex align="center" gap="6" :class="$style.stat" class="hvr-grow">
						<img class="animate__animated animate__fadeInDown" :class="$style.icon" width="20" height="20"
							src="/img/feed-icon-3.svg" />
						<Flex align="center" gap="4">
							<Text class="animate__animated animate__fadeInDown" size="16" weight="500" color="tertiary"
								noWrap :class="$style.key">Total Blobs
								Size:</Text>

							<Text class="animate__animated animate__fadeInDown" v-if="head" size="16" weight="600"
								noWrap :class="$style.value">
								{{formatBytes(head.total_blobs_size)}}
							</Text>
							<Skeleton v-else w="60" h="16" />
						</Flex>
					</Flex>

					<template #content>
						<span class="rubik_font">{{ comma(head.total_blobs_size) }} Bytes</span>
					</template>
				</Tooltip>

				<div :class="$style.dot" />

				<Tooltip>
					<Flex align="center" gap="6" :class="$style.stat" class="hvr-grow">
						<img class="animate__animated animate__fadeInDown" :class="$style.icon" width="20" height="20"
							src="/img/feed-icon-4.svg" />
						<Flex align="center" gap="4">
							<Text class="animate__animated animate__fadeInDown" size="16" weight="500" color="tertiary"
								noWrap :class="$style.key">Total Fees:</Text>

							<Text class="animate__animated animate__fadeInDown" v-if="head" size="16" weight="600" noWrap
								:class="$style.value">
								{{ abbreviate(parseInt(head.total_fee)) }} NUB
							</Text>
							<Skeleton v-else w="55" h="16" />
						</Flex>
					</Flex>

					<template #content>
							<span class="rubik_font">{{ comma(parseInt(head.total_fee)) }} NUB</span>
					</template>
				</Tooltip>

				<Tooltip>
					<Flex align="center" gap="6" :class="$style.stat" class="hvr-grow">
						<img class="animate__animated animate__fadeInDown" :class="$style.icon" width="20" height="20"
							src="/img/feed-icon-5.svg" />
						<Flex align="center" gap="4">
							<Text class="animate__animated animate__fadeInDown" size="16" weight="500" color="tertiary"
								noWrap :class="$style.key">Latest BTC Height:</Text>

							<Text class="animate__animated animate__fadeInDown" v-if="head" size="16" weight="600" noWrap
								:class="$style.value">
								{{comma(head.last_btc_height) }}
							</Text>
							<Skeleton v-else w="55" h="16" />
						</Flex>
					</Flex>

					<template #content>
							<span class="rubik_font">{{ comma(head.last_btc_height) }} </span>
					</template>
				</Tooltip>

				

			</Flex>

			<!-- <Tooltip position="end">
				<Flex align="center" gap="6" :class="$style.stat" class="hvr-grow">
					<Icon class="animate__animated animate__fadeInDown" name="coin" size="16" color="yellowNew" :class="$style.icon" />

					<Flex align="center" gap="4">
						<Text class="animate__animated animate__fadeInDown" size="16" weight="500" color="tertiary" noWrap :class="$style.key">NUB:</Text>

						<Text class="animate__animated animate__fadeInDown" v-if="price.value" size="16" weight="600" noWrap :class="$style.value"> ${{
		price.value.toFixed(2) }}
						</Text>
						<Skeleton v-else w="36" h="16" />
					</Flex>

					<Flex v-if="!isNaN(price.diff)" align="center" gap="4">
						<Icon class="animate__animated animate__fadeInDown" v-if="price.side === 'rise'" name="arrow-circle-right-up" size="16"
							color="greenNew" />
						<Icon class="animate__animated animate__fadeInDown" v-else-if="price.side === 'fall'" name="arrow-circle-right-down" size="12" color="red" />

						<Text class="animate__animated animate__fadeInDown" size="16" weight="600" :color="price.side === 'fall' ? 'red' : 'greenNew'" noWrap>
							{{ price.diff.toFixed(2) }}%</Text>
					</Flex>
					<Skeleton v-else w="50" h="16" />
				</Flex>

				<template #content>
					<Flex direction="column" gap="6">
						<Flex align="center" gap="4">
							<Text class="animate__animated animate__fadeInDown" color="primary">Price diff from the previous day</Text>
						</Flex>

						<Flex v-if="series.length" align="center" gap="4">
							<Text class="animate__animated animate__fadeInDown" color="tertiary">{{ DateTime.fromISO(series[1].time).setLocale("en").toFormat("ff") }}
								-></Text>
							<Text class="animate__animated animate__fadeInDown" color="primary">${{ parseFloat(series[1].close).toFixed(2) }}</Text>
						</Flex>

						<Flex align="center" gap="4">
							<Text class="animate__animated animate__fadeInDown" size="11" color="tertiary">Binance quotes</Text>
						</Flex>
					</Flex>
				</template>
			</Tooltip> -->
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	margin-top: 92px;
	height: 32px;
	background: var(--feed-background);
}

.container {
	max-width: var(--base-width);
	height: 100%;
	margin: 0 24px;

	&::-webkit-scrollbar {
		display: none;
	}

	.stats {
		justify-content: space-between;
		width: 100%;
	}
}

.dot {
	width: 4px;
	height: 4px;
	background-color: var(--op-10);
	border-radius: 50%;
}

.key,
.value,
.icon {
	transition: all 0.2s ease;
	font-style: italic;
}

.value {
	color: var(--op-40);
	font-style: italic;
}

.stat {
	display: flex;
	align-items: center;
}

.stat:hover {
	.icon {
		fill: var(--txt-primary);
	}

	.key {
		color: var(--txt-secondary);
	}

	.value {
		color: var(--txt-secondary);
	}
}

@media (max-width: 900px) {
	.wrapper {
		height: initial;

		padding: 12px 0;
	}

	.container {
		flex-direction: column;
	}

	.stats {
		width: 100%;
		justify-content: center;
		flex-wrap: wrap;
	}
}

@media (max-width: 500px) {
	.container {
		margin: 0 12px;

		.stats {
			justify-content: center;
			width: 100%;
		}
	}
}
</style>
