<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { formatBytes } from "@/services/utils"

/** Store */
import { useCacheStore } from "@/store/cache"
import { useModalsStore } from "@/store/modals"
const cacheStore = useCacheStore()
const modalsStore = useModalsStore()

const props = defineProps({
	blobs: {
		type: Array,
		required: true,
	},
	namespace: {
		type: Object,
		required: true,
	},
})

const handleViewBlob = (blob) => {
	cacheStore.selectedBlob = {
		...blob,
		hash: blob.namespace ? blob.namespace.hash : props.namespace.hash,
		namespace_id: blob.namespace ? blob.namespace.namespace_id : props.namespace.namespace_id,
		namespace_name: blob.namespace ? blob.namespace.name : props.namespace.name,
	}

	modalsStore.open("blob")
}
</script>

<template>
	<div :class="$style.wrapper_blobs">
		<table :class="$style.table">
			<thead>
				<tr>
					<th><Text size="12" weight="600" color="tertiary">Signer</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Time</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Share Commitments</Text></th>
					<th><Text size="12" weight="600" color="tertiary">Size</Text></th>
				</tr>
			</thead>

			<tbody>
				<tr v-for="blob in blobs" @click.stop="handleViewBlob(blob)" :key="blob.signer">
					<td>
						<Tooltip v-if="blob.signer" position="start" delay="500">
							<Flex align="center" gap="8">
								<AddressBadge :hash="blob.signer" />

								<CopyButton :text="blob.signer" />
							</Flex>

							<template #content>
								{{ blob.signer }}
							</template>
						</Tooltip>
						<Flex v-else align="center">
							<Text size="13" weight="600" color="secondary">Unknown</Text>
						</Flex>
					</td>
					<td>
						<Text size="13" weight="600" color="primary">
							{{ DateTime.fromISO(blob.time).setLocale("en").toFormat("ff") }}
						</Text>
					</td>
					<td>
						<Tooltip position="start" delay="500">
							<Flex align="center" gap="8">
								<Text class="rubik_font" size="13" weight="600" color="primary">
									{{ blob.commitment.slice(0, 4) }}
								</Text>

								<Flex align="center" gap="3">
									<div v-for="dot in 3" :key="dot" class="dot rubik_font" />
								</Flex>

								<Text class="rubik_font" size="13" weight="600" color="primary">
									{{ blob.commitment.slice(blob.commitment.length - 4, blob.commitment.length) }}
								</Text>

								<CopyButton :text="blob.commitment" />
							</Flex>

							<template #content>
								{{ blob.commitment }}
							</template>
						</Tooltip>
					</td>
					<td>
						<Text size="13" weight="600" color="primary">
							{{ formatBytes(blob.size) }}
						</Text>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style module>
.wrapper_blobs {
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
		padding-top: 10px;
		padding-bottom: 10px;
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
