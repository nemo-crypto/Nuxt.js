<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Tooltip from "~/components/ui/Tooltip.vue"
import Button from "~/components/ui/Button.vue"

/** Services */
import { tia, splitAddress } from "@/services/utils"

/** API */
import { fetchTxEvents } from "@/services/api/tx"
import { fetchBlockEvents } from "@/services/api/block"

/** Store */
import { useModalsStore } from "@/store/modals"
import { useCacheStore } from "@/store/cache"
const modalsStore = useModalsStore()
const cacheStore = useCacheStore()

const router = useRouter()

const props = defineProps({
	block: {
		type: Object,
	},
	tx: {
		type: Object,
	},
})

const isLoading = ref(false)
const events = ref([])

const EventIconMapping = {
	message: "message",
	coin_received: "coins_down",
	coin_spent: "coins_up",
	transfer: "arrow-circle-right-up",
	withdraw_rewards: "coins",
	withdraw_commission: "tag",
	tx: "zap",
	proposer_reward: "coins_down",
	commission: "coins_down",
	rewards: "coins_down",
	mint: "coins_down",
	burn: "burn",
	coinbase: "coins_down",
	unbond: "unlock",
	redelegate: "redelegate",
	complete_unbonding: "unlock",
	complete_redelegation: "redelegate",
	slash: "grid",
	cancel_unbonding_delegation: "unlock",
	liveness: "close-circle",
}

const getEvents = async () => {
	isLoading.value = true

	if (props.block) {
		events.value = await fetchBlockEvents({ 
			height: props.block.height,
			limit: 10,
			offset: (page.value - 1) * 10,
		}) 
	} else if (props.tx) {
		events.value = await fetchTxEvents({
			hash: props.tx.hash,
			limit: 10,
			offset: (page.value - 1) * 10,
		})
	}

	isLoading.value = false
}

const handlingEventType = (type) => {
	switch (type) {
		case 'cosmos.authz.v1beta1.EventGrant':
			return 'grant'

		case 'cosmos.authz.v1beta1.EventRevoke':
			return 'revoke'
	
		default:
			return type
	}
}

const handlingEventActionType = (type) => {
	return type.split('.').slice(-1)[0].replace('\"','')
}

const handleViewRawEvent = (event) => {
	cacheStore.current._target = "event"
	cacheStore.current.event = event
	modalsStore.open("rawData")
}

const page = ref(1)
const pages = computed(() => (
	props.block
		? Math.ceil(props.block.stats.events_count / 10)
		: Math.ceil(props.tx.events_count / 10))
)
const handleNext = () => {
	if (page.value === pages.value) return
	page.value += 1
}
const handlePrev = () => {
	if (page.value === 1) return
	page.value -= 1
}

onMounted(() => {
	getEvents();
})

/** Refetch events */
watch(
	() => page.value,
	() => {
		getEvents()
	},
)
</script>

<template>
	<Flex direction="column" justify="between" :class="$style.data">
		<Flex direction="column" :class="[$style.inner, $style.events]">
			<Flex v-for="(event, idx) in events" :key="idx" @click="handleViewRawEvent(event)" align="center" gap="12" :class="$style.event">
				<Flex
					direction="column"
					align="center"
					gap="6"
					:class="[$style.left, idx === 0 && $style.first, idx === events.length - 1 && $style.last]"
				>
					<div />
					<Icon :name="EventIconMapping[event.type] ? EventIconMapping[event.type] : 'zap'" size="12" color="yellowNew" />
					<div />
				</Flex>

				<Flex wide justify="between" align="center" gap="6" :class="$style.right">
					<!-- Event: coin_spent -->
					<Flex v-if="event.type === 'coin_spent'" align="center" gap="4" color="secondary" :class="$style.text">
						<Tooltip :class="$style.tooltip">
							<NuxtLink :to="`/address/${event.data.spender}`" @click.stop>
								<Text size="12" weight="500" color="primary" mono>
									{{ splitAddress(event.data.spender) }}
								</Text>
							</NuxtLink>

							<template #content>
								{{ event.data.spender }}
							</template>
						</Tooltip>

						<Text size="12" weight="500" color="secondary">spent</Text>

						<Text size="12" weight="500" color="primary" mono no-wrap>
							{{ tia(event.data.amount.replace("unub", "")) }} NUB</Text
						>
					</Flex>
					<!-- Event: coin_received -->
					<Flex v-else-if="event.type === 'coin_received'" align="center" gap="4" color="secondary" :class="$style.text">
						<Tooltip :class="$style.tooltip">
							<NuxtLink :to="`/address/${event.data.receiver}`" @click.stop>
								<Text size="12" weight="500" color="primary" mono>
									{{ splitAddress(event.data.receiver) }}
								</Text>
							</NuxtLink>

							<template #content>
								{{ event.data.receiver }}
							</template>
						</Tooltip>

						<Text size="12" weight="500" color="secondary">received</Text>

						<Text size="12" weight="500" color="primary" mono no-wrap>
							{{ tia(event.data.amount.replace("unub", "")) }} NUB
						</Text>
					</Flex>
					<!-- Event: delegate -->
					<Flex v-else-if="event.type === 'delegate'" align="center" gap="4" color="secondary" :class="$style.text">
						<Text size="12" weight="500" color="secondary">Validator</Text>

						<Tooltip :class="$style.tooltip">
							<NuxtLink :to="`/address/${event.data.validator}`" @click.stop>
								<Text size="12" weight="500" color="primary" mono>
									{{ splitAddress(event.data.validator) }}
								</Text>
							</NuxtLink>

							<template #content>
								{{ event.data.validator }}
							</template>
						</Tooltip>

						<Text size="12" weight="500" color="secondary">for</Text>

						<Text size="12" weight="500" color="primary" mono>
							{{ event.data.amount }}
						</Text>
					</Flex>
					<!-- Event: transfer -->
					<Flex v-else-if="event.type === 'transfer'" align="center" gap="4" color="secondary" :class="$style.text">
						<Tooltip :class="$style.tooltip">
							<NuxtLink :to="`/address/${event.data.sender}`" @click.stop>
								<Text size="12" weight="500" color="primary" mono>
									{{ splitAddress(event.data.sender) }}
								</Text>
							</NuxtLink>

							<template #content>
								{{ event.data.sender }}
							</template>
						</Tooltip>

						<Text size="12" weight="500" color="secondary">sent</Text>

						<Text size="12" weight="500" color="primary" mono no-wrap>
							{{ tia(event.data.amount.replace("unub", "")) }} NUB</Text
						>

						<Text size="12" weight="500" color="secondary">to</Text>

						<Tooltip :class="$style.tooltip">
							<NuxtLink :to="`/address/${event.data.recipient}`" @click.stop>
								<Text size="12" weight="500" color="primary" mono>
									{{ splitAddress(event.data.recipient) }}
								</Text>
							</NuxtLink>

							<template #content>
								{{ event.data.recipient }}
							</template>
						</Tooltip>
					</Flex>
					<!-- Event: tx -->
					<Flex v-else-if="event.type === 'tx'" align="center" gap="4" color="secondary" :class="$style.text">
						<!-- Signature -->
						<template v-if="event.data.signature">
							<Text size="12" weight="500" color="secondary">Signature</Text>

							<Tooltip :class="$style.tooltip">
								<Text size="12" weight="500" color="primary" mono>
									{{ event.data.signature.slice(event.data.signature.length - 4, event.data.signature.length) }}
								</Text>

								<template #content>
									{{ event.data.signature }}
								</template>
							</Tooltip>
						</template>
						<!-- acc_seq -->
						<template v-if="event.data.acc_seq">
							<Text size="12" weight="500" color="secondary">Acc</Text>

							<Tooltip :class="$style.tooltip">
								<NuxtLink :to="`/address/${event.data.acc_seq.split('/')[0]}`" @click.stop>
									<Text size="12" weight="500" color="primary" mono>
										{{ splitAddress(event.data.acc_seq.split("/")[0]) }}
									</Text>
								</NuxtLink>

								<template #content>
									{{ event.data.acc_seq.split("/")[0] }}
								</template>
							</Tooltip>

							<template v-if="event.data.acc_seq.split('/')[1]">
								<Text size="12" weight="500" color="secondary">Seq</Text>

								<Text size="12" weight="500" color="primary" mono>
									{{ event.data.acc_seq.split("/")[1] }}
								</Text>
							</template>
						</template>
						<!-- fee -->
						<template v-if="event.data.fee">
							<Tooltip :class="$style.tooltip">
								<NuxtLink :to="`/address/${event.data.fee_payer}`" @click.stop>
									<Text size="12" weight="500" color="primary" mono>
										{{ splitAddress(event.data.fee_payer) }}
									</Text>
								</NuxtLink>

								<template #content>
									{{ event.data.fee_payer }}
								</template>
							</Tooltip>

							<Text size="12" weight="500" color="secondary">paid</Text>

							<Text size="12" weight="500" color="primary" mono no-wrap>
								{{ tia(event.data.fee.replace("unub", "")) }} NUB</Text
							>

							<Text size="12" weight="500" color="secondary">fee</Text>
						</template>
					</Flex>
					<!-- Event: message -->
					<Flex v-else-if="event.type === 'message'" align="center" gap="4" color="secondary" :class="$style.text">
						<!-- action -->
						<template v-if="event.data.action">
							<Text size="12" weight="500" color="secondary" no-wrap>Call action</Text>

							<Text size="12" weight="500" color="primary" mono>
								{{ handlingEventActionType(event.data.action) }}
							</Text>
						</template>
						<!-- sender -->
						<template v-else-if="event.data.sender">
							<Text size="12" weight="500" color="secondary">Sender</Text>

							<Tooltip :class="$style.tooltip">
								<NuxtLink :to="`/address/${event.data.sender}`" @click.stop>
									<Text size="12" weight="500" color="primary" mono>
										{{ splitAddress(event.data.sender) }}
									</Text>
								</NuxtLink>

								<template #content>
									{{ event.data.sender }}
								</template>
							</Tooltip>
						</template>
						<!-- sender -->
						<template v-else-if="event.data.module">
							<Text size="12" weight="500" color="secondary">Module</Text>

							<Text size="12" weight="500" color="primary" mono>
								{{ event.data.module }}
							</Text>
						</template>
					</Flex>
					<!-- Event: withdraw_rewards -->
					<Flex
						v-else-if="event.type === 'withdraw_rewards'"
						align="center"
						gap="4"
						color="secondary"
						:class="$style.text"
					>
						<Text size="12" weight="500" color="secondary">Withdrawal</Text>

						<Text size="12" weight="500" color="primary" mono no-wrap>
							{{ tia(event.data.amount.replace("unub", "")) }} NUB</Text>

						<Text size="12" weight="500" color="secondary">from</Text>

						<Tooltip :class="$style.tooltip">
							<NuxtLink :to="`/address/${event.data.validator}`" @click.stop>
								<Text size="12" weight="500" color="primary" mono>
									{{ splitAddress(event.data.validator) }}
								</Text>
							</NuxtLink>

							<template #content>
								{{ event.data.validator }}
							</template>
						</Tooltip>
					</Flex>
					<!-- Event: withdraw_commission -->
					<Flex
						v-else-if="event.type === 'withdraw_commission'"
						align="center"
						gap="4"
						color="secondary"
						:class="$style.text"
					>
						<Text size="12" weight="500" color="secondary">Commission</Text>

						<Text size="12" weight="500" color="primary" mono no-wrap>
							{{ tia(event.data.amount.replace("unub", "")) }} NUB
						</Text>
					</Flex>
					<!-- Event: proposer_reward -->
					<Flex v-else-if="event.type === 'proposer_reward'" align="center" gap="4" color="secondary" :class="$style.text">
						<Text size="12" weight="500" color="secondary">Proposer</Text>

						<Tooltip :class="$style.tooltip">
							<NuxtLink :to="`/address/${event.data.validator}`" @click.stop>
								<Text size="12" weight="500" color="primary" mono>
									{{ splitAddress(event.data.validator) }}
								</Text>
							</NuxtLink>

							<template #content>
								{{ event.data.validator }}
							</template>
						</Tooltip>

						<Text size="12" weight="500" color="secondary">received rewards</Text>

						<Text size="12" weight="500" color="primary" mono no-wrap>
							{{ event.data.amount ? tia(event.data.amount.replace("unub", "")) : 0 }} NUB
						</Text>
					</Flex>
					<!-- Event: rewards -->
					<Flex v-else-if="event.type === 'rewards'" align="center" gap="4" color="secondary" :class="$style.text">
						<Text size="12" weight="500" color="secondary">Validator</Text>

						<Tooltip :class="$style.tooltip">
							<NuxtLink :to="`/address/${event.data.validator}`" @click.stop>
								<Text size="12" weight="500" color="primary" mono>
									{{ splitAddress(event.data.validator) }}
								</Text>
							</NuxtLink>

							<template #content>
								{{ event.data.validator }}
							</template>
						</Tooltip>

						<Text size="12" weight="500" color="secondary">received rewards</Text>

						<Text size="12" weight="500" color="primary" mono no-wrap>
							{{ event.data.amount ? tia(event.data.amount.replace("unub", "")) : 0 }} NUB
						</Text>
					</Flex>
					<!-- Event: commission -->
					<Flex v-else-if="event.type === 'commission'" align="center" gap="4" color="secondary" :class="$style.text">
						<Tooltip :class="$style.tooltip">
							<NuxtLink :to="`/address/${event.data.validator}`" @click.stop>
								<Text size="12" weight="500" color="primary" mono>
									{{ splitAddress(event.data.validator) }}
								</Text>
							</NuxtLink>

							<template #content>
								{{ event.data.validator }}
							</template>
						</Tooltip>

						<Text size="12" weight="500" color="secondary">received commission of</Text>

						<Text size="12" weight="500" color="primary" mono no-wrap>
							{{ event.data.amount ? tia(event.data.amount.replace("unub", "")) : 0 }} NUB
						</Text>
					</Flex>
					<!-- Event: coinbase -->
					<Flex v-else-if="event.type === 'coinbase'" align="center" gap="4" color="secondary" :class="$style.text">
						<Tooltip :class="$style.tooltip">
							<NuxtLink :to="`/address/${event.data.minter}`" @click.stop>
								<Text size="12" weight="500" color="primary" mono>
									{{ splitAddress(event.data.minter) }}
								</Text>
							</NuxtLink>

							<template #content>
								{{ event.data.minter }}
							</template>
						</Tooltip>

						<Text size="12" weight="500" color="secondary">received</Text>

						<Text size="12" weight="500" color="primary" mono no-wrap>
							{{ event.data.amount ? tia(event.data.amount.replace("unub", "")) : 0 }} NUB
						</Text>
					</Flex>
					<!-- Event: mint -->
					<Flex v-else-if="event.type === 'mint'" align="center" gap="4" color="secondary" :class="$style.text">
						<Text size="12" weight="500" color="primary" mono no-wrap>
							{{ event.data.amount ? tia(event.data.amount.replace("unub", "")) : 0 }} NUB</Text
						>

						<Text size="12" weight="500" color="secondary">was minted</Text>
					</Flex>
					<!-- Event: burn -->
					<Flex v-else-if="event.type === 'burn'" align="center" gap="4" color="secondary" :class="$style.text">
						<Text size="12" weight="500" color="primary" mono no-wrap>
							{{ event.data.amount ? tia(event.data.amount.replace("unub", "")) : 0 }} NUB</Text
						>

						<Text size="12" weight="500" color="secondary">was burned</Text>
					</Flex>
					<!-- Event: unbond -->
					<Flex v-else-if="event.type === 'unbond'" align="center" gap="4" color="secondary" :class="$style.text">
						<Text size="12" weight="500" color="primary" mono no-wrap>
							{{ event.data.amount ? tia(event.data.amount.replace("unub", "")) : 0 }} NUB</Text
						>

						<Text size="12" weight="500" color="secondary">will unbond from</Text>

						<Tooltip :class="$style.tooltip">
							<NuxtLink :to="`/address/${event.data.validator}`" @click.stop>
								<Text size="12" weight="500" color="primary" mono>
									{{ splitAddress(event.data.validator) }}
								</Text>
							</NuxtLink>

							<template #content>
								{{ event.data.validator }}
							</template>
						</Tooltip>

						<Text size="12" weight="500" color="secondary">at</Text>

						<Tooltip :class="$style.tooltip">
							<Text size="12" weight="500" color="primary" mono>
								{{ DateTime.fromISO(event.data.completion_time).setLocale("en").toFormat("MMMM d h:mm a") }}
							</Text>

							<template #content>
								{{ DateTime.fromISO(event.data.completion_time).setLocale("en").toFormat("ff") }}
							</template>
						</Tooltip>
					</Flex>
					<!-- Event: redelegate -->
					<Flex v-else-if="event.type === 'redelegate'" align="center" gap="4" color="secondary" :class="$style.text">
						<Text size="12" weight="500" color="primary" mono no-wrap>
							{{ event.data.amount ? tia(event.data.amount.replace("unub", "")) : 0 }} NUB</Text
						>

						<Text size="12" weight="500" color="secondary">will redelegate from</Text>

						<Tooltip :class="$style.tooltip">
							<NuxtLink :to="`/address/${event.data.source_validator}`" @click.stop>
								<Text size="12" weight="500" color="primary" mono>
									{{ splitAddress(event.data.source_validator) }}
								</Text>
							</NuxtLink>

							<template #content>
								{{ event.data.source_validator }}
							</template>
						</Tooltip>

						<Text size="12" weight="500" color="secondary">to</Text>

						<Tooltip :class="$style.tooltip">
							<NuxtLink :to="`/address/${event.data.destination_validator}`" @click.stop>
								<Text size="12" weight="500" color="primary" mono>
									{{ splitAddress(event.data.destination_validator) }}
								</Text>
							</NuxtLink>

							<template #content>
								{{ event.data.destination_validator }}
							</template>
						</Tooltip>

						<Text size="12" weight="500" color="secondary">at</Text>

						<Tooltip :class="$style.tooltip">
							<Text size="12" weight="500" color="primary" mono>
								{{ DateTime.fromISO(event.data.completion_time).setLocale("en").toFormat("MMMM d h:mm a") }}
							</Text>

							<template #content>
								{{ DateTime.fromISO(event.data.completion_time).setLocale("en").toFormat("ff") }}
							</template>
						</Tooltip>
					</Flex>
					<!-- Event: complete_unbonding -->
					<Flex v-else-if="event.type === 'complete_unbonding'" align="center" gap="4" color="secondary" :class="$style.text">
						<Text size="12" weight="500" color="primary" mono no-wrap>
							{{ event.data.amount ? tia(event.data.amount.replace("unub", "")) : 0 }} NUB</Text
						>

						<Text size="12" weight="500" color="secondary">was unbonded from</Text>

						<Tooltip :class="$style.tooltip">
							<NuxtLink :to="`/address/${event.data.validator}`" @click.stop>
								<Text size="12" weight="500" color="primary" mono>
									{{ splitAddress(event.data.validator) }}
								</Text>
							</NuxtLink>

							<template #content>
								{{ event.data.validator }}
							</template>
						</Tooltip>

						<Text size="12" weight="500" color="secondary">to</Text>

						<Tooltip :class="$style.tooltip">
							<NuxtLink :to="`/address/${event.data.delegator}`" @click.stop>
								<Text size="12" weight="500" color="primary" mono>
									{{ splitAddress(event.data.delegator) }}
								</Text>
							</NuxtLink>

							<template #content>
								{{ event.data.delegator }}
							</template>
						</Tooltip>
					</Flex>
					<!-- Event: complete_redelegation -->
					<Flex v-else-if="event.type === 'complete_redelegation'" align="center" gap="4" color="secondary" :class="$style.text">
						<Text size="12" weight="500" color="primary" mono no-wrap>
							{{ event.data.amount ? tia(event.data.amount.replace("unub", "")) : 0 }} NUB</Text
						>

						<Text size="12" weight="500" color="secondary">was redelegated from</Text>

						<Tooltip :class="$style.tooltip">
							<NuxtLink :to="`/address/${event.data.source_validator}`" @click.stop>
								<Text size="12" weight="500" color="primary" mono>
									{{ splitAddress(event.data.source_validator) }}
								</Text>
							</NuxtLink>

							<template #content>
								{{ event.data.source_validator }}
							</template>
						</Tooltip>

						<Text size="12" weight="500" color="secondary">to</Text>

						<Tooltip :class="$style.tooltip">
							<NuxtLink :to="`/address/${event.data.destination_validator}`" @click.stop>
								<Text size="12" weight="500" color="primary" mono>
									{{ splitAddress(event.data.destination_validator) }}
								</Text>
							</NuxtLink>

							<template #content>
								{{ event.data.destination_validator }}
							</template>
						</Tooltip>
					</Flex>
					<!-- Event: slash -->
					<Flex v-else-if="event.type === 'slash'" align="center" gap="4" color="secondary" :class="$style.text">
						<Tooltip :class="$style.tooltip">
							<NuxtLink :to="`/address/${event.data.jailed}`" @click.stop>
								<Text size="12" weight="500" color="primary" mono>
									{{ splitAddress(event.data.jailed) }}
								</Text>
							</NuxtLink>

							<template #content>
								{{ event.data.jailed }}
							</template>
						</Tooltip>

						<Text size="12" weight="500" color="secondary">was jailed for</Text>

						<Tooltip :class="$style.tooltip">
								<Text size="12" weight="500" color="primary" mono>
									{{ event.data.reason }}
								</Text>

							<template #content>
								{{ event.data.reason }}
							</template>
						</Tooltip>
					</Flex>
					<!-- Event: cancel_unbonding_delegation -->
					<Flex v-else-if="event.type === 'cancel_unbonding_delegation'" align="center" gap="4" color="secondary" :class="$style.text">
						<Text size="12" weight="500" color="secondary">Unbonding</Text>

						<Text size="12" weight="500" color="primary" mono no-wrap>
							{{ event.data.amount ? tia(event.data.amount.replace("unub", "")) : 0 }} NUB</Text
						>

						<Text size="12" weight="500" color="secondary">from</Text>

						<Tooltip :class="$style.tooltip">
							<NuxtLink :to="`/address/${event.data.validator}`" @click.stop>
								<Text size="12" weight="500" color="primary" mono>
									{{ splitAddress(event.data.validator) }}
								</Text>
							</NuxtLink>

							<template #content>
								{{ event.data.validator }}
							</template>
						</Tooltip>

						<Text size="12" weight="500" color="secondary">was canceled</Text>
					</Flex>
					<!-- Event: cosmos.authz.v1beta1.EventGrant -->
					<Flex v-else-if="event.type === 'cosmos.authz.v1beta1.EventGrant'" align="center" gap="4" color="secondary" :class="$style.text">
						<Tooltip :class="$style.tooltip">
							<NuxtLink :to="`/address/${event.data.granter}`" @click.stop>
								<Text size="12" weight="500" color="primary" mono>
									{{ splitAddress(event.data.granter.replace(/"/g,'')) }}
								</Text>
							</NuxtLink>

							<template #content>
								{{ event.data.granter.replace(/"/g,'') }}
							</template>
						</Tooltip>

						<Text size="12" weight="500" color="secondary">gives authority on</Text>

						<Text size="12" weight="500" color="primary" mono>
							{{ handlingEventActionType(event.data.msg_type_url) }}
						</Text>

						<Text size="12" weight="500" color="secondary">for</Text>

						<Tooltip :class="$style.tooltip">
							<NuxtLink :to="`/address/${event.data.grantee}`" @click.stop>
								<Text size="12" weight="500" color="primary" mono>
									{{ splitAddress(event.data.grantee.replace(/"/g,'')) }}
								</Text>
							</NuxtLink>

							<template #content>
								{{ event.data.grantee.replace(/"/g,'') }}
							</template>
						</Tooltip>
					</Flex>
					<!-- Event: cosmos.authz.v1beta1.EventRevoke -->
					<Flex v-else-if="event.type === 'cosmos.authz.v1beta1.EventRevoke'" align="center" gap="4" color="secondary" :class="$style.text">
						<Tooltip :class="$style.tooltip">
							<NuxtLink :to="`/address/${event.data.granter}`" @click.stop>
								<Text size="12" weight="500" color="primary" mono>
									{{ splitAddress(event.data.granter.replace(/"/g,'')) }}
								</Text>
							</NuxtLink>

							<template #content>
								{{ event.data.granter.replace(/"/g,'') }}
							</template>
						</Tooltip>

						<Text size="12" weight="500" color="secondary">revoked grant on</Text>

						<Text size="12" weight="500" color="primary" mono>
							{{ handlingEventActionType(event.data.msg_type_url) }}
						</Text>

						<Text size="12" weight="500" color="secondary">from</Text>

						<Tooltip :class="$style.tooltip">
							<NuxtLink :to="`/address/${event.data.grantee}`" @click.stop>
								<Text size="12" weight="500" color="primary" mono>
									{{ splitAddress(event.data.grantee.replace(/"/g,'')) }}
								</Text>
							</NuxtLink>

							<template #content>
								{{ event.data.grantee.replace(/"/g,'') }}
							</template>
						</Tooltip>
					</Flex>
					<!-- Event: set_feegrant -->
					<Flex v-else-if="event.type === 'set_feegrant'" align="center" gap="4" color="secondary" :class="$style.text">
						<Tooltip :class="$style.tooltip">
							<NuxtLink :to="`/address/${event.data.granter}`" @click.stop>
								<Text size="12" weight="500" color="primary" mono>
									{{ splitAddress(event.data.granter) }}
								</Text>
							</NuxtLink>

							<template #content>
								{{ event.data.granter }}
							</template>
						</Tooltip>

						<Text size="12" weight="500" color="secondary">grants fee allowances to</Text>

						<Tooltip :class="$style.tooltip">
							<NuxtLink :to="`/address/${event.data.grantee}`" @click.stop>
								<Text size="12" weight="500" color="primary" mono>
									{{ splitAddress(event.data.grantee) }}
								</Text>
							</NuxtLink>

							<template #content>
								{{ event.data.grantee }}
							</template>
						</Tooltip>
					</Flex>
					<!-- Event: liveness -->
					<Flex v-else-if="event.type === 'liveness'" align="center" gap="4" color="secondary" :class="$style.text">
						<Tooltip :class="$style.tooltip">
							<NuxtLink :to="`/address/${event.data.address}`" @click.stop>
								<Text size="12" weight="500" color="primary" mono>
									{{ splitAddress(event.data.address) }}
								</Text>
							</NuxtLink>

							<template #content>
								{{ event.data.address }}
							</template>
						</Tooltip>

						<Text size="12" weight="500" color="secondary">missed</Text>

						<Text size="12" weight="500" color="primary" mono no-wrap>
							{{ event.data.missed_blocks }}</Text
						>

						<Text size="12" weight="500" color="secondary">blocks</Text>
					</Flex>

					<Text size="12" weight="600" color="tertiary" mono>
						{{ handlingEventType(event.type) }}
					</Text>
				</Flex>
			</Flex>
		</Flex>
		<!-- Pagination -->
		<Flex v-if="events.length && pages > 1" align="center" gap="6" :class="$style.pagination">
			<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
				<Icon name="arrow-left-stop" size="12" color="primary" />
			</Button>
			<Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
				<Icon name="arrow-left" size="12" color="primary" />
			</Button>

			<Button type="secondary" size="mini" disabled>
				<Text class="openSans_font" size="12" weight="600" color="primary"> {{ page }} of {{ pages }} </Text>
			</Button>

			<Button @click="handleNext" type="secondary" size="mini" :disabled="page === pages">
				<Icon name="arrow-right" size="12" color="primary" />
			</Button>
			<Button @click="page = pages" type="secondary" size="mini" :disabled="page === pages">
				<Icon name="arrow-right-stop" size="12" color="primary" />
			</Button>
		</Flex>
	</Flex>
</template>

<style module>
.data {
	min-width: 100%;
	height: 100%;
	overflow-x: auto;
}

.pagination {
	padding: 0 16px 16px 16px;
}

.inner {
	height: 100%;

	border-radius: 4px 4px 8px 4px;
	
}

.events {
	padding: 0 16px 16px 16px;
}

.event {
	height: 36px;

	cursor: pointer;

	& .left {
		height: 100%;

		& div {
			width: 2px;
			height: 100%;
			background: var(--op-5);
		}
	}

	& .left.first {
		& div {
			&:first-child {
				background: transparent;
			}
		}
	}

	& .left.last {
		& div {
			&:last-child {
				background: transparent;
			}
		}
	}

	& .right {
		min-width: 0;
		height: 100%;

		border-bottom: 1px solid var(--op-5);

		& .text {
			display: inline-block;
			color: var(--txt-tertiary);

			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;

			& > * {
				margin-right: 4px;
			}

			& .tooltip {
				display: inline-block;
			}
		}
	}
}

.memo {
	text-overflow: ellipsis;
	overflow: hidden;
}

@media (max-width: 800px) {
	.content {
		grid-template-columns: 1fr;
	}

	.data {
		max-width: initial;
		min-width: 0;

		border-radius: 4px;
	}
}

@media (max-width: 500px) {
	.data {
		.main {
			min-width: initial;
		}
	}
}

@media (max-width: 400px) {
	.tabs_wrapper {
		overflow-x: auto;

		&::-webkit-scrollbar {
			display: none;
		}
	}
}
</style>
