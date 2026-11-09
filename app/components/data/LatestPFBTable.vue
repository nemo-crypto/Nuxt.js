<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"
import Spinner from "@/components/ui/Spinner.vue"
import AmountInCurrency from "@/components/AmountInCurrency.vue"

/** Services */
import { comma, space, splitAddress, tia } from "@/services/utils"

/** API */
import { fetchLatestPFBs } from "@/services/api/tx"

const router = useRouter()

const isLoading = ref(true)
const pfbs = ref([])

const { data } = await fetchLatestPFBs()
pfbs.value = data.value
isLoading.value = false
</script>

<template>
	<Flex wide direction="column" gap="0">
		<Flex align="center" gap="8" :class="$style.header">
			<Flex align="center" gap="8">
				<Text size="20" weight="600" color="primary">Recent Transactions</Text>
			</Flex>

			<NuxtLink :to="`/txs`" class="hvr-grow">
				<Button type="secondary" size="small" :class="$style.buttons">
					<Text size="14" weight="600" color="primary">View All</Text>
					<img width="16" height="16" src="/img/viewAllWhite.svg" />
				</Button>
			</NuxtLink>
		</Flex>

		<Flex direction="column" gap="16" :class="$style.pfb_body">
			<div v-if="pfbs.length" :class="$style.table_scroller">
				<table>
					<thead>
						<tr>
							<th><Text size="12" weight="600" color="tertiary" noWrap>Hash</Text></th>
							<th><Text size="12" weight="600" color="tertiary" noWrap>Block Height</Text></th>
							<th><Text size="12" weight="600" color="tertiary" noWrap>Signer</Text></th>
							<th><Text size="12" weight="600" color="tertiary" noWrap>Fee</Text></th>
						</tr>
					</thead>

					<tbody>
						<tr v-for="pfb in pfbs" :key="pfb.hash">
							<td style="width: 1px">
								<NuxtLink :to="`/tx/${pfb.hash}`">
									<Tooltip position="start">
										<Flex align="center" gap="8">
											<img
												:class="$style.icon"
												width="14"
												height="14"
												:src="pfb?.status === 'success' ? '/img/tx-status-success.svg' : '/img/tx-status-fail.svg'"
											/>
											<Text class="rubik_font" size="13" weight="600" color="primary" mono>
												{{ pfb.hash.slice(0, 4).toUpperCase() }}
											</Text>

											<Flex align="center" gap="3">
												<div v-for="dot in 3" :key="dot" class="dot rubik_font" />
											</Flex>

											<Text class="rubik_font" size="13" weight="600" color="primary" mono>
												{{ pfb.hash.slice(pfb.hash.length - 4, pfb.hash.length).toUpperCase() }}
											</Text>

											<CopyButton :text="pfb.hash.toUpperCase()" />
										</Flex>

										<template #content>
											<Flex direction="column" gap="6">
												<Flex align="center" gap="4">
													<Icon
														:name="pfb.status === 'success' ? 'check-circle' : 'close-circle'"
														size="13"
														:color="pfb.status === 'success' ? 'green' : 'red'"
													/>
													<Text size="13" weight="600" color="primary">
														{{ pfb.status === "success" ? "Successful" : "Failed" }}
														Transaction
													</Text>
												</Flex>

												{{ space(pfb.hash.toUpperCase()) }}
											</Flex>
										</template>
									</Tooltip>
								</NuxtLink>
							</td>
							<td>
								<NuxtLink :to="`/tx/${pfb.hash}`">
									<Flex align="center">
										<Outline @click.prevent="router.push(`/block/${pfb.height}`)">
											<Flex align="center" gap="6">
												<Icon name="block" size="14" color="yellowNew" />

												<Text class="rubik_font" size="13" weight="600" color="yellowNew" tabular>{{
													comma(pfb.height)
												}}</Text>
											</Flex>
										</Outline>
									</Flex>
								</NuxtLink>
							</td>
							<td>
								<NuxtLink :to="`/tx/${pfb.hash}`">
									<Flex align="center">
										<Text size="12" weight="600" color="primary">
											{{ splitAddress(pfb.signers[0]) }}
										</Text>
									</Flex>
								</NuxtLink>
							</td>
							<td>
								<NuxtLink :to="`/tx/${pfb.hash}`">
									<AmountInCurrency :amount="{ value: pfb.fee, decimal: 6 }" />
								</NuxtLink>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<Flex v-else-if="isLoading" align="center" justify="center" gap="8" wide>
				<Spinner size="14" />
				<Text size="13" weight="500" color="secondary"> Loading Recent Transactions </Text>
			</Flex>

			<Flex v-else align="center" justify="center" direction="column" gap="8" wide :class="$style.empty">
				<Text size="13" weight="600" color="secondary" align="center"> Recent Transactions not found </Text>
				<Text size="12" weight="500" height="160" color="tertiary" align="center" style="max-width: 220px">
					This data is temporarily unavailable
				</Text>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.buttons {
	width: 150px;
	height: 32px !important;
	background: linear-gradient(rgb(243 57 40 / 20%), var(--op-3)) !important;
}

.buttons:hover {
	background: #d7574c !important;
}

.header {
	padding: 20px;
	border-radius: 8px 8px 0 0;
	background: rgba(255, 255, 255, 0.1);
	justify-content: space-between;
}

.pfb_body {
	padding: 0 20px 20px 20px;
	border-radius: 0 0 8px 8px;
	background: rgba(255, 255, 255, 0.1);

	thead th {
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	& table {
		width: 100%;

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
			padding-top: 16px;
			padding-bottom: 8px;

			& span {
				display: flex;
			}

			&:first-child {
				padding-left: 16px;
			}
		}

		& tr td {
			padding: 0;

			white-space: nowrap;

			&:first-child {
				padding-left: 16px;
			}

			& > a {
				display: flex;

				min-height: 40px;

				padding-right: 16px;
			}
		}
	}
}

.empty {
	margin: 32px 0 16px 0;
}

.table_scroller {
	overflow-x: auto;
}
</style>
