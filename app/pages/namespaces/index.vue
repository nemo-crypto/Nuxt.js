<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"

/** Services */
import { space, formatBytes, comma, getNamespaceID } from "@/services/utils"

/** API */
import { fetchNamespaces, fetchNamespacesCount } from "@/services/api/namespace"

useExplorerSeo({
	title: () => "Namespaces - Nubit Explorer",
	description: () => "Namespaces in the Nubit Blockchain. Namespace ID, size, version, Submit Blob Payment are shown.",
	image: "/img/seo/namespaces.png",
})

const route = useRoute()
const router = useRouter()

const isRefetching = ref(false)
const namespaces = ref([])
const count = ref(0)

const sort = reactive({
	by: "time",
	dir: "desc",
})

const getNamespacesCount = async () => {
	const { data: namespacesCount } = await fetchNamespacesCount()
	count.value = namespacesCount.value
}

await getNamespacesCount()

const page = ref(route.query.page ? parseInt(route.query.page) : 1)
const pages = computed(() => Math.max(1, Math.ceil(count.value / 20)))
if (page.value > pages.value) throw createError({ statusCode: 404, statusMessage: "Page not found", fatal: true })

const getNamespaces = async () => {
	isRefetching.value = true

	const { data } = await fetchNamespaces({
		limit: 20,
		offset: (page.value - 1) * 20,
		sort: sort.dir,
		sort_by: sort.by,
	})
	namespaces.value = data.value

	isRefetching.value = false
}

await getNamespaces()

/** Refetch namespaces */
watch(
	() => page.value,
	async () => {
		getNamespaces()

		router.replace({ query: { page: page.value } })
	},
)

const handleSort = (by) => {
	switch (sort.dir) {
		case "desc":
			if (sort.by == by) sort.dir = "asc"
			break

		case "asc":
			sort.dir = "desc"

			break
	}

	sort.by = by

	getNamespaces()
}

const handlePrev = () => {
	if (page.value === 1) return

	page.value -= 1
}

const handleNext = () => {
	if (page.value === pages.value) return

	page.value += 1
}

const handleLast = async () => {
	await getNamespacesCount()

	page.value = pages.value
}
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Flex align="end" justify="between" :class="$style.breadcrumbs">
			<Breadcrumbs
				:items="[
					{ link: '/', name: 'Home' },
					{ link: '/namespaces', name: `Namespaces` },
				]"
			/>
		</Flex>

		<Flex wide direction="column" gap="0">
			<Flex justify="between" :class="$style.header">
				<Flex align="center" gap="8">
					<Text as="h1" size="20" weight="600" color="primary">Namespaces</Text>
				</Flex>

				<Flex align="center" gap="6">
					<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
						<Icon name="arrow-left-stop" size="12" color="primary" />
					</Button>
					<Button type="secondary" @click.prevent="handlePrev" size="mini" :disabled="page === 1" :link="!(page === 1) ? router.resolve({ query: { ...route.query, page: page - 1 } }).href : undefined" aria-label="Previous page">
						<Icon name="arrow-left" size="12" color="primary" />
					</Button>

					<Button type="secondary" size="mini" disabled>
						<Text class="openSans_font" size="12" weight="600" color="primary"> {{ page }} of {{ pages }} </Text>
					</Button>

					<Button @click.prevent="handleNext" type="secondary" size="mini" :disabled="page === pages" :link="!(page === pages) ? router.resolve({ query: { ...route.query, page: page + 1 } }).href : undefined" aria-label="Next page">
						<Icon name="arrow-right" size="12" color="primary" />
					</Button>
					<Button @click="handleLast" type="secondary" size="mini" :disabled="page === pages">
						<Icon name="arrow-right-stop" size="12" color="primary" />
					</Button>
				</Flex>
			</Flex>

			<Flex direction="column" gap="16" wide :class="[$style.table, isRefetching && $style.disabled]">
				<div :class="$style.table_scroller">
					<table>
						<thead>
							<tr>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Namespace ID</Text></th>
								<th @click="handleSort('time')" :class="$style.sortable">
									<Flex align="center" gap="6">
										<Text size="12" weight="600" color="tertiary" noWrap>Time</Text>
										<Icon
											v-if="sort.by === 'time'"
											name="chevron"
											size="12"
											color="secondary"
											:style="{ transform: `rotate(${sort.dir === 'asc' ? '180' : '0'}deg)` }"
										/>
									</Flex>
								</th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Height</Text></th>
								<th @click="handleSort('size')" :class="$style.sortable">
									<Flex align="center" gap="6">
										<Text size="12" weight="600" color="tertiary" noWrap>Size</Text>
										<Icon
											v-if="sort.by === 'size'"
											name="chevron"
											size="12"
											color="secondary"
											:style="{ transform: `rotate(${sort.dir === 'asc' ? '180' : '0'}deg)` }"
										/>
									</Flex>
								</th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Version</Text></th>
								<th @click="handleSort('pfb_count')" :class="$style.sortable">
									<Flex align="center" gap="6">
										<Text size="12" weight="600" color="tertiary" noWrap>Submit Blob Payment</Text>
										<Icon
											v-if="sort.by === 'pfb_count'"
											name="chevron"
											size="12"
											color="secondary"
											:style="{ transform: `rotate(${sort.dir === 'asc' ? '180' : '0'}deg)` }"
										/>
									</Flex>
								</th>
							</tr>
						</thead>

						<tbody>
							<tr v-for="ns in namespaces" :key="ns">
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

																<Flex class="rubik_font" align="center" gap="3">
																	<div v-for="dot in 3" :key="dot" class="dot" />
																</Flex>

																<Text class="rubik_font" size="12" weight="600" color="primary" mono>
																	{{ getNamespaceID(ns.namespace_id).slice(-4) }}
																</Text>

																<CopyButton :text="getNamespaceID(ns.namespace_id)" size="16" />
															</Flex>

															<Flex v-else align="center" gap="8">
																<Text size="12" weight="600" color="primary" mono>
																	{{ space(getNamespaceID(ns.namespace_id)) }}
																</Text>

																<CopyButton :text="getNamespaceID(ns.namespace_id)" />
															</Flex>

															<Text
																v-if="ns.name !== getNamespaceID(ns.namespace_id)"
																size="12"
																weight="500"
																color="tertiary"
																class="rubik_font"
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
													<span class="rubik_font">{{ space(getNamespaceID(ns.namespace_id)) }}</span>
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
											<Outline @click.prevent="router.push(`/block/${ns.last_height}`)">
												<Flex align="center" gap="6">
													<Icon name="block" size="14" color="yellowNew" />

													<Text class="rubik_font" size="13" weight="600" color="yellowNew" tabular>{{
														comma(ns.last_height)
													}}</Text>
												</Flex>
											</Outline>
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
											<Text size="13" weight="600" color="primary">{{ ns.version }}</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/namespace/${ns.namespace_id}`">
										<Flex align="center">
											<Text size="13" weight="600" color="primary">{{ comma(ns.pfb_count) }}</Text>
										</Flex>
									</NuxtLink>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);

	padding: 26px 24px 60px 24px;
}

.breadcrumbs {
	margin-bottom: 16px;
}

.header {
	border-radius: 8px 8px 0 0;
	background: rgba(255, 255, 255, 0.1);
	padding: 20px;
}

.table_scroller {
	overflow-x: auto;
}

.table {
	border-radius: 0 0 8px 8px;
	background: rgba(255, 255, 255, 0.1);
	padding-bottom: 12px;
	padding: 0 20px 20px 20px;
	transition: all 0.2s ease;

	& table {
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

			& span {
				display: flex;
			}

			&:first-child {
				padding-left: 16px;
			}

			&.sortable {
				cursor: pointer;
			}

			&.sortable:hover {
				& span {
					color: var(--txt-secondary);
				}
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

				min-height: 44px;

				padding-right: 24px;
			}
		}
	}
}

.table.disabled {
	opacity: 0.5;
	pointer-events: none;
}

.message_type {
	max-width: 100px;
	text-overflow: ellipsis;
	overflow: hidden;
}

.badge {
	border-radius: 5px;
	background: var(--op-5);
	box-shadow: inset 0 0 0 1px var(--op-10);

	padding: 4px 6px;
}

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}

	.header {
		flex-direction: column;
		gap: 16px;

		height: initial;

		padding: 16px;
	}
}
</style>
