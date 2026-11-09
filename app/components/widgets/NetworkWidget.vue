<script setup>
/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** API */
import { fetchTPS } from "@/services/api/stats"

const displayTpm = ref(0)
const tpm = ref(0)

const diff = ref(0)

const high = ref(0)
const low = ref(0)

const displayPos = ref(0)
const pos = ref(0)

onMounted(async () => {
	const data = await fetchTPS()

	tpm.value = data.current * 60

	const tpmInterval = setInterval(() => {
		if (displayTpm.value >= tpm.value) {
			clearInterval(tpmInterval)
			return
		}

		displayTpm.value += 0.1
	}, 10)

	diff.value = data.change_last_hour_pct

	high.value = data.high * 60
	low.value = data.low * 60

	pos.value = (100 * (tpm.value - low.value)) / (high.value - low.value)
	const posInterval = setInterval(() => {
		if (displayPos.value >= pos.value) {
			clearInterval(posInterval)
			return
		}

		displayPos.value += 1
	}, 15)
})
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Flex direction="column" gap="20" :class="$style.top">
			<Text size="16" weight="600" color="primary"> Network </Text>

			<Flex direction="column" gap="16">
				<Tooltip position="start" text-align="left">
					<Flex align="start" gap="16">
						<Flex direction="column" gap="6">
							<Text size="40" weight="600" color="primary" :class="[$style.ds_font, $style.tpm_num]">
								{{ displayTpm.toFixed(1) }}
							</Text>
							<Text size="16" weight="700" color="tertiary" :class="$style.ds_font">TXS/M</Text>
						</Flex>

						<Text size="20" weight="600" :class="$style.ds_font" :color="diff > 0 ? 'green' : 'red'">
							{{ diff.toFixed(diff < 1 ? 2 : 0) }}%
						</Text>
					</Flex>

					<template #content>
						<Flex direction="column" gap="6">
							<Text>Transactions per minute</Text>
							<Text color="tertiary">Calculated based on the last 24 hours</Text>
						</Flex>
					</template>
				</Tooltip>
			</Flex>
		</Flex>

		<Flex direction="column" justify="between" gap="16" :class="$style.bottom">
			<Flex align="center" gap="6">
				<Icon name="level" size="12" color="secondary" />
				<Text size="13" weight="600" height="110" color="secondary">TPM Level</Text>
			</Flex>

			<Flex direction="column" gap="8">
				<Tooltip position="start" wide>
					<Flex gap="2" :class="$style.bars">
						<div v-for="item in 10" :key="item" :class="[$style.bar, displayPos >= item * 10 && $style.active]" />
					</Flex>

					<template #content>
						<Flex align="start" direction="column" gap="6">
							<Text color="secondary">
								High: <Text color="primary">{{ high.toFixed(4) }} <Text color="secondary">TPM</Text></Text>
							</Text>

							<Text color="secondary">
								Current: <Text color="primary">{{ tpm.toFixed(4) }} <Text color="secondary">TPM</Text></Text>
							</Text>

							<Text color="secondary">
								Low: <Text color="primary">{{ low.toFixed(4) }} <Text color="secondary">TPM</Text></Text>
							</Text>

							<Text color="tertiary"> Based on the last 7 days </Text>
						</Flex>
					</template>
				</Tooltip>
			</Flex>

			<Flex align="center" justify="between">
				<Text v-if="!isNaN(pos)" size="16" weight="600" color="tertiary" :class="$style.ds_font"> {{ pos.toFixed(2) }}% </Text>
				<Text v-else size="16" weight="600" color="tertiary" :class="$style.ds_font">0%</Text>

				<Text size="12" weight="600" color="support"> Throughput level </Text>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	background: var(--card-background);
	border-radius: 12px;
	overflow: hidden;
}

.top {
	padding: 16px 16px 20px 16px;
}

.tpm_num {
	background: -webkit-linear-gradient(var(--txt-primary), var(--txt-tertiary));
	background-clip: text;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

.ds_font {
	font-family: "Space Grotesk";
}

.bottom {
	height: 100%;

	background: var(--network-widget-background);
	border-top: 2px solid var(--op-5);

	padding: 20px 16px;
}

.bars {
	width: fit-content;
	height: 20px;

	border-radius: 5px;
	border: 1px solid var(--txt-secondary);

	padding: 2px;

	.bar {
		width: 16px;
		height: 14px;

		background: linear-gradient(var(--txt-primary), var(--txt-support));
		border-radius: 2px;
		opacity: 0.2;

		transition: all 0.5s ease;

		&.active {
			background: linear-gradient(var(--txt-primary), var(--txt-support));
			opacity: 1;
		}
	}
}

@media (max-width: 1100px) {
	.wrapper {
		flex-direction: row;
	}

	.top {
		flex: 1;
	}

	.bottom {
		height: auto;

		border-top: initial;
		border-left: 2px solid var(--op-5);
	}
}

@media (max-width: 420px) {
	.wrapper {
		flex-direction: column;
	}

	.top {
		flex: initial;
	}

	.bottom {
		border-top: 2px solid var(--op-5);
		border-left: initial;
	}
}
</style>
