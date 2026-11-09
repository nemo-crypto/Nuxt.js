<script setup>
/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"
import AmountInCurrency from "@/components/AmountInCurrency.vue"

/** Services */
import { shareOfTotalString, splitAddress } from "@/services/utils"

const props = defineProps({
	delegators: {
		type: Array,
		required: true,
	},
	validator: {
		type: Object,
		required: true,
	}
})
</script>

<template>
	<div :class="$style.wrapper_blocks">
		<table :class="$style.table">
			<thead>
				<tr>
					<th><Text size="12" weight="600" color="tertiary" noWrap>Address</Text></th>
					<th><Text size="12" weight="600" color="tertiary" noWrap>Amount</Text></th>
					<th><Text size="12" weight="600" color="tertiary" noWrap>Share Of Stake</Text></th>
				</tr>
			</thead>

			<tbody>
				<tr v-for="d in delegators" :key="d.delegator">
					<td>
						<NuxtLink :to="`/address/${d.delegator}`">
							<Flex align="center" direction="row" gap="12">
								<Text class="rubik_font" size="12" weight="600" color="primary">
									{{ splitAddress(d.delegator) }}
								</Text>

								<Tooltip v-if="validator.delegator === d.delegator" position="start" delay="500">
									<Icon name="self-delegation" size="14" color="neutral-green" />

									<template #content>
										<Text size="13" weight="600" color="secondary">
											Self delegation
										</Text>
									</template>
								</Tooltip>
							</Flex>
						</NuxtLink>
					</td>
					<td>
						<NuxtLink :to="`/address/${d.delegator}`">
							<AmountInCurrency :amount="{ value: d.amount, decimal: 2 }" :styles="{ amount: { size: '13' }, currency: { size: '13' }}" />
						</NuxtLink>
					</td>
					<td>
						<NuxtLink :to="`/address/${d.delegator}`">
							<Flex align="center" gap="4">
								<Text size="13" weight="600" :color="parseFloat(d.amount) ? 'primary' : 'tertiary'">
									{{ shareOfTotalString(d.amount, validator.stake) }}
								</Text>

								<Text size="13" weight="600" color="tertiary"> %</Text>
							</Flex>
						</NuxtLink>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style module>
.wrapper_blocks {
	min-width: 100%;
	width: 0;
	overflow-x: auto;
}

.table {
	width: 100%;
	height: fit-content;

	border-spacing: 0px;

	padding-bottom: 2px;

	& tbody {
		& tr {
			cursor: pointer;

			transition: all 0.05s ease;

			&:hover {
				background: var(--op-5);
			}

			&:active {
				background: var(--op-8);
			}
		}
	}

	& tr th {
		text-align: left;
		padding: 0;
		padding-right: 16px;
		padding-top: 16px;
		padding-bottom: 8px;

		&:first-child {
			padding-left: 16px;
		}

		& span {
			display: flex;
		}
	}

	& tr td {
		padding: 0;
		padding-top: 2px;
		padding-bottom: 2px;
		padding-right: 24px;

		white-space: nowrap;

		&:first-child {
			padding-left: 16px;
		}

		& > a {
			display: flex;

			min-height: 40px;

			padding-right: 24px;
		}
	}
}
</style>
