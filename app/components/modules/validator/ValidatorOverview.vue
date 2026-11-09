<script setup>
/** UI */
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"
import AmountInCurrency from "@/components/AmountInCurrency.vue"

/** Tables */
import BlocksTable from "./tables/BlocksTable.vue"
import DelegatorsTable from "./tables/DelegatorsTable.vue"
import JailsTable from "./tables/JailsTable.vue"

/** Services */
import { comma, numToPercent, shortHex, splitAddress } from "@/services/utils"

/** API */
import { fetchValidatorBlocks, fetchValidatorDelegators, fetchValidatorJails, fetchValidatorUptime } from "@/services/api/validator";

/** Store */
import { useCacheStore } from "@/store/cache"
const cacheStore = useCacheStore()

const props = defineProps({
	validator: {
		type: Object,
		required: true,
	},
})

const tabs = ref([
	{
		name: "Delegators",
		icon: "address",
	},
	{
		name: "Proposed Blocks",
		icon: "block",
	},
	// {
	// 	name: "Jails",
	// 	icon: "grid",
	// },
])
const activeTab = ref(tabs.value[0].name)

const isRefetching = ref(false)
const delegators = ref([])
const blocks = ref([])
const jails = ref([])
const uptime = ref([])

const page = ref(1)
const handleNextCondition = ref(true)

const handleNext = () => {
	page.value += 1
}
const handlePrev = () => {
	page.value -= 1
}

const getBlocks = async () => {
	isRefetching.value = true

	const { data } = await fetchValidatorBlocks({
		id: props.validator.id,
		limit: 10,
		offset: (page.value - 1) * 10,
	})

	if (data.value?.length) {
		blocks.value = data.value
		cacheStore.current.blocks = blocks.value
		handleNextCondition.value = blocks.value.length < 10
	}

	isRefetching.value = false
}

const getDelegators = async () => {
	isRefetching.value = true

	const { data } = await fetchValidatorDelegators({
		id: props.validator.id,
		limit: 10,
		offset: (page.value - 1) * 10,
	})

	delegators.value = data.value
	handleNextCondition.value = delegators.value.length < 10

	isRefetching.value = false
}

const getJails = async () => {
	isRefetching.value = true

	const { data } = await fetchValidatorJails({
		id: props.validator.id,
		limit: 10,
		offset: (page.value - 1) * 10,
	})

	jails.value = data.value
	handleNextCondition.value = jails.value.length < 10

	isRefetching.value = false
}

const getUptime = async () => {
	const { data } = await fetchValidatorUptime({
		id: props.validator.id,
		limit: 100,
	})

	if (data.value?.blocks?.length) {
		uptime.value = data.value.blocks.sort((a, b) => a.height - b.height)
	}
}

/** Initital fetch for delegators and uptime */
await getDelegators()
await getUptime()

const validatorStatus = computed(() => {
	let res = {
		name: "",
		color: "",
		description: "",
	}

	if (!props.validator.jailed) {
		if (uptime.value?.slice(-1)[0].signed) {
			res.name = "Active"
			res.color = "var(--validator-active)"
			res.description = "This validator is in the active set and can|propose or sign blocks and receive rewards".split("|")
		} else {
			res.name = "Inactive"
			res.color = "var(--validator-inactive)"
			res.description = "This validator is not in the active set and cannot|propose or sign blocks and earn rewards".split("|")
		}

	} else {
		res.name = "Jailed"
		res.color = "var(--validator-jailed)"
		res.description = "This validator is jailed|and cannot propose or sign blocks".split("|")
	}

	return res
})

const parsedContacts = computed(() => {
	let res = []
	const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
	const emails = props.validator.contacts.match(emailRegex);

	if (emails) {
		emails.forEach(email => {
			res.push({
				type: 'email',
				value: 'mailto:' + email,
			});
		});
	}

	const telegramRegex = /https?:\/\/t\.me\/([A-Za-z0-9_]+)/g;
	const telegrams = props.validator.contacts.match(telegramRegex);

	if (telegrams) {
		telegrams.forEach(telegram => {
			res.push({
				type: 'telegram',
				value: telegram,
			});
		});
	}

	return res
})

/** Refetch Blobs/Messages on new page */
watch(
	() => page.value,
	() => {
		switch (activeTab.value) {
			case "Delegators":
				getDelegators()
				break
			case "Proposed Blocks":
				getBlocks()
				break
			case "Jails":
				getJails()
				break
		}
	},
)

watch(
	() => activeTab.value,
	() => {
		page.value = 1

		switch (activeTab.value) {
			case "Delegators":
				getDelegators()
				break
			case "Proposed Blocks":
				getBlocks()
				break
			case "Jails":
				getJails()
				break
		}
	},
)
</script>

<template>
	<Flex direction="column" gap="0">
		<Flex align="center" justify="between" :class="$style.header">
			<Flex align="center" gap="8">
				<!-- <Icon name="validator" size="14" color="primary" /> -->
				<Text as="h1" size="20" weight="600" color="primary">Validator</Text>
			</Flex>
		</Flex>

		<Flex gap="0" :class="$style.content">
			<Flex direction="column" :class="$style.data">
				<Flex direction="column" gap="24" :class="$style.main">
					<Flex direction="column" gap="8" :class="$style.key_value">
						<Flex align="center" justify="between">
							<Text v-if="validator.moniker" size="13" weight="600" color="primary">{{ validator.moniker
								}} </Text>
							<Text v-else size="13" weight="600" color="primary">Validator</Text>

							<Tooltip position="start" textAlign="left" delay="200">
								<Text size="13" weight="600" :style="{ color: validatorStatus.color }"> {{validatorStatus.name }} </Text>

								<template #content>
									<Flex direction="column" gap="4">
										<Text v-for="s in validatorStatus.description" :key="s" color="secondary">{{ s
											}}</Text>
									</Flex>
								</template>
							</Tooltip>


						</Flex>
						<Flex align="center" gap="6">
							<Text class="rubik_font" size="14" weight="600" color="tertiary"> {{ splitAddress(validator.address) }} </Text>

							<CopyButton :text="validator.address" />
						</Flex>
					</Flex>

					<Flex v-if="validator.details" direction="column" gap="6">
						<Text size="12" weight="600" color="secondary">Description</Text>

						<Flex align="center" gap="6">
							<Text size="12" height="140" weight="600" color="tertiary" mono selectable
								:class="$style.memo">
								{{ validator.details }}
							</Text>
						</Flex>
					</Flex>
					<Flex v-if="validator.website || parsedContacts.length" align="center" justify="start" gap="12">
						<Tooltip v-if="validator.website" position="start" delay="500">
							<a :href="validator.website" target="_blank">
								<Icon name="globe" size="14" color="yellowNew" :class="$style.btn" />
							</a>

							<template #content>
								{{ validator.website }}
							</template>
						</Tooltip>

						<template v-for="c in parsedContacts" :key="c.value">
							<Tooltip v-if="c.type !== 'unknown'" position="start" delay="500">
								<a :href="c.value" target="_blank">
									<Icon :name="c.type" size="14" color="yellowNew" :class="$style.btn" />
								</a>

								<template #content>
									{{ c.value }}
								</template>
							</Tooltip>
						</template>
					</Flex>

					<!-- Staking -->
					<Flex direction="column" gap="16">
						<Text size="12" weight="600" color="secondary">Staking</Text>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="yellowNew" :class="$style.txDetailsName">Voting Power</Text>
							<div :class="$style.txDetailsValue">
								<AmountInCurrency :amount="{ value: validator.voting_power, unit: 'NUB' }"
								:styles="{ amount: { color: 'tertiary' } }" />
							</div>
						</Flex>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="yellowNew" :class="$style.txDetailsName">Outgoing Rewards</Text>
							<div :class="$style.txDetailsValue">
								<AmountInCurrency :amount="{ value: validator.rewards }"
								:styles="{ amount: { color: 'tertiary' } }" />
							</div>
						</Flex>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="yellowNew" :class="$style.txDetailsName">Commissions</Text>
							<div :class="$style.txDetailsValue">
								<AmountInCurrency :amount="{ value: validator.commissions }"
								:styles="{ amount: { color: 'tertiary' } }" />
							</div>
						</Flex>
					</Flex>

					<!-- Details -->
					<Flex direction="column" gap="16">
						<Text size="12" weight="600" color="secondary">Details</Text>

						<Flex v-if="!parsedContacts.length && validator.contacts" align="center" justify="between">
							<Text size="12" weight="600" color="yellowNew" :class="$style.txDetailsName">Contact</Text>
							<Text size="12" weight="600" color="tertiary" selectable :class="$style.txDetailsValue"> {{ validator.contacts }} </Text>
						</Flex>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="yellowNew" :class="$style.txDetailsName">Delegator Address</Text>
							<Flex gap="6" :class="$style.txDetailsValue">
								<AddressBadge :hash="validator.delegator" color="tertiary" />
								<CopyButton :text="validator.delegator" />
							</Flex>
						</Flex>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="yellowNew" :class="$style.txDetailsName">Consensus Address</Text>
							<Flex gap="6" :class="$style.txDetailsValue">
								<AddressBadge :hash="validator.cons_address" color="tertiary" />
								<CopyButton :text="validator.cons_address" />
							</Flex>
						</Flex>

						<!-- <Flex align="center" justify="between">
							<Text size="12" weight="600" color="yellowNew" :class="$style.txDetailsName">Identity</Text>
							<Flex gap="6" :class="$style.txDetailsValue">
								<Text size="12" weight="600" color="tertiary"> {{ validator.identity }} </Text>
								<CopyButton :text="validator.identity" />
							</Flex>
						</Flex> -->

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="yellowNew" :class="$style.txDetailsName">Rate</Text>
							<Text size="12" weight="600" color="secondary" :class="$style.txDetailsValue"> {{ numToPercent(validator.rate) }} </Text>
						</Flex>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="yellowNew" :class="$style.txDetailsName">Max Rate</Text>
							<Text size="12" weight="600" color="secondary" :class="$style.txDetailsValue"> {{ numToPercent(validator.max_rate) }}
							</Text>
						</Flex>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="yellowNew" :class="$style.txDetailsName">Max Change Rate</Text>
							<Text size="12" weight="600" color="secondary" :class="$style.txDetailsValue"> {{ numToPercent(validator.max_change_rate)
								}} </Text>
						</Flex>

						<Flex align="center" justify="between">
							<Text size="12" weight="600" color="yellowNew" :class="$style.txDetailsName">Min Self Delegation</Text>
							<Text size="12" weight="600" color="secondary" :class="$style.txDetailsValue"> {{ comma(validator.min_self_delegation) }}
							</Text>
						</Flex>

						<!-- <div :class="$style.horizontal_divider" /> -->

						<!-- Validator Uptime -->
						<!-- <Flex align="center" gap="6">
							<Text size="12" weight="600" color="secondary">Validator Uptime</Text>
							<Text size="12" weight="600" color="tertiary">(last 100 blocks)</Text>
						</Flex>

						<Flex :class="$style.uptime_wrapper">
							<Tooltip v-for="t in uptime" :key="t.signed">
								<Flex :class="$style.uptime" :style="{
								background: t.signed ? 'rgb(10, 219, 111)' : 'red',
							}" />

								<template #content>
									<Flex direction="column" gap="4">
										<Text color="primary">{{ t.height }}</Text>
										<Text color="secondary">{{ t.signed ? 'Signed' : 'Missed' }}</Text>
									</Flex>
								</template>
							</Tooltip>
						</Flex> -->
					</Flex>
				</Flex>
			</Flex>

			<Flex direction="column" gap="0" wide :class="$style.txs_wrapper">
				<Flex align="center" justify="between" :class="$style.tabs_wrapper">
					<Flex gap="4" :class="$style.tabs">
						<Flex @click="activeTab = tab.name" v-for="tab in tabs" :key="tab.name" align="center" gap="6"
							:class="[$style.tab, activeTab === tab.name && $style.active]">
							<Icon :name="tab.icon" size="12" :color=" activeTab === tab.name ? 'yellowNew' : 'secondary'" />
							<Text size="13" weight="600" :color=" activeTab === tab.name ? 'yellowNew' : 'secondary'">{{ tab.name }}</Text>
						</Flex>
					</Flex>
				</Flex>

				<Flex direction="column" gap="8"
					:class="[$style.table, isRefetching && $style.disabled]">
					<template v-if="activeTab === 'Delegators'">
						<DelegatorsTable v-if="delegators.length" :delegators="delegators" :validator="validator" />

						<Flex v-else align="center" justify="center" direction="column" gap="8" wide
							:class="$style.empty">
							<Text size="13" weight="600" color="primary" align="center"> No delegators </Text>
							<Text size="12" weight="500" height="160" color="tertiary" align="center"
								style="max-width: 220px">
								This validator does not have any {{ page === 1 ? '' : 'more' }} delegators
							</Text>
						</Flex>
					</template>

					<template v-if="activeTab === 'Proposed Blocks'">
						<BlocksTable v-if="blocks.length" :blocks="blocks" />

						<Flex v-else align="center" justify="center" direction="column" gap="8" wide
							:class="$style.empty">
							<Text size="13" weight="600" color="primary" align="center"> No blocks </Text>
							<Text size="12" weight="500" height="160" color="tertiary" align="center"
								style="max-width: 220px">
								This validator did not propose any {{ page === 1 ? '' : 'more' }} blocks
							</Text>
						</Flex>
					</template>

					<template v-if="activeTab === 'Jails'">
						<JailsTable v-if="jails.length" :jails="jails" />

						<Flex v-else align="center" justify="center" direction="column" gap="8" wide
							:class="$style.empty">
							<Text size="13" weight="600" color="primary" align="center"> No penalties </Text>
							<Text size="12" weight="500" height="160" color="tertiary" align="center"
								style="max-width: 220px">
								This validator doesn't have any {{ page === 1 ? '' : 'more' }} penalties
							</Text>
						</Flex>
					</template>

					<!-- Pagination -->
					<Flex align="center" gap="6" :class="$style.pagination">
						<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
							<Icon name="arrow-left-stop" size="12" color="primary" />
						</Button>
						<Button @click="handlePrev" type="secondary" size="mini" :disabled="page === 1">
							<Icon name="arrow-left" size="12" color="primary" />
						</Button>

						<Button type="secondary" size="mini" disabled>
							<Text class="openSans_font" size="12" weight="600" color="primary">Page {{ page }}</Text>
						</Button>

						<Button @click="handleNext" type="secondary" size="mini" :disabled="handleNextCondition">
							<Icon name="arrow-right" size="12" color="primary" />
						</Button>
					</Flex>
				</Flex>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.txDetailsName {
	width: 130px;
	height: 32px;
	border-radius: 4px 4px 4px 4px;
	border: 1px solid rgba(255, 255, 255, 0.3);
	display: flex;
	justify-content: center;
	align-items: center
}

.txDetailsValue {
	width: 170px;
	height: 32px;
	border-radius: 4px 4px 4px 4px;
	border: 1px solid rgba(255, 255, 255, 0.3);
	display: flex;
	justify-content: center;
	align-items: center
}

.header {
	border-radius: 8px 8px 0 0;
	background: rgba(255, 255, 255, 0.1);
	padding: 20px 20px 0 20px;
}

.data {
	min-width: 384px;
	border-radius: 0 0 0 8px;
	background: rgba(255, 255, 255, 0.1);
	padding: 20px;

	.main {
		background: rgba(255, 255, 255, 0.05);
		padding: 16px;
		border-radius: 4px;

		& .key_value {
			max-width: 100%;
		}
	}

	.memo {
		max-width: 352px;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	.uptime_wrapper {
		max-width: 384px;
		flex-wrap: wrap;
	}

	.uptime {
		/* width: 10px;
		height: 10px; */
		width: 0.6rem;
		height: 0.6rem;

		border-radius: 2px;
		cursor: pointer;

		margin-right: 0.35rem;
		margin-bottom: 0.35rem;
	}

	.horizontal_divider {
		width: 100%;
		height: 2px;
		background: var(--op-5);

		margin-top: 4px;
		margin-bottom: 4px;
	}
}

.txs_wrapper {
	min-width: 0;
	background: rgba(255, 255, 255, 0.1);
	padding: 20px 20px 20px 0;
}

.tabs_wrapper {
	min-height: 44px;
	overflow-x: auto;
	background: rgba(255, 255, 255, 0.1);
	padding: 16px 16px 0 16px;
	border-radius: 4px 4px 0 0;
}

.tabs_wrapper::-webkit-scrollbar {
	display: none;
}

.tab {
	height: 28px;
	cursor: pointer;
	border-radius: 6px;
	padding: 0 8px;
	transition: all 0.1s ease;

}

.tab.active {
	border-radius: 4px 4px 4px 4px;
    border: 1px solid rgb(243 57 40 / 50%);
    background: linear-gradient(rgb(243 57 40 / 20%), var(--op-3));
}

.table {
	height: 100%;
	border-radius: 0 0 4px 4px;
	padding: 0 16px;
	background: rgba(255, 255, 255, 0.1);
}

.table.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.empty {
	padding-top: 100px;
	padding-bottom: 100px;
}

.pagination {
	padding: 0 16px 16px 0;
}

@media (max-width: 800px) {
	.content {
		flex-direction: column;
	}

	.data {
		min-width: initial;

		border-radius: 4px;
	}

	.txDetailsValue {
		width: 250px;
	}

	.table {
		border-radius: 4px 4px 8px 8px;
	}

	.txs_wrapper {
		padding: 20px;
	}
}

@media (max-width: 400px) {
	.tabs_wrapper {
		overflow-x: auto;

		&::-webkit-scrollbar {
			display: none;
		}
	}

	.hint {
		display: none;
	}
}
</style>
