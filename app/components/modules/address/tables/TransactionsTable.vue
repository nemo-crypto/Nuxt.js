<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** Services */
import { comma, space } from "@/services/utils"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** Shared Components */
import MessageTypeBadge from "@/components/shared/MessageTypeBadge.vue"

const router = useRouter()

const emit = defineEmits(["onSort"])
const props = defineProps({
	transactions: {
		type: Array,
		required: true,
	},
	sort: {
		type: Object,
	},
})
</script>

<template>
	<div :class="$style.wrapper_transactions">
		<table :class="$style.table">
			<thead>
				<tr>
					<th><Text size="12" weight="600" color="tertiary">Hash</Text></th>
					<th @click="$emit('onSort', 'time')" :class="$style.sortable">
						<Flex align="center" gap="6">
							<Text size="12" weight="600" color="tertiary" noWrap style="text-transform: capitalize"> Time </Text>
							<Icon
								name="chevron"
								size="12"
								color="secondary"
								:style="{ transform: `rotate(${sort.dir === 'asc' ? '180' : '0'}deg)` }"
							/>
						</Flex>
					</th>
					<th><Text size="12" weight="600" color="tertiary">Messages</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Block</Text></th>
				</tr>
			</thead>

			<tbody>
				<tr v-for="tx in transactions" :key="tx.hash">
					<td style="width: 1px">
						<NuxtLink :to="`/tx/${tx.hash}`">
							<Tooltip position="start" delay="500">
								<Flex align="center" gap="8">
									<Icon
										:name="tx.status === 'success' ? 'check-circle' : 'close-circle'"
										size="14"
										:color="tx.status === 'success' ? 'green' : 'red'"
									/>

									<Text class="rubik_font" size="13" weight="600" color="primary" mono>
										{{ tx.hash.slice(0, 4).toUpperCase() }}
									</Text>

									<Flex align="center" gap="3">
										<div v-for="dot in 3" :key="dot" class="dot rubik_font" />
									</Flex>

									<Text class="rubik_font" size="13" weight="600" color="primary" mono>
										{{ tx.hash.slice(tx.hash.length - 4, tx.hash.length).toUpperCase() }}
									</Text>

									<CopyButton :text="tx.hash" />
								</Flex>

								<template #content>
									<Flex direction="column" gap="6">
										<Flex align="center" gap="4">
											<Icon
												:name="tx.status === 'success' ? 'check-circle' : 'close-circle'"
												size="13"
												:color="tx.status === 'success' ? 'green' : 'red'"
											/>
											<Text size="13" weight="600" color="primary">
												{{ tx.status === "success" ? "Successful" : "Failed" }} Transaction
											</Text>
										</Flex>

										{{ space(tx.hash).toUpperCase() }}
									</Flex>
								</template>
							</Tooltip>
						</NuxtLink>
					</td>
					<td>
						<NuxtLink :to="`/tx/${tx.hash}`">
							<Flex justify="center" direction="column" gap="4">
								<Text size="12" weight="600" color="primary">
									{{ DateTime.fromISO(tx.time).toRelative({ locale: "en", style: "short" }) }}
								</Text>
								<Text size="12" weight="500" color="tertiary">
									{{ DateTime.fromISO(tx.time).setLocale("en").toFormat("LLL d, t") }}
								</Text>
							</Flex>
						</NuxtLink>
					</td>
					<td>
						<NuxtLink :to="`/tx/${tx.hash}`">
							<Tooltip position="start" textAlign="left">
								<MessageTypeBadge :types="tx.message_types" />

								<template #content>
									<Flex direction="column" gap="8">
										<Text v-for="type in tx.message_types" :key="type" color="primary">
											{{ type.replace("Msg", "") }}
										</Text>
									</Flex>
								</template>
							</Tooltip>
						</NuxtLink>
					</td>
					<td>
						<Flex align="center" :class="$style.link">
							<Outline @click.prevent="router.push(`/block/${tx.height}`)">
								<Flex align="center" gap="6">
									<Icon name="block" size="14" color="yellowNew" />

									<Text size="13" weight="600" color="yellowNew" tabular>{{ comma(tx.height) }}</Text>
								</Flex>
							</Outline>
						</Flex>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style module>
.wrapper_transactions {
	min-width: 100%;
	width: 0;
	height: 100%;

	overflow-x: auto;
}

.table {
	width: 100%;
	height: fit-content;

	border-spacing: 0px;

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

		&.sortable {
			cursor: pointer;
		}
	}

	& tr td {
		padding: 0;
		padding-right: 24px;
		padding-top: 8px;
		padding-bottom: 8px;

		white-space: nowrap;

		&:first-child {
			padding-left: 16px;
		}
	}
}

.link {
	cursor: pointer;
}
</style>
