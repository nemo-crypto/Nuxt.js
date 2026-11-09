<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { comma, tia } from "@/services/utils"

const router = useRouter()

const props = defineProps({
	jails: {
		type: Array,
		required: true,
	},
})
</script>

<template>
	<div :class="$style.wrapper_blocks">
		<table :class="$style.table">
			<thead>
				<tr>
					<th><Text size="12" weight="600" color="tertiary" noWrap>Block</Text></th>
					<th><Text size="12" weight="600" color="tertiary" noWrap>Time</Text></th>
					<th><Text size="12" weight="600" color="tertiary" noWrap>Reason</Text></th>
					<th><Text size="12" weight="600" color="tertiary" noWrap>Penalty</Text></th>
				</tr>
			</thead>

			<tbody>
				<tr v-for="j in jails" :key="j.height">
					<td>
						<NuxtLink :to="`/block/${j.height}`">
							<Flex align="center">
								<Outline>
									<Flex align="center" gap="6">
										<Icon name="block" size="14" color="yellowNew" />

										<Text size="13" weight="600" color="yellowNew" tabular>{{ comma(j.height) }}</Text>
									</Flex>
								</Outline>
							</Flex>
						</NuxtLink>
					</td>
					<td>
						<Flex justify="center" direction="column" gap="6">
							<Tooltip position="start" delay="500">
								<Text size="12" weight="600" color="primary">
									{{ DateTime.fromISO(j.time).toRelative({ locale: "en", style: "short" }) }}
								</Text>

								<template #content>
									{{ DateTime.fromISO(j.time).setLocale("en").toFormat("LLL d, t") }}
								</template>
							</Tooltip>
						</Flex>
					</td>
					<td>
						<Flex align="center" gap="4">
							<Text size="13" weight="600" color="primary">
								{{ j.reason }}
							</Text>
						</Flex>
					</td>
					<td>
						<Flex align="center" gap="4">
							<Text size="13" weight="600" :color="parseFloat(j.burned) ? 'primary' : 'tertiary'">
								{{ tia(j.burned) }}
							</Text>
							<Text size="13" weight="600" color="tertiary"> NUB </Text>
						</Flex>
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
</style>
