<script setup>
/** Services */
import { amountToString } from "@/services/utils"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** Store */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()

const currentPrice = computed(() => appStore.currentPrice)

const props = defineProps({
	amount: {
		type: Object,
		required: true,
		default: {
			value: 0,
		},
	},
	styles: {
		type: Object,
		required: false,
		default: {
			amount: {},
			currency: {},
		},
	},
})

const displayCurrency = ref("NUB")

const defaultAmount = {
	unit: "unub",
	currency: "NUB",
	decimal: 2,
}

const defaultAmountStyle = {
	color: "primary",
	size: "12",
	weight: "600",
}

const defaultCurrencyStyle = {
	color: "tertiary",
	size: "12",
	weight: "600",
}

const calculatedAmount = computed(() => {
	let finalAmount = {
		amount: {
			...defaultAmount,
			...props.amount,
		},
		display: {
			show: {
				value: 0,
				currency: "",
			},
			tooltip: {
				value: 0,
				currency: "",
			},
		},
		styles: {
			amount: {
				...defaultAmountStyle,
				...props.styles.amount,
			},
			currency: {
				...defaultCurrencyStyle,
				...props.styles.currency,
			},
		}
	}

	let tiaDisplay
	let tiaExchange
	if (finalAmount.amount.unit === 'unub') {
		tiaExchange = finalAmount.amount.value / 1_000_000

		if (finalAmount.amount.currency === "NUB") {
			tiaDisplay = finalAmount.amount.value / 1_000_000
		} else {
			tiaDisplay = finalAmount.amount.value
		}
	} else {
		tiaDisplay = finalAmount.amount.value
		tiaExchange = finalAmount.amount.value
	}

	let amountConverted = tiaExchange * (currentPrice.value?.close ? currentPrice.value.close : 0)

	if (displayCurrency.value === "NUB") {
		finalAmount.display.show = {
			value: amountToString(tiaDisplay, finalAmount.amount.decimal),
			currency: finalAmount.amount.currency,
		}
		finalAmount.display.tooltip = {
			value: amountToString(amountConverted, 2),
			currency: "USD",
		}
	} else {
		finalAmount.display.show = {
			value: amountToString(amountConverted, 2),
			currency: "USD",
		}
		finalAmount.display.tooltip = {
			value: amountToString(tiaDisplay, finalAmount.amount.decimal),
			currency: finalAmount.amount.currency,
		}
	}

	return finalAmount
})
</script>

<template>
	<!-- <Tooltip position="start" delay="500"> -->
		<Flex align="center" gap="4">
			<Text
				:size="calculatedAmount.styles.amount.size"
				:weight="calculatedAmount.styles.amount.weight"
				:color="parseFloat(amount.value) ? calculatedAmount.styles.amount.color : 'tertiary'"
			>
				{{ calculatedAmount.display.show.value }}
			</Text>

			<Text
				:size="calculatedAmount.styles.currency.size"
				:weight="calculatedAmount.styles.currency.weight"
				:color="calculatedAmount.styles.currency.color"
			>
				{{ calculatedAmount.display.show.currency }}
			</Text>
		</Flex>
		<!-- <template #content>
			<Flex align="center" gap="4">
				<Text
					:size="calculatedAmount.styles.amount.size"
					:weight="calculatedAmount.styles.amount.weight"
					:color="parseFloat(amount.value) ? calculatedAmount.styles.amount.color : 'tertiary'"
				>
					{{ calculatedAmount.display.tooltip.value }}
				</Text>

				<Text
					:size="calculatedAmount.styles.currency.size"
					:weight="calculatedAmount.styles.currency.weight"
					:color="calculatedAmount.styles.currency.color"
				>
					{{ calculatedAmount.display.tooltip.currency }}
				</Text>
			</Flex>
		</template> -->
	<!-- </Tooltip> -->
</template>

<style module>
.wrapper {
	width: fit-content;
}

.text {
	text-overflow: ellipsis;
	overflow: hidden;
}
</style>
