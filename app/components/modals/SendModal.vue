<script setup>
/** Vendor */
import { Dec, DecUtils } from "@keplr-wallet/unit"

/** UI */
import Modal from "@/components/ui/Modal.vue"
import Input from "@/components/ui/Input.vue"
import Tooltip from "@/components/ui/Tooltip.vue"
import Button from "@/components/ui/Button.vue"

/** API */
import { search } from "@/services/api/search"

/** Services */
import { normalizeAmount, purgeNumber, comma } from "@/services/utils/amounts"
import { simulateMsgs, sendMsgs } from "@/services/keplr"
import { MsgSend } from "@/services/proto/gen/msg_send"

/** Store */
import { useAppStore } from "@/store/app"
import { useCacheStore } from "@/store/cache"
import { useNotificationsStore } from "@/store/notifications"
const appStore = useAppStore()
const cacheStore = useCacheStore()
const notificationsStore = useNotificationsStore()

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
})

const MAX_DIGITS = 6

const inputEl = ref()

const amount = ref()
// const amountInUSD = computed(() => {
// 	if (!amount.value || !parseFloat(appStore.currentPrice?.close)) return 0

// 	const rawAmount = parseFloat(amount.value?.replaceAll(" ", ""))
// 	return rawAmount * parseFloat(appStore.currentPrice?.close)
// })

const address = ref()
const addressError = ref("")
const addressSuccess = ref(false)
const isAddressNotFound = ref(false)

// liweis: nubit1mn07g3w527lc0zgt47456pglq8le9gyt2zkwzg

const estimatedGasLimit = ref(0)
const customGasLimit = ref(0)
const gasLimitItems = ref([
	{
		icon: "zap",
		name: "Estimated",
	},
	{
		icon: "edit",
		name: "Custom",
	},
])
const selectedGasLimit = ref(gasLimitItems.value[0].name)

const gasFeeItems = ref([
	{
		name: "Fast",
	},
	{
		name: "Median",
	},
	{
		name: "Slow",
	},
])
const selectedGasFee = ref(gasFeeItems.value[0].name)

const handleAmountInput = (e) => {
	if (!amount.value.length) amount.value = ""

	const normalizedAmount = normalizeAmount(amount.value, appStore.balance, appStore.balance.toString())
	if (typeof normalizedAmount === "string") {
		amount.value = normalizedAmount
		return
	}

	amount.value = comma(purgeNumber(amount.value), " ", MAX_DIGITS)
}

const handleGasLimitInput = (e) => {
	if (!customGasLimit.value.length) customGasLimit.value = ""

	const normalizedAmount = normalizeAmount(customGasLimit.value, 1_000_000_000, "1 000 000 000")
	if (typeof normalizedAmount === "string") {
		customGasLimit.value = normalizedAmount
		return
	}

	customGasLimit.value = comma(purgeNumber(customGasLimit.value), " ", MAX_DIGITS)
}

watch(
	() => selectedGasLimit.value,
	() => {
		switch (selectedGasLimit.value) {
			case "Estimated":
				runGasLimitEstimation()
				break

			case "Custom":
				break
		}
	},
)

watch(
	() => address.value,
	async () => {
		if (!address.value) return

		isAddressNotFound.value = false

		if ((!address.value.startsWith("nubit") && address.value.length > 8) || address.value.length > 47) {
			addressError.value = "Validation error"
			return
		}

		if (address.value === appStore.address) {
			addressError.value = "Destination is your own wallet"
			return
		}

		if (address.value.startsWith("nubit") && address.value.length === 47) {
			addressSuccess.value = true

			const { data } = await search(address.value)
			if (!data.value.length) isAddressNotFound.value = true
		} else {
			addressSuccess.value = false
		}

		addressError.value = ""
	},
)

const calcGasFee = (target) => {
	const gasLimit = typeof estimatedGasLimit.value === "number" ? estimatedGasLimit.value : estimatedGasLimit.value.replaceAll(" ", "")
	return comma((gasLimit * appStore.gas[target.toLowerCase()]).toFixed(2))
}

const runGasLimitEstimation = async () => {
	const protoMsgs = {
		typeUrl: "/cosmos.bank.v1beta1.MsgSend",
		value: MsgSend.encode({
			fromAddress: "nubit185nxndy8jth358ulxjxc297ecnvpj3vpa7s76x",
			toAddress: "nubit1m2h5nmphceylvqxu2jgrsc2v055sajs6krwq4m",
			amount: [
				{
					denom: "unub",
					amount: DecUtils.getTenExponentN(6).mul(new Dec(1)).truncate().toString(),
				},
			],
		}).finish(),
	}

	const gasUsed = await simulateMsgs(
		appStore.network,
		"nubit185nxndy8jth358ulxjxc297ecnvpj3vpa7s76x",
		[protoMsgs],
		[{ denom: "unub", amount: "1" }],
	)
	estimatedGasLimit.value = parseInt(gasUsed)
}

const warningBannerText = ref("")

const isAwaiting = ref(false)
const isReadyToContinue = computed(() => {
	return (
		!addressError.value.length &&
		amount.value &&
		address.value?.length &&
		((selectedGasLimit.value === "Estimated" && estimatedGasLimit.value) ||
			(selectedGasLimit.value === "Custom" && customGasLimit.value))
	)
})

watch(
	() => props.show,
	async () => {
		if (props.show) {
			if (!appStore.address?.length) {
				warningBannerText.value = "Keplr wallet connection is required to send NUB."
			} else {
				warningBannerText.value = "The transaction will be performed on the test network."
			}

			if (cacheStore.current.address) {
				address.value = cacheStore.current.address.hash
			}

			runGasLimitEstimation()

			nextTick(() => {
				inputEl.value.inputEl.focus()
			})
		} else {
			amount.value = 0
			address.value = null
			selectedGasLimit.value = "Estimated"
			customGasLimit.value = 0
		}
	},
)

const handleContinue = async () => {
	const key = await window.keplr?.getKey(appStore.network.chainId)

	const proto = [
		{
			typeUrl: "/cosmos.bank.v1beta1.MsgSend",
			value: MsgSend.encode({
				fromAddress: appStore.address,
				toAddress: address.value,
				amount: [
					{
						denom: "unub",
						amount: DecUtils.getTenExponentN(6)
							.mul(new Dec(parseFloat(amount.value)))
							.truncate()
							.toString(),
					},
				],
			}).finish(),
		},
	]
	const stdFee = {
		amount: [
			{
				denom: "nubit",
				amount: 0,
			},
		],
		gas: selectedGasLimit.value === "Custom" ? customGasLimit.value.replaceAll(" ", "") : estimatedGasLimit.value,
	}

	try {
		isAwaiting.value = true
		await sendMsgs(appStore.network, key.bech32Address, proto, stdFee)
		isAwaiting.value = false

		notificationsStore.create({
			notification: {
				type: "success",
				icon: "check-circle",
				title: `Successfuly sent`,
				autoDestroy: true,
			},
		})

		emit("onClose")
	} catch (e) {
		isAwaiting.value = false

		if (e.message.startsWith("Request rejected")) {
			notificationsStore.create({
				notification: {
					type: "warning",
					icon: "danger",
					title: `The request in Kepler was denied`,
					autoDestroy: true,
				},
			})
			return
		}

		if (e.message.startsWith("out of gas")) {
			notificationsStore.create({
				notification: {
					type: "warning",
					icon: "danger",
					title: `Not enough gas`,
					description: `Try using estimated gas or manually enter custom value`,
					autoDestroy: true,
				},
			})
			return
		}

		notificationsStore.create({
			notification: {
				type: "warning",
				icon: "danger",
				title: `Something went wrong`,
				description: e.message,
				autoDestroy: true,
			},
		})
	}
}
</script>

<template>
	<Modal :show="show" @onClose="emit('onClose')" width="650" disable-trap>
		<Flex direction="column" gap="24">
			<Text size="20" weight="600" color="yellowNew">Send</Text>

			<Flex direction="column" gap="24">
				<Flex align="center" gap="12" :class="$style.wallet">
					<Icon name="address" size="32" color="yellowNew" />

					<Flex direction="column" gap="6" :class="$style.metadata">
						<Text size="16" weight="600" color="yellowNew">
							{{ appStore.balance }} NUB
							<!-- <Text size="13" weight="500" color="secondary">
								${{ (appStore.balance * parseFloat(appStore.currentPrice.close)).toFixed(2) }}
							</Text> -->
						</Text>

						<Text size="14" weight="500" color="yellowNew" :selectable="true"> {{ appStore.address }} </Text>
					</Flex>

					<Flex direction="column" justify="between" :class="$style.bg">
						<Flex v-for="i in 8" :key="i" align="center" justify="between">
							<div
								v-for="j in 50"
								:key="j"
								:class="$style.circle"
								:style="{
									'--start': `${(Math.random() * 10) / 100}`,
									'--end': `${(Math.random() * (90 - 10)) / 100}`,
									'--delay': `${Math.random() * 2}s`,
								}"
							/>
						</Flex>
					</Flex>
				</Flex>

				<Flex direction="column" gap="8">
					<Input
						v-model="amount"
						@input="handleAmountInput"
						label="Amount"
						placeholder="0.00"
						ref="inputEl"
						suffix="NUB"
						autofocus
						disable-paste
					>
						<template #rightText>
							<!-- <Text size="12" weight="600" color="secondary"> ${{ comma(amountInUSD) }} </Text> -->
						</template>
					</Input>
				</Flex>

				<Flex direction="column" gap="8">
					<Input v-model="address" label="Address" placeholder="Destination" ref="inputEl">
						<template #rightText>
							<Flex v-if="addressError.length" align="center" gap="4">
								<Icon name="danger" size="12" color="yellow" />
								<Text size="12" weight="600" color="yellow">{{ addressError }}</Text>
							</Flex>
							<Icon v-else-if="addressSuccess" name="check-circle" size="12" color="green" />
							<Text v-else />
						</template>
					</Input>

					<Flex v-if="isAddressNotFound" align="center" gap="4">
						<Icon name="danger" size="12" color="yellow" />
						<Text size="12" weight="500" color="tertiary">
							This address is not found, but you can still send the transaction
						</Text>
					</Flex>
				</Flex>

				<div :class="$style.divider" />

				<Flex direction="column" gap="8">
					<Tooltip position="start">
						<Flex align="center" gap="4">
							<Text size="12" weight="600" color="secondary">Gas Limit</Text>
							<Icon name="info" size="12" color="tertiary" />
						</Flex>

						<template #content> Tooltip about estimated & custom gas limit </template>
					</Tooltip>

					<Flex align="center" justify="between" gap="12">
						<Flex
							v-for="item in gasLimitItems"
							:key="item.name"
							@click="selectedGasLimit = item.name"
							gap="8"
							align="center"
							justify="center"
							wide
							:class="[$style.select_item, selectedGasLimit === item.name && $style.active]"
						>
							<Icon :name="item.icon" size="12" color="secondary" />
							<Text size="13" weight="600" color="primary">{{ item.name }}</Text>

							<Text v-if="estimatedGasLimit && item.name === 'Estimated'" size="13" weight="600" color="secondary">
								~{{ comma(estimatedGasLimit) }}
							</Text>
						</Flex>
					</Flex>
				</Flex>

				<Input
					v-if="selectedGasLimit === 'Custom'"
					v-model="customGasLimit"
					@input="handleGasLimitInput"
					label="Custom Gas Limit"
					placeholder="0.00"
				/>

				<Flex direction="column" gap="12" style="opacity: 0.3; pointer-events: none">
					<Flex direction="column" gap="8">
						<Text size="12" weight="600" color="secondary">Gas Fees</Text>

						<Flex align="center" justify="between" gap="12">
							<Flex
								v-for="item in gasFeeItems"
								:key="item.name"
								@click="selectedGasFee = item.name"
								direction="column"
								gap="8"
								wide
								:class="[$style.select_item, selectedGasFee === item.name && $style.active]"
							>
								<Text size="13" weight="600" color="primary">{{ item.name }}</Text>
								<Text size="12" weight="500" color="secondary">{{ calcGasFee(item.name) }} UNUB</Text>
							</Flex>
						</Flex>
					</Flex>

					<Flex align="center" justify="between">
						<Tooltip position="start" text-align="start">
							<Flex align="center" gap="4">
								<Icon name="gas" size="12" color="tertiary" />
								<Text size="12" weight="600" color="tertiary">Gas prices</Text>
							</Flex>

							<template #content>
								<Flex direction="column" gap="6">
									<Text color="tertiary">
										Fast: <Text color="secondary">{{ appStore.gas.fast }}</Text> UNUB
									</Text>
									<Text color="tertiary">
										Median: <Text color="secondary">{{ appStore.gas.median }}</Text> UNUB
									</Text>
									<Text color="tertiary">
										Slow: <Text color="secondary">{{ appStore.gas.slow }}</Text> UNUB
									</Text>
								</Flex>
							</template>
						</Tooltip>

						<!-- 	<NuxtLink to="/gas" @click="emit('onClose')">
							<Flex align="center" gap="4">
								<Text size="12" weight="600" color="tertiary">Gas Tracker</Text>
								<Icon name="arrow-narrow-up-right" size="12" color="tertiary" />
							</Flex>
						</NuxtLink> -->
					</Flex>
				</Flex>

				<Flex gap="6">
					<Icon name="info" size="12" color="tertiary" style="margin-top: 1px" />
					<Text size="12" weight="500" height="140" color="tertiary">
						Keplr does not currently support receiving a Gas Fee from outside.<br />
						You need to select the appropriate fee in the pop-up window.
					</Text>
				</Flex>
			</Flex>

			<Flex align="center" gap="12" :class="$style.warning_banner">
				<Icon name="danger" size="16" color="yellow" />
				<Text size="13" height="140" weight="500" color="tertiary" style="max-width: 350px">
					{{ warningBannerText }}
				</Text>
			</Flex>

			<Button :class="$style.continueBtn" @click="handleContinue" type="secondary" size="small" wide :disabled="!isReadyToContinue || isAwaiting">
				{{ isAwaiting ? "Awaiting..." : "Continue" }}
			</Button>
		</Flex>
	</Modal>
</template>

<style module>
.continueBtn {
	background: linear-gradient(rgb(243 57 40 / 50%), var(--op-3)) !important;
}

.wallet {
	position: relative;
	border-radius: 50px;
	background: linear-gradient(rgb(243 57 40 / 20%), var(--op-3)) !important;
	padding: 16px;
	overflow: hidden;

	.metadata {
		z-index: 1;
	}

	& svg {
		z-index: 1;
		box-sizing: content-box;
		border-radius: 10px;
	}
}

.bg {
	position: absolute;

	top: 8px;
	bottom: 8px;
	left: 8px;
	right: 8px;

	& .circle {
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: #F33928;
		opacity: 0;

		animation: blink 3s ease infinite;
		animation-delay: var(--delay);
	}
}

@keyframes blink {
	0% {
		opacity: var(--start);
	}

	50% {
		opacity: var(--end);
	}

	100% {
		opacity: var(--start);
	}
}

.select_item {
	border-radius: 8px;
	background: rgba(0, 0, 0, 15%);
	cursor: pointer;

	padding: 12px;

	transition: all 0.2s ease;

	&.active {
		box-shadow: inset 0 0 0 1px #F33928;
		background: transparent;
		cursor: default;
	}

	&.active:hover {
		background: transparent;
	}

	&:hover {
		background: rgba(0, 0, 0, 25%);
	}
}

.divider {
	width: 100%;
	height: 2px;

	background: var(--op-5);

	margin: 0 -16px;
}

.warning_banner {
	height: 60px;

	background: repeating-linear-gradient(
		45deg,
		rgba(0, 0, 0, 25%),
		rgba(0, 0, 0, 25%) 8px,
		rgba(0, 0, 0, 10%) 8px,
		rgba(0, 0, 0, 10%) 16px
	);
	box-shadow: 0 0 0 1px var(--op-5);

	margin-left: -16px;
	margin-right: -16px;

	padding: 0 16px;
}
</style>
~/services/proto/gen/msg_send
