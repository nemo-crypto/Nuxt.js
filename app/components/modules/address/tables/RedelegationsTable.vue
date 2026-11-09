<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"
import AmountInCurrency from "@/components/AmountInCurrency.vue"

/** Services */
import { comma } from "@/services/utils"

const router = useRouter()

const props = defineProps({
	redelegations: {
		type: Array,
		required: true,
	},
})
</script>

<template>
	<div :class="$style.wrapper_redelegations">
		<table :class="$style.table">
			<thead>
				<tr>
					<th><Text size="12" weight="600" color="tertiary">Source</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Amount</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Block</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Time</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Destination</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Completion Time</Text></th>
				</tr>
			</thead>

			<tbody>
				<tr v-for="rd in redelegations" :key="rd.source.id">
					<td>
						<NuxtLink :to="`/validator/${rd.source.id}`">
							<Flex align="center">
								<Text size="12" weight="600" color="primary">
									{{ rd.source.moniker ? rd.source.moniker : splitAddress(rd.source.cons_address) }}
								</Text>
							</Flex>
						</NuxtLink>
					</td>
					<td>
						<AmountInCurrency :amount="{ value: rd.amount, decimal: 2 }" :styles="{ amount: { size: '13' }, currency: { size: '13' }}" />
					</td>
					<td>
						<Flex align="center" :class="$style.link">
							<Outline @click.prevent="router.push(`/block/${rd.height}`)">
								<Flex align="center" gap="6">
									<Icon name="block" size="14" color="yellowNew" />

									<Text class="rubik_font" size="13" weight="600" color="yellowNew" tabular>{{ comma(rd.height) }}</Text>
								</Flex>
							</Outline>
						</Flex>
					</td>
					<td>
						<Flex justify="center" direction="column" gap="6">
							<Tooltip position="start" delay="500">
								<Text size="12" weight="600" color="primary">
									{{ DateTime.fromISO(rd.time).toRelative({ locale: "en", style: "short" }) }}
								</Text>

								<template #content>
									{{ DateTime.fromISO(rd.time).setLocale("en").toFormat("LLL d, t") }}
								</template>
							</Tooltip>
						</Flex>
					</td>
					<td>
						<NuxtLink :to="`/validator/${rd.destination.id}`">
							<Flex align="center">
								<Text size="12" weight="600" color="primary">
									{{ rd.destination.moniker ? rd.destination.moniker : splitAddress(rd.destination.cons_address) }}
								</Text>
							</Flex>
						</NuxtLink>
					</td>
					<td>
						<Flex justify="center" direction="column" gap="6">
							<Tooltip position="start" delay="500">
								<Text size="12" weight="600" color="primary">
									{{ DateTime.fromISO(rd.completion_time).toRelative({ locale: "en", style: "short" }) }}
								</Text>

								<template #content>
									{{ DateTime.fromISO(rd.completion_time).setLocale("en").toFormat("LLL d, t") }}
								</template>
							</Tooltip>
						</Flex>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style module>
.wrapper_redelegations {
	min-width: 100%;
	width: 0;
	height: 100%;

	overflow-x: auto;
}

.table {
	width: 100%;
	height: fit-content;

	border-spacing: 0px;

	padding-bottom: 8px;

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

		white-space: nowrap;

		cursor: default;

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

.link {
	cursor: pointer;
}
</style>
