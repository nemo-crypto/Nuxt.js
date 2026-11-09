<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { comma, formatBytes, space, getNamespaceID } from "@/services/utils"

const router = useRouter()

const props = defineProps({
	namespaces: {
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
					<th><Text size="12" weight="600" color="tertiary">Namespace ID</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Time</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Version</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Size</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Submit Blob Payment</Text></th>
				</tr>
			</thead>

			<tbody>
				<tr v-for="ns in namespaces" :key="ns.hash">
					<td style="width: 1px">
						<NuxtLink :to="`/namespace/${ns.namespace_id}`">
							<Flex align="center">
								<Tooltip position="start">
									<Flex :align="ns.name === getNamespaceID(ns.namespace_id) ? 'center' : 'start'" gap="8">
										<template v-if="ns.hash">
											<Flex direction="column" gap="4">
												<Flex v-if="getNamespaceID(ns.namespace_id).length > 8" align="center" gap="8">
													<Text class="rubik_font" size="12" weight="600" color="primary" mono>
														{{ getNamespaceID(ns.namespace_id).slice(0, 4) }}
													</Text>

													<Flex align="center" gap="3">
														<div v-for="dot in 3" :key="dot" class="dot rubik_font" />
													</Flex>

													<Text class="rubik_font" size="12" weight="600" color="primary" mono>
														{{ getNamespaceID(ns.namespace_id).slice(-4) }}
													</Text>

													<CopyButton :text="getNamespaceID(ns.namespace_id)" />
												</Flex>

												<Flex v-else align="center" gap="8">
													<Text class="rubik_font" size="12" weight="600" color="primary" mono>
														{{ space(getNamespaceID(ns.namespace_id)) }}
													</Text>

													<CopyButton :text="getNamespaceID(ns.namespace_id)" />
												</Flex>

												<Text
													v-if="ns.name !== getNamespaceID(ns.namespace_id)"
													class="rubik_font"
													size="12"
													weight="500"
													color="tertiary"
												>
													{{ ns.name }}
												</Text>
											</Flex>
										</template>
										<template v-else>
											<Text size="13" weight="700" color="secondary" mono>Genesis</Text>
										</template>
									</Flex>

									<template #content>
										{{ space(getNamespaceID(ns.namespace_id)) }}
									</template>
								</Tooltip>
							</Flex>
						</NuxtLink>
					</td>
					<td>
						<NuxtLink :to="`/namespace/${ns.namespace_id}`">
							<Flex direction="column" justify="center" gap="4">
								<Text size="12" weight="600" color="primary">
									{{ DateTime.fromISO(ns.last_message_time).toRelative({ locale: "en", style: "short" }) }}
								</Text>
								<Text size="12" weight="500" color="tertiary">
									{{ DateTime.fromISO(ns.last_message_time).setLocale("en").toFormat("LLL d, t") }}
								</Text>
							</Flex>
						</NuxtLink>
					</td>
					<td>
						<NuxtLink :to="`/namespace/${ns.namespace_id}`">
							<Flex align="center">
								<Text size="13" weight="600" color="primary">{{ ns.version }}</Text>
							</Flex>
						</NuxtLink>
					</td>
					<td>
						<NuxtLink :to="`/namespace/${ns.namespace_id}`">
							<Flex align="center">
								<Text size="13" weight="600" color="primary">{{ formatBytes(ns.size) }}</Text>
							</Flex>
						</NuxtLink>
					</td>
					<td>
						<NuxtLink :to="`/namespace/${ns.namespace_id}`">
							<Flex align="center">
								<Text class="rubik_font" size="13" weight="600" color="primary">{{ comma(ns.pfb_count) }}</Text>
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
