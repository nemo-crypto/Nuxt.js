<script setup>
/** Services */
import { comma } from "@/services/utils"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** Store */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()

const inputEl = ref()
const isInputActive = ref(false)

const gasLimit = ref(null)
const handleGasLimitInput = () => {
	if (parseFloat(gasLimit.value.replace(/[^0-9.]/g, "")) > 5_665_140_000) {
		gasLimit.value = "5 665 140 000"
		return
	}
	gasLimit.value = comma(gasLimit.value.replace(/[^0-9.]/g, ""), " ")
}

const gasFee = computed(() => {
	const fast = Math.ceil(appStore.gas.fast * parseFloat(gasLimit.value.replaceAll(" ", "")))
	const median = Math.ceil(appStore.gas.median * parseFloat(gasLimit.value.replaceAll(" ", "")))
	const slow = Math.ceil(appStore.gas.slow * parseFloat(gasLimit.value.replaceAll(" ", "")))

	return { fast, median, slow }
})
</script>

<template>
	<Flex direction="column" :class="$style.wrapper">
		<Flex direction="column" gap="12" :class="$style.head">
			<Flex align="center" justify="between">
				<Text size="16" weight="600" color="primary">Gas Price</Text>

				<Tooltip position="center" side="left">
					<img width="16" height="16" src="/img/heloInfo.svg" />

					<template #content>
						<Flex direction="column" gap="8">
							<Text align="left" height="140">
								In this form you can calculate<br />
								<Text color="primary" weight="700">Gas Fee</Text> using the desired
								<Text color="primary" weight="700">Gas Limit</Text>
							</Text>

							<Flex align="center" gap="4">
								<Text mono weight="600" color="primary">Gas Fee</Text> <Icon name="equals" size="12" color="secondary" />
								<Text mono weight="600" color="primary">Gas Price</Text> <Icon name="close" size="12" color="secondary" />
								<Text mono weight="600" color="primary">Gas Limit</Text>
							</Flex>

							<Text align="left" height="140" color="tertiary"
								>To quickly access the calculator, use the <br />command menu "<Text color="secondary"
									>Run Fee Calculator</Text
								>"</Text
							>
						</Flex>
					</template>
				</Tooltip>
			</Flex>

			<Flex justify="between">
				<Flex direction="column" gap="6">
					<Flex align="center" gap="6">
						<Icon name="gas_fast" size="16" color="greenNew" />
						<Text size="11" weight="600" color="secondary">Fast</Text>
					</Flex>

					<Flex align="center" gap="6">
						<Text size="12" weight="600" color="primary">
							{{
								Number(appStore.gas.fast)
									.toFixed(4)
									.replace(/\.?0*$/, "")
							}}
							<Text size="10" color="secondary">UNUB</Text>
						</Text>
						<CopyButton :text="appStore.gas.fast" size="14" />
					</Flex>
				</Flex>
				<Flex direction="column" gap="6">
					<Flex align="center" gap="6">
						<Icon name="gas_median" size="16" color="yellowNew" />
						<Text size="11" weight="600" color="secondary">Median</Text>
					</Flex>

					<Flex align="center" gap="6">
						<Text size="12" weight="600" color="primary">
							{{
								Number(appStore.gas.median)
									.toFixed(4)
									.replace(/\.?0*$/, "")
							}}
							<Text size="10" color="secondary">UNUB</Text>
						</Text>
						<CopyButton :text="appStore.gas.median" size="14" />
					</Flex>
				</Flex>
				<Flex direction="column" gap="6">
					<Flex align="center" gap="6">
						<Icon name="gas_slow" size="16" color="secondary" />
						<Text size="11" weight="600" color="secondary">Slow</Text>
					</Flex>

					<Flex align="center" gap="6">
						<Text size="12" weight="600" color="primary">
							{{
								Number(appStore.gas.slow)
									.toFixed(4)
									.replace(/\.?0*$/, "")
							}}
							<Text size="10" color="secondary">UNUB</Text>
						</Text>
						<CopyButton :text="appStore.gas.slow" size="14" />
					</Flex>
				</Flex>
			</Flex>

			<Flex align="center" justify="center" :class="$style.multiply">
				<div />
				<Icon name="close" size="12" color="primary" />
				<div />
			</Flex>

			<Flex @click="inputEl.focus()" wide direction="column" gap="6" :class="[$style.gas_limit, isInputActive && $style.active]">
				<Text size="11" weight="600" color="tertiary" no-wrap>Gas Limit</Text>

				<input
					v-model="gasLimit"
					ref="inputEl"
					@input="handleGasLimitInput"
					@focus="isInputActive = true"
					@blur="isInputActive = false"
					placeholder="Specify your tx’s Gas Limit"
					:class="$style.input_box"
				/>
			</Flex>
		</Flex>

		<Flex wide justify="center" :class="$style.mid"> <Icon name="equals" size="12" color="primary" /> </Flex>

		<Flex justify="between" :class="$style.bottom">
			<Flex direction="column" gap="6">
				<Text size="11" weight="600" color="tertiary">Fast Fee</Text>

				<Flex v-if="gasLimit && gasFee.fast" align="center" gap="6">
					<Text size="12" weight="600" color="primary">
						{{ comma(gasFee.fast, " ") }} <Text size="10" color="secondary">UNUB </Text></Text
					>
					<CopyButton :text="gasFee.fast" size="10" />
				</Flex>
				<Text v-else size="12" weight="600" color="tertiary"> 0 </Text>
			</Flex>
			<Flex direction="column" gap="6">
				<Text size="11" weight="600" color="tertiary">Median Fee</Text>

				<Flex v-if="gasLimit && gasFee.median" align="center" gap="6">
					<Text size="12" weight="600" color="primary">
						{{ comma(gasFee.median, " ") }} <Text size="10" color="secondary">UNUB </Text>
					</Text>
					<CopyButton :text="gasFee.median" size="10" />
				</Flex>
				<Text v-else size="12" weight="600" color="tertiary"> 0 </Text>
			</Flex>
			<Flex direction="column" gap="6">
				<Text size="11" weight="600" color="tertiary">Slow Fee</Text>

				<Flex v-if="gasLimit && gasFee.slow" align="center" gap="6">
					<Text size="12" weight="600" color="primary">
						{{ comma(gasFee.slow, " ") }} <Text size="10" color="secondary">UNUB </Text>
					</Text>
					<CopyButton :text="gasFee.slow" size="10" />
				</Flex>
				<Text v-else size="12" weight="600" color="tertiary"> 0 </Text>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>

.multiply {
	position: relative;
	height: 6px;

	padding: 10px 0 6px 0;

	& svg {
		position: absolute;
		top: 50%;
		box-sizing: content-box;

		transform: translateY(-50%);

		border-radius: 50%;
		background: var(--yellowNew);

		padding: 3px;
	}

	& div {
		width: 100%;
		height: 2px;

		background: rgba(255, 255, 255, 0.20);
	}
}

.mid {
	position: relative;
	height: 6px;

	& svg {
		position: absolute;
		top: 50%;
		box-sizing: content-box;

		transform: translateY(-50%);

		border-radius: 50%;
		background: var(--yellowNew);

		padding: 3px;
	}
}

.bottom {
	border-radius: 3px 3px 8px 8px;
	background: var(--op-5);

	padding: 10px;
	padding-top: 12px;
}

.gas_limit {
	padding: 10px 15px;
	background: rgba(255,255,255,0.1);
	border-radius: 4px 4px 4px 4px;
	border: 1px solid #F7931A;
	transition: box-shadow 0.2s ease;

	&:hover {
		box-shadow: 0 0 0 2px var(--op-5);
	}

	&.active {
		box-shadow: 0 0 0 2px var(--op-30);
	}
}

.input_box {
	width: 100%;

	font-size: 12px;
	font-weight: 600;
	color: var(--txt-primary);

	padding: 0;
}
</style>
