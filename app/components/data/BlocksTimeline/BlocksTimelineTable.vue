<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"
import AmountInCurrency from "@/components/AmountInCurrency.vue"

/** Services */
import { comma, formatBytes, getNamespaceID, shortHex, space, tia } from "@/services/utils"

/** API */
import { fetchBlockBlobs } from "@/services/api/block"
import { fetchTransactionsByBlock } from "@/services/api/tx"

/** Store */
import { useAppStore } from "@/store/app"
import { useNotificationsStore } from "@/store/notifications"
const appStore = useAppStore()
const notificationsStore = useNotificationsStore()

const blocks = computed(() => appStore.latestBlocks)
const lastBlock = computed(() => appStore.latestBlocks[0])
const lastHead = computed(() => appStore.lastHead)
const preview = reactive({
	block: blocks.value[0],
	transactions: [],
	pfbs: [],

	isLoadingNamespaces: true,
})

const autoSelect = ref(true)

const handleSelectBlock = (b, isUser) => {
	if (isUser) autoSelect.value = false

	if (preview.block.height === b.height) return

	preview.block = b
	preview.namespaces = []
}

const getTransactionsByBlock = async () => {
	const { data } = await fetchTransactionsByBlock({
		height: preview.block.height,
		from: parseInt(DateTime.fromISO(preview.block.time) / 1000),
	})
	preview.transactions = data.value
}
getTransactionsByBlock()

const blocksSnapshot = ref([])
const isPaused = ref(false)

const handlePause = () => {
	if (!lastHead?.value.synced) return

	isPaused.value = !isPaused.value
}

watch(
	() => isPaused.value,
	() => {
		if (isPaused.value) {
			blocksSnapshot.value = [...blocks.value]
		} else {
			const newBlocksSincePause = blocks.value[0]?.height - blocksSnapshot.value[0]?.height

			if (newBlocksSincePause)
				notificationsStore.create({
					notification: {
						type: "info",
						icon: "block",
						title: `Received ${blocks.value[0]?.height - blocksSnapshot.value[0]?.height} new blocks since the pause`,
						description: "New blocks will be added to the timeline",
						autoDestroy: true,
					},
				})

			blocksSnapshot.value = []

			handleSelectBlock(lastBlock.value, false)
		}
	},
)

/** Auto-pause for unsynced head */
if (Object.keys(lastHead.value).length !== 0 && !lastHead?.value.synced) {
	handlePause()

	// notificationsStore.create({
	// 	notification: {
	// 		type: "warning",
	// 		icon: "pause",
	// 		title: `The blocks timeline on pause`,
	// 		description: "Due to the unsynced head",
	// 		autoDestroy: false,
	// 	},
	// })
}

watch(
	() => preview.block,
	async () => {
		if (preview.block.stats.tx_count) {
			if (preview.block.stats.blobs_size) preview.isLoadingNamespaces = true

			getTransactionsByBlock()
		}
	},
)

watch(
	() => preview.transactions,
	async () => {
		if (preview.block.stats.blobs_size === 0) {
			preview.isLoadingNamespaces = false
			return
		}

		const data = await fetchBlockBlobs({ height: preview.block.height })
		let namespaces = []

		data.forEach((blob) => {
			namespaces.push(blob.namespace)
		})

		preview.namespaces = Array.from(new Map(namespaces.map((item) => [item.id, item])).values())
		preview.isLoadingNamespaces = false
	},
)

watch(
	() => lastBlock.value,
	() => {
		if (autoSelect.value && !isPaused.value) handleSelectBlock(lastBlock.value, false)
	},
)

watch(
	() => autoSelect.value,
	() => {
		if (autoSelect.value) handleSelectBlock(lastBlock.value, false)
	},
)
</script>

<template>
	<Flex wide direction="column" gap="0">
		<Flex align="center" justify="between" :class="$style.header">
			<Flex align="center" gap="8">
				<Text size="20" weight="600" color="primary">Recent Blocks</Text>
			</Flex>
		</Flex>

		<div :class="$style.content">
			<Flex direction="column" :class="[$style.preview]">
				<div :class="[$style.previewContainer]">
					<div :class="[$style.previewContainerTop]">
						<Flex direction="column" gap="12" :class="$style.top">
							<Flex align="center" justify="between">
								<Flex align="center" gap="6">
									<Flex align="center" gap="4">
										<Text size="16" weight="600" color="primary" style="margin-right: 5px"> Height </Text>
										<Text class="openSans_font" size="20" weight="600" color="primary">
											{{ comma(preview.block.height) }}
										</Text>

										<NuxtLink :to="`/block/${preview.block.height}`" style="margin-left: 4px">
											<img width="16" height="16" src="/img/blockLink.svg" />
										</NuxtLink>
									</Flex>
								</Flex>

								<Text size="12" weight="600" color="tertiary">
									{{ DateTime.fromISO(preview.block.time).setLocale("en").toFormat("ff") }}
								</Text>
							</Flex>

							<Flex align="center" justify="between" :class="$style.timing">
								<Text class="ds_font" size="14" weight="600" color="primary" :class="$style.fixed_width">
									{{
										DateTime.fromISO(preview.block.time)
											.minus({ milliseconds: preview.block.stats.block_time })
											.setLocale("en")
											.toFormat("TT")
									}}
								</Text>

								<div v-for="dot in 3" :key="dot" class="dot" />

								<Flex align="center" gap="6" :class="$style.fixed_width">
									<Icon name="time" size="16" color="secondary" />
									<Text class="openSans_font" size="14" weight="600" color="primary">
										{{ (preview.block.stats.block_time / 1000).toFixed(2) }}s
									</Text>
								</Flex>

								<div v-for="dot in 3" :key="dot" class="dot ds_font" />

								<Text class="ds_font" size="14" weight="600" color="secondary" align="right" :class="$style.fixed_width">
									{{ DateTime.fromISO(preview.block.time).setLocale("en").toFormat("TT") }}
								</Text>
							</Flex>
						</Flex>

						<Flex direction="column" gap="12" :class="$style.proposer">
							<Text size="16" weight="600" color="primary">Proposer</Text>

							<Flex gap="8" :class="$style.proposerContainer">
								<Flex align="center" gap="6">
									<Text class="rubik_font" size="12" weight="600" color="tertiary">{{
										shortHex(preview.block.proposer.cons_address)
									}}</Text>

									<CopyButton :text="preview.block.proposer.cons_address" size="16" />
								</Flex>
							</Flex>
						</Flex>

						<Flex direction="column" gap="8" :class="$style.key_value">
							<Text size="16" weight="600" color="primary">Hash</Text>
							<BadgeValue :text="preview.block.hash" :class="$style.key_hash" />
						</Flex>
					</div>

					<Flex direction="column" gap="24" :class="$style.main">
						<Flex direction="column" gap="16">
							<Text size="16" weight="600" color="primary" style="margin-top: 20px">Details</Text>

							<div :class="$style.mainDetails">
								<Flex align="center" justify="between" :class="$style.mainDetailsList">
									<Text size="14" weight="600" color="yellowNew" :class="$style.detailName"> Events</Text>
									<Text size="12" weight="600" color="secondary" :class="$style.detailValue">
										{{ preview.block.stats.events_count }}
									</Text>
								</Flex>
								<Flex align="center" justify="between" :class="$style.mainDetailsList">
									<Text size="14" weight="600" color="yellowNew" :class="$style.detailName"> Blobs </Text>
									<Text size="12" weight="600" color="secondary" :class="$style.detailValue">
										{{ formatBytes(preview.block.stats.blobs_size) }}
									</Text>
								</Flex>
								<Flex align="center" justify="between" :class="$style.mainDetailsList">
									<Text size="14" weight="600" color="yellowNew" :class="$style.detailName"> Total Fees </Text>
									<div :class="$style.detailValue">
										<AmountInCurrency
											:amount="{ value: preview.block.stats.fee, decimal: 6 }"
											:styles="{ amount: { color: 'secondary' }, currency: { color: 'secondary' } }"
										/>
									</div>
								</Flex>
							</div>
						</Flex>

						<div :class="$style.commonLineNew" />

						<div :class="$style.mainTxNp">
							<Flex direction="column" gap="12" :class="$style.mainTxNpLeft">
								<Flex align="center" justify="between">
									<Text size="16" weight="600" color="primary">Transactions</Text>

									<Text v-if="preview.block.stats.tx_count > 5" size="12" weight="600" color="secondary">
										5 <Text color="tertiary">of {{ comma(preview.block.stats.tx_count) }}</Text>
									</Text>
									<Text v-else size="12" weight="600" color="secondary">
										{{ preview.block.stats.tx_count }}
									</Text>
								</Flex>

								<Flex v-if="preview.block.stats.tx_count" direction="column" gap="8">
									<NuxtLink
										v-for="transaction in preview.transactions.slice(0, 5)"
										:key="transaction?.hash"
										:to="`/tx/${transaction.hash}`"
									>
										<div wide height="32" padding="8" radius="6" :class="$style.mainTxNpLeftTxList">
											<Flex justify="between" align="center" wide :class="$style.mainTxNpLeftTxListInfo">
												<Flex align="center" gap="8">
													<img
														:class="$style.icon"
														width="14"
														height="14"
														:src="
															transaction?.status === 'success'
																? '/img/tx-status-success.svg'
																: '/img/tx-status-fail.svg'
														"
													/>
													<Text class="rubik_font" size="13" weight="600" color="primary" mono>{{
														transaction.hash.slice(0, 4)
													}}</Text>

													<Flex align="center" gap="3">
														<div v-for="dot in 3" :key="dot" class="dot rubik_font" />
													</Flex>

													<Text class="rubik_font" size="13" weight="600" color="primary" mono>
														{{ transaction.hash.slice(transaction.hash.length - 4, transaction.hash.length) }}
													</Text>
												</Flex>

												<Flex v-if="transaction.message_types.length" align="center" gap="6">
													<Text size="12" height="160" weight="600" color="tertiary" :class="$style.message_type">
														{{ transaction.message_types[0].replace("Msg", "") }}
													</Text>
													<Text
														v-if="transaction.message_types.length > 1"
														size="12"
														weight="600"
														color="primary"
														:class="$style.badge"
													>
														+{{ transaction.message_types.length - 1 }}
													</Text>
												</Flex>
											</Flex>
										</div>
									</NuxtLink>

									<Flex v-if="preview.block.stats.tx_count > 5" align="center" gap="6">
										<img width="16" height="16" src="/img/heloInfo.svg" />
										<Text size="12" weight="500" color="tertiary">{{ preview.block.stats.tx_count - 5 }} more.</Text>
										<Text size="12" weight="500" color="support"> View all transactions on the block page </Text>
									</Flex>
								</Flex>
								<Text v-else size="12" weight="600" color="tertiary" align="center" :class="$style.empty_state">
									No transactions
								</Text>
							</Flex>
							<Flex direction="column" gap="12" :class="$style.mainTxNpRigth">
								<Flex align="center" justify="between">
									<Text size="16" weight="600" color="primary">Namespaces</Text>
									<Text size="12" weight="600" color="secondary">
										{{ preview.namespaces?.length > 3 ? "3 /" : "" }} {{ preview.namespaces?.length }}
									</Text>
								</Flex>

								<Text
									v-if="preview.isLoadingNamespaces"
									size="12"
									weight="600"
									color="tertiary"
									align="center"
									:class="$style.empty_state"
								>
									Loading namespaces..
								</Text>
								<Flex v-else-if="preview.namespaces?.length" direction="column" gap="8">
									<NuxtLink
										v-for="ns in preview.namespaces.slice(0, 3)"
										:key="ns?.namespace_id"
										:to="`/namespace/${ns.namespace_id}`"
									>
										<Outline wide height="32" padding="8" radius="6">
											<Flex align="center" justify="between" wide>
												<Flex align="center" gap="8">
													<Icon name="namespace" size="12" color="secondary" />

													<Text size="13" weight="600" color="primary" mono>
														{{ getNamespaceID(ns.namespace_id).slice(0, 4) }}
													</Text>

													<Flex align="center" gap="3">
														<div v-for="dot in 3" :key="dot" class="dot" />
													</Flex>

													<Text size="13" weight="600" color="primary" mono>
														{{ getNamespaceID(ns.namespace_id).slice(-4) }}
													</Text>
												</Flex>

												<Text size="12" weight="600" color="tertiary">{{ formatBytes(ns.size) }}</Text>
											</Flex>
										</Outline>
									</NuxtLink>
								</Flex>
								<Text v-else size="12" weight="600" color="tertiary" align="center" :class="$style.empty_state">
									No namespaces
								</Text>
							</Flex>
						</div>
					</Flex>
				</div>
			</Flex>

			<Flex direction="column" wide :class="$style.table">
				<div :class="$style.leftContainer">
					<div :class="$style.table_scroller">
						<table>
							<thead>
								<tr>
									<th><Text size="12" weight="600" color="tertiary">Block Height</Text></th>
									<th><Text size="12" weight="600" color="tertiary">Time</Text></th>
									<th><Text size="12" weight="600" color="tertiary">Proposer</Text></th>
									<th><Text size="12" weight="600" color="tertiary">Txs</Text></th>
									<th><Text size="12" weight="600" color="tertiary">Blobs</Text></th>
									<th><Text size="12" weight="600" color="tertiary">Total Fees</Text></th>
								</tr>
							</thead>

							<tbody>
								<tr
									v-for="block in !isPaused ? blocks.slice(0, 15) : blocksSnapshot"
									:key="block.height"
									@click="handleSelectBlock(block, true)"
									:class="preview.block.time === block.time && $style.active"
								>
									<td style="width: 1px">
										<NuxtLink :to="`/block/${block.height}`">
											<Outline>
												<Flex align="center" gap="6">
													<Icon name="block" size="14" color="yellowNew" />

													<Text class="rubik_font" size="13" weight="600" color="yellowNew" tabular>{{
														comma(block.height)
													}}</Text>
												</Flex>
											</Outline>
										</NuxtLink>
									</td>
									<td>
										<Flex align="center">
											<Text size="12" weight="600" color="primary">
												{{
													DateTime.fromISO(block.time)
														.plus({ seconds: block.stats.block_time / 1000 })
														.toRelative({ locale: "en", style: "short" })
												}}
											</Text>
										</Flex>
									</td>
									<td>
										<Tooltip delay="500">
											<template #default>
												<Flex direction="column" gap="4">
													<Text
														size="12"
														height="120"
														weight="600"
														color="primary"
														:class="$style.proposer_moniker"
													>
														{{ block.proposer.moniker }}
													</Text>

													<Flex align="center" gap="6">
														<Text class="rubik_font" size="12" weight="600" color="tertiary" mono>
															{{ block.proposer.cons_address.slice(0, 4) }}
														</Text>
														<Flex align="center" gap="3">
															<div v-for="dot in 3" :key="dot" class="dot rubik_font" />
														</Flex>
														<Text class="rubik_font" size="12" weight="600" color="tertiary" mono>
															{{
																block.proposer.cons_address.slice(
																	block.proposer.cons_address.length - 4,
																	block.proposer.cons_address.length,
																)
															}}
														</Text>
														<CopyButton :text="block.proposer.cons_address" size="16" />
													</Flex>
												</Flex>
											</template>

											<template #content>
												<Flex direction="column" align="start" gap="6">
													<Text color="primary">{{ block.proposer.moniker }}</Text>
													<Text color="tertiary">{{ space(block.proposer.cons_address) }}</Text>
												</Flex>
											</template>
										</Tooltip>
									</td>
									<td>
										<Flex align="center">
											<Text size="13" weight="600" color="primary">
												{{ block.stats.tx_count }}
											</Text>
										</Flex>
									</td>
									<td>
										<Flex align="center">
											<Text size="13" weight="600" color="primary">
												{{ block.stats.blobs_count }}
											</Text>
										</Flex>
									</td>
									<td>
										<Flex align="center" gap="4">
											<AmountInCurrency
												:amount="{ value: block.stats.fee, decimal: 6 }"
												:styles="{ amount: { size: '13' } }"
											/>
										</Flex>
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					<Button link="/blocks" type="secondary" size="small" :class="$style.buttons">
						<Text size="16" weight="600" color="primary">View All Blocks</Text>
						<img width="16" height="16" src="/img/viewAllWhite.svg" />
					</Button>
				</div>
			</Flex>
		</div>
	</Flex>
</template>

<style module>
.mainTxNpLeftTxList {
	width: 100%;
	height: 36px;
	border-radius: 4px 4px 4px 4px;
	border: 1px solid rgba(255, 255, 255, 0.3);
	display: flex;
	align-items: center;

	.mainTxNpLeftTxListInfo {
		padding: 0 15px;
	}
}

.mainTxNp {
	display: flex;
	justify-content: space-between;

	.mainTxNpLeft {
		width: 50%;
		padding-right: 15px;
		border-right: 1px solid rgba(255, 255, 255, 0.3);
	}

	.mainTxNpRigth {
		width: 50%;
		padding-left: 15px;
	}
}

.mainDetails {
	display: flex;
	align-items: center;
	justify-content: space-between;

	.mainDetailsList {
		width: 383px;
		height: 36px;
		padding: 0 15px;
		border-radius: 4px 4px 4px 4px;
		border: 1px solid rgba(255, 255, 255, 0.3);
	}
}

.previewContainerTop {
	display: flex;
	align-items: center;
	justify-content: space-between;

	.top {
		width: 383px;
	}

	.proposer {
		width: 383px;
		margin-top: -7px;

		.proposerContainer {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 36px;
			background: 1px solid rgba(255, 255, 255, 0.3);
			border-radius: 4px 4px 4px 4px;
			border: 1px solid rgba(255, 255, 255, 0.3);
			padding: 0 15px;
			margin-top: 4px;
		}
	}

	.key_value {
		width: 383px;
		margin-top: -7px;
	}
}

.header {
	padding: 25px 20px 0 20px;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 8px 8px 0 0;
}

.pauseAction {
	width: 118px;
	height: 34px;
	background: linear-gradient(90deg, #ff9502 0%, #ff6b00 100%) !important;
	border-radius: 4px 4px 4px 4px;
}

.status {
	width: 100%;
	height: 41px;
	background: rgba(247, 147, 26, 0.1);
	border-radius: 4px 4px 4px 4px;
	border: 1px solid #f7931a;
}

.block_icon {
	animation: blink 3s ease infinite;
}

@keyframes blink {
	0% {
		transform: translateY(-200%) scale(0.8);
		opacity: 0;
	}

	30% {
		transform: translateY(0) scale(1);
		opacity: 1;
	}

	60% {
		transform: translateY(0) scale(1);
		opacity: 1;
	}

	100% {
		transform: translateY(180%) scale(0.8);
		opacity: 0;
	}
}

.table {
	border-radius: 0 0 8px 8px;
	padding: 0 35px 20px 35px;
	background: rgba(255, 255, 255, 0.1);

	& table {
		width: 100%;
		height: fit-content;

		border-spacing: 0px;

		& tbody {
			& tr {
				cursor: pointer;

				transition: all 0.07s ease;

				&.active {
					opacity: 1;

					background: var(--op-3);

					& td:last-child {
						border-right: 2px solid #f33928;
					}
				}

				&:hover {
					opacity: 1;

					background: var(--op-5);
				}
			}
		}

		& tr th {
			text-align: left;
			padding: 0;
			padding-bottom: 8px;
			padding-right: 24px;

			&:first-child {
				padding-left: 16px;
			}

			& span {
				display: flex;
			}
		}

		& tr td {
			padding: 0;
			padding-right: 16px;
			padding-top: 8px;
			padding-bottom: 8px;

			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;

			border-right: 2px solid transparent;

			&:first-child {
				padding-left: 16px;
			}
		}
	}
}

.leftContainer {
	background: rgba(255, 255, 255, 0.05);
	border-radius: 4px;
	padding: 0 30px 20px 30px;
	height: 100%;
}

thead th {
	height: 46px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.5);
}

.previewContainer {
	background: rgba(255, 255, 255, 0.05);
	border-radius: 4px;
	padding: 20px 30px;
	height: 100%;
}

.preview {
	min-width: 455px;
	border-radius: 0;
	padding: 20px 35px;
	background: rgba(255, 255, 255, 0.1);

	.timing {
		height: 36px;
		border-radius: 4px 4px 4px 4px;
		border: 1px solid rgba(255, 255, 255, 0.3);
		margin-top: 8px;
		margin-bottom: 8px;

		padding: 0 8px;

		.fixed_width {
			width: 60px;
		}
	}

	.main {
		flex: 1;
	}
}

.commonLineNew {
	border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.buttons {
	width: 100%;
	height: 50px !important;
	background: linear-gradient(rgb(243 57 40 / 20%), var(--op-3)) !important;
	border-radius: 12px 12px 12px 12px !important;
	width: 675px;
	margin: auto;
}

.buttons:hover {
	background: #f33928 !important;
}

.table_scroller {
	overflow-x: auto;
	margin-top: 20px;
	margin-bottom: 20px;
}

.key_value {
	max-width: 100%;
}

.key_hash {
	height: 36px !important;
	border-radius: 4px 4px 4px 4px !important;
	color: #fff !important;
	border: 1px solid rgba(255, 255, 255, 0.3) !important;
	background: transparent !important;
	margin-top: 7px;
}

.proposer_moniker {
	max-width: 150px;

	text-overflow: ellipsis;
	overflow: hidden;
}

.empty_state {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 32px;

	border-radius: 6px;
	background: var(--op-5);

	padding: 0 8px;
}

.badge {
	border-radius: 5px;
	background: var(--op-5);
	box-shadow: inset 0 0 0 1px var(--op-10);

	padding: 4px 6px;
}

@media (max-width: 900px) {
	.content {
		flex-direction: column-reverse;
	}

	.commonLineNew {
		display: none;
	}

	.mainTxNp {
		display: block;

		.mainTxNpLeft {
			width: 100%;
			border-right: none;
			margin-bottom: 20px;
			padding-right: 0;
		}

		.mainTxNpRigth {
			width: 100%;
			padding-left: 0;
		}
	}

	.main {
		.mainDetails {
			display: block;

			.mainDetailsList {
				width: 100%;
				margin-bottom: 12px;
			}
		}
	}

	.preview {
		border-radius: 0;
		padding: 20px 16px;

		.previewContainer {
			padding: 20px 10px;

			.previewContainerTop {
				display: block;

				.top {
					width: 100%;
					margin-bottom: 10px;
				}

				.proposer {
					width: 100%;
				}

				.key_value {
					margin-top: 10px;
					width: 100%;
				}
			}
		}
	}

	.table {
		flex: 1;
		border-radius: 0 0 8px 8px;
		padding: 0 16px 20px 16px;

		.leftContainer {
			padding: 0;

			.buttons {
				width: 100%;
			}
		}
	}
}

@media (max-width: 500px) {
	.preview {
		min-width: initial;
	}
}
</style>
