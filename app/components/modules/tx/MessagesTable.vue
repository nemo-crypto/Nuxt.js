<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "~/components/ui/Button.vue"

/** Shared Components */
import MessageTypeBadge from "@/components/shared/MessageTypeBadge.vue"

/** Services */
import { comma, formatBytes } from "@/services/utils"

/** Store */
import { useModalsStore } from "@/store/modals"
import { useCacheStore } from "@/store/cache"
const modalsStore = useModalsStore()
const cacheStore = useCacheStore()

const router = useRouter()

const props = defineProps({
	messages: {
		type: Array,
		required: true,
	},
})

const handleViewRawMessage = (message) => {
	cacheStore.current._target = "message"
	cacheStore.current.message = message
	modalsStore.open("rawData")
}

// Pagination
const page = ref(1)
const itemsPerPage = 10
const pages = computed(() => Math.ceil(props.messages.length / itemsPerPage))
const messagesToShow = computed(() => {
	let start = (page.value - 1) * itemsPerPage;
	let end = start + itemsPerPage;
	return props.messages.slice(start, end); 
})
const handleNext = () => {
	if (page.value === pages.value) return
	page.value += 1
}
const handlePrev = () => {
	if (page.value === 1) return
	page.value -= 1
}
</script>

<template>
	<Flex direction="column" justify="between" :class="$style.data">
		<div :class="$style.wrapper_tx_messages">
			<table :class="$style.table">
				<thead>
					<tr>
						<th><Text size="12" weight="600" color="tertiary">Type</Text></th>
						<th><Text size="12" weight="600" color="tertiary">Time</Text></th>
						<th><Text size="12" weight="600" color="tertiary">Size</Text></th>
						<th><Text size="12" weight="600" color="tertiary">Block</Text></th>
					</tr>
				</thead>

				<tbody>
					<tr v-for="message in messagesToShow" :key="message.time" @click="handleViewRawMessage(message)">
						<td style="width: 1px">
							<Flex align="center">
								<MessageTypeBadge :types="[message.type]" />
							</Flex>
						</td>
						<td>
							<Flex align="center">
								<Text size="13" weight="600" color="primary">
									{{ DateTime.fromISO(message.time).toRelative({ locale: "en", style: "short" }) }}
								</Text>
							</Flex>
						</td>
						<td>
							<Flex align="center">
								<Text size="13" weight="600" color="primary">
									{{ formatBytes(message.size) }}
								</Text>
							</Flex>
						</td>
						<td>
							<Flex align="center">
								<Outline @click.stop="router.push(`/block/${message.height}`)">
									<Flex align="center" gap="6">
										<Icon name="block" size="14" color="yellowNew" />

										<Text class="rubik_font" size="13" weight="600" color="yellowNew" tabular>{{ comma(message.height) }}</Text>
									</Flex>
								</Outline>
							</Flex>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		<Flex v-if="messagesToShow.length && pages === 1" align="center" gap="6" :class="$style.pagination">
			<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
				<Icon name="arrow-left-stop" size="12" color="primary" />
			</Button>
			<Button type="secondary" @click="handlePrev" size="mini" :disabled="page === 1">
				<Icon name="arrow-left" size="12" color="primary" />
			</Button>

			<Button type="secondary" size="mini" disabled>
				<Text class="openSans_font" size="12" weight="600" color="primary"> {{ page }} of {{ pages }} </Text>
			</Button>

			<Button @click="handleNext" type="secondary" size="mini" :disabled="page === pages">
				<Icon name="arrow-right" size="12" color="primary" />
			</Button>
			<Button @click="page = pages" type="secondary" size="mini" :disabled="page === pages">
				<Icon name="arrow-right-stop" size="12" color="primary" />
			</Button>
		</Flex>
	</Flex>
</template>

<style module>
.data {
	min-width: 100%;
	height: 100%;
	overflow-x: auto;
}

.wrapper_tx_messages {
	min-width: 100%;
	width: 0;
	height: 100%;

	overflow-x: auto;

	& .table {
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
			padding-right: 24px;
			padding-top: 7px;
			padding-bottom: 7px;

			white-space: nowrap;

			&:first-child {
				padding-left: 16px;
			}
		}
	}
}

.pagination {
	padding: 0 16px 16px 16px;
}
</style>