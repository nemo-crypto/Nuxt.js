<script setup>
/** UI */
import Modal from "@/components/ui/Modal.vue"
import Input from "@/components/ui/Input.vue"

/** API */
import { fetchConstants } from "@/services/api/main"

/** Store */
import { useNotificationsStore } from "@/store/notifications"
const notificationsStore = useNotificationsStore()

const emit = defineEmits(["onClose"])
const props = defineProps({
	show: Boolean,
})

const DescriptionMap = {
	max_memo_characters: "Largest allowed size for a memo in bytes",
	sig_verify_cost_ed25519: "Gas used to verify Ed25519 signature",
	sig_verify_cost_secp256k1: "Gas used to verify secp256k1 signature",
	tx_sig_limit: "Max number of signatures allowed in a multisig transaction",
	tx_size_cost_per_byte: "Gas used per transaction byte",
	gas_per_blob_byte: "Gas used per blob byte",
	gov_max_square_size:
		"Governance parameter for the maximum square size determined per shares per row or column for the original data square (not yet extended)s. If larger than MaxSquareSize, MaxSquareSize is used",
	constant_fee:
		"Fixed gas cost for invariant verification. Due to the anticipated large gas cost requirement to verify an invariant (and potential to exceed the maximum allowable block gas limit) a constant fee is used instead of the standard gas consumption method",
	base_proposer_reward: "Reward in the mint denomination for proposing a block",
	bonus_proposer_reward: "Extra reward in the mint denomination for proposers based on the voting power included in the commit",
	community_tax: "Percentage of the inflation sent to the community pool",
	withdraw_addr_enabled: "Enables delegators to withdraw funds to a different address",
	max_deposit_period: "Maximum period for token holders to deposit on a proposal in nanoseconds",
	min_deposit: "Minimum deposit for a proposal to enter voting period",
	quorum: "Minimum percentage of total stake needed to vote for a result to be considered valid",
	threshold: "Minimum proportion of Yes votes for proposal to pass",
	veto_threshold: "Minimum value of Veto votes to Total votes ratio for proposal to be vetoed",
	voting_period: "Duration of the voting period in nanoseconds",
	downtime_jail_duration: "Duration of time a validator must stay jailed",
	min_signed_per_window: "The percentage of SignedBlocksWindow that must be signed not to get jailed",
	signed_blocks_window: "The range of blocks used to count for downtime",
	slash_fraction_double_sign: "Percentage slashed after a validator is jailed for double signing",
	slash_fraction_downtime: "Percentage slashed after a validator is jailed for downtime",
	bond_denom: "Bondable coin denomination",
	historical_entries: "Number of historical entries to persist in store",
	max_entries: "Maximum number of entries in the redelegation queue",
	max_validators: "Maximum number of validators",
	min_commission_rate: "Minimum commission rate used by all validators",
	unbonding_time: "Duration of time for unbonding in seconds",
	block_max_bytes: "Governance parameter for the maximum size of the protobuf encoded block",
	block_max_gas: "Maximum gas allowed per block (-1 is infinite)",
	evidence_max_age_duration:
		"The maximum age of evidence before it is considered invalid. This value should be identical to the unbonding period",
	evidence_max_age_num_blocks: "The maximum number of blocks before evidence is considered invalid",
	evidence_max_bytes: "Maximum size in bytes used by evidence in a given block",
	validator_pub_key_types: "The type of public key used by validators",
}

const searchTerm = ref("")

const rawModules = ref({})

onMounted(async () => {
	const data = await fetchConstants()
	rawModules.value = data.module
})

const modules = computed(() => {
	const result = []

	Object.keys(rawModules.value).forEach((mod) => {
		result.push({
			name: mod,
			constants: Object.keys(rawModules.value[mod]).map((c) => {
				return {
					name: c,
					value: rawModules.value[mod][c],
				}
			}),
		})
	})

	return result
})

const filteredModules = computed(() => {
	if (!searchTerm.value.length) return modules.value
	return modules.value.filter((mod) => mod.constants.some((c) => c.name.includes(searchTerm.value.toLowerCase().trim())))
})

watch(
	() => props.show,
	() => {
		if (!props.show) {
			searchTerm.value = ""
		}
	},
)

const handleCopy = (target) => {
	window.navigator.clipboard.writeText(target)

	notificationsStore.create({
		notification: {
			type: "info",
			icon: "check",
			title: "Successfully copied to clipboard",
			autoDestroy: true,
		},
	})
}
</script>

<template>
	<Modal :show="show" @onClose="emit('onClose')" width="600" focus>
		<Flex direction="column" gap="24">
			<Text size="14" weight="600" color="primary">Nubit Constants</Text>

			<Input v-model="searchTerm" placeholder="Search through nubit constants" />

			<Flex direction="column" gap="12" :class="$style.constants">
				<Flex v-for="mod in filteredModules" :key="mod.name" direction="column" gap="12" :class="$style.module">
					<Text size="12" weight="600" color="secondary" style="text-transform: capitalize" :class="$style.top">
						{{ mod.name }}
					</Text>

					<Flex direction="column" gap="12" :class="$style.items">
						<Flex v-for="constant in mod.constants" :key="constant.name" align="center" gap="40" justify="between" wide :class="$style.item">
							<Flex direction="column" gap="4">
								<Text
									@click="handleCopy(constant.name)"
									size="13"
									weight="600"
									color="primary"
									class="copyable"
									:class="[
										$style.name,
										searchTerm.length && constant.name.includes(searchTerm.trim().toLowerCase()) && $style.finded,
									]"
								>
									{{ constant.name }}
								</Text>
								<Text size="12" height="140" weight="500" color="tertiary"> {{ DescriptionMap[constant.name] }} </Text>
							</Flex>

							<Text @click="handleCopy(constant.value)" size="13" weight="600" color="secondary" class="copyable">
								{{ constant.value }}
							</Text>
						</Flex>
					</Flex>
				</Flex>
			</Flex>
		</Flex>
	</Modal>
</template>

<style module>
.constants {
	max-height: 600px;
	overflow: auto;
}

.module {
	background: linear-gradient(var(--op-5), var(--op-3));
	border-radius: 6px;

	border: 1px solid var(--op-5);
}

.top {
	border-bottom: 1px solid var(--op-8);

	padding: 10px 12px;
}

.items {
	padding: 0 12px 12px 12px;
}

.item {
	&.hide {
		display: none;
	}
}

.name.finded {
	color: var(--green);
}

@media (max-width: 500px) {
	.items {
		gap: 20px;
	}

	.item {
		flex-direction: column;
		align-items: start;
		gap: 8px;
	}
}
</style>
