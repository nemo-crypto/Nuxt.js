<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** Shared Components */
import MessageTypeBadge from "@/components/shared/MessageTypeBadge.vue"

/** Services */
import { comma, space } from "@/services/utils"

const router = useRouter()

const props = defineProps({
	messages: {
		type: Array,
		required: true,
	},
})
</script>

<template>
	<div :class="$style.wrapper_messages">
		<table :class="$style.table">
			<thead>
				<tr>
					<th><Text size="12" weight="600" color="tertiary">Hash</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Type</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Time</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Block</Text></th>
				</tr>
			</thead>

			<tbody>
				<tr v-for="message in messages" :key="message.tx?.hash">
					<td style="width: 1px">
						<NuxtLink :to="`/tx/${message.tx?.hash}`">
							<Tooltip position="start" delay="500">
								<Flex align="center" gap="8">
									<Icon
										:name="message.tx.status === 'success' ? 'check-circle' : 'close-circle'"
										size="14"
										:color="message.tx.status === 'success' ? 'green' : 'red'"
									/>

									<Text class="rubik_font" size="13" weight="600" color="primary" mono>{{ message.tx.hash.slice(0, 4).toUpperCase() }}</Text>

									<Flex align="center" gap="3">
										<div v-for="dot in 3" :key="dot" class="dot rubik_font" />
									</Flex>

									<Text class="rubik_font" size="13" weight="600" color="primary" mono>
										{{ message.tx.hash.slice(message.tx.hash.length - 4, message.tx.hash.length).toUpperCase() }}
									</Text>

									<CopyButton :text="message.tx.hash" />
								</Flex>

								<template #content>
									<Flex direction="column" gap="6">
										<Flex align="center" gap="4">
											<Icon
												:name="message.tx.status === 'success' ? 'check-circle' : 'close-circle'"
												size="14"
												:color="message.tx.status === 'success' ? 'green' : 'red'"
											/>
											<Text size="13" weight="600" color="primary">
												{{ message.tx.status === "success" ? "Successful" : "Failed" }} Transaction
											</Text>
										</Flex>

										{{ space(message.tx.hash).toUpperCase() }}
									</Flex>
								</template>
							</Tooltip>
						</NuxtLink>
					</td>
					<td style="width: 1px">
						<NuxtLink :to="`/tx/${message.tx?.hash}`">
							<Flex align="center">
								<MessageTypeBadge :types="[message.type]" />
							</Flex>
						</NuxtLink>
					</td>
					<td>
						<NuxtLink :to="`/tx/${message.tx?.hash}`">
							<Flex align="center">
								<Text size="13" weight="600" color="primary">
									{{ DateTime.fromISO(message.time).toRelative({ locale: "en", style: "short" }) }}
								</Text>
							</Flex>
						</NuxtLink>
					</td>
					<td>
						<NuxtLink :to="`/tx/${message.tx?.hash}`">
							<Flex align="center">
								<Outline @click.prevent="router.push(`/block/${message.height}`)">
									<Flex align="center" gap="6">
										<Icon name="block" size="14" color="yellowNew" />

										<Text class="rubik_font" size="13" weight="600" color="yellowNew" tabular>{{ comma(message.height) }}</Text>
									</Flex>
								</Outline>
							</Flex>
						</NuxtLink>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style module>
.wrapper_messages {
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
