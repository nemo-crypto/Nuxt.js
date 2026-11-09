<script setup>
/** UI */
import Button from "@/components/ui/Button.vue"
import Tooltip from "@/components/ui/Tooltip.vue"
import AmountInCurrency from "@/components/AmountInCurrency.vue"

/** Services */
import { comma } from "@/services/utils"

/** API */
import { fetchAddresses, fetchAddressesCount } from "@/services/api/address"

useExplorerSeo({
	title: () => "Addresses - Nubit Explorer",
	description: () => "Addresses in the Nubit Blockchain. Hash, balance, first height, last height are shown.",
	image: "/img/seo/addresses.png",
})

const route = useRoute()
const router = useRouter()

const isRefetching = ref(false)
const addresses = ref([])
const count = ref(0)

const getAddressesCount = async () => {
	const { data: addressesCount } = await fetchAddressesCount()
	count.value = addressesCount.value
}

await getAddressesCount()

const page = ref(route.query.page ? parseInt(route.query.page) : 1)
const pages = computed(() => Math.max(1, Math.ceil(count.value / 20)))
if (page.value > pages.value) throw createError({ statusCode: 404, statusMessage: "Page not found", fatal: true })

const getAddresses = async () => {
	isRefetching.value = true

	const { data } = await fetchAddresses({
		limit: 20,
		offset: (page.value - 1) * 20,
		sort: "desc",
	})
	addresses.value = data.value

	isRefetching.value = false
}

const calculateTotalBalance = (address) => {
	return parseInt(address.balance.spendable) + parseInt(address.balance.delegated) + parseInt(address.balance.unbonding)
}

await getAddresses()

/** Refetch addresses */
watch(
	() => page.value,
	async () => {
		getAddresses()

		router.replace({ query: { page: page.value } })
	},
)

const handlePrev = () => {
	if (page.value === 1) return

	page.value -= 1
}

const handleNext = () => {
	if (page.value === pages.value) return

	page.value += 1
}

const handleLast = async () => {
	await getAddressesCount()

	page.value = pages.value
}
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Breadcrumbs
			:items="[
				{ link: '/', name: 'Home' },
				{ link: '/addresses', name: `Addresses` },
			]"
			:class="$style.breadcrumbs"
		/>

		<Flex wide direction="column" gap="0">
			<Flex justify="between" :class="$style.header">
				<Flex align="center" gap="8">
					<!-- <Icon name="address" size="16" color="secondary" /> -->
					<Text as="h1" size="20" weight="600" color="primary">Addresses</Text>
				</Flex>

				<Flex align="center" gap="6">
					<Button @click="page = 1" type="secondary" size="mini" :disabled="page === 1">
						<Icon name="arrow-left-stop" size="12" color="primary" />
					</Button>
					<Button type="secondary" @click.prevent="handlePrev" size="mini" :disabled="page === 1" :link="!(page === 1) ? router.resolve({ query: { ...route.query, page: page - 1 } }).href : undefined" aria-label="Previous page">
						<Icon name="arrow-left" size="12" color="primary" />
					</Button>

					<Button type="secondary" size="mini" disabled>
						<Text class="openSans_font" size="12" weight="600" color="primary"> {{ comma(page) }} of {{ comma(pages) }} </Text>
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
								<th><Text size="12" weight="600" color="tertiary" noWrap>Hash</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Balance</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>First Height</Text></th>
								<th><Text size="12" weight="600" color="tertiary" noWrap>Last Height</Text></th>
							</tr>
						</thead>

						<tbody>
							<tr v-for="address in addresses" :key="address">
								<td style="width: 1px">
									<NuxtLink :to="`/address/${address.hash}`">
										<Flex align="center" gap="8">
											<Text class="rubik_font" size="13" weight="600" color="primary">{{ address.hash }}</Text>

											<CopyButton :text="address.hash" />
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/address/${address.hash}`">
										<AmountInCurrency
											:amount="{ value: calculateTotalBalance(address) }"
											:styles="{ amount: { size: '13' }, currency: { size: '13' } }"
										/>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/address/${address.hash}`">
										<Flex align="center">
											<Text class="rubik_font" size="13" weight="600" color="primary">
												{{ comma(address.first_height) }}
											</Text>
										</Flex>
									</NuxtLink>
								</td>
								<td>
									<NuxtLink :to="`/address/${address.hash}`">
										<Flex align="center">
											<Text class="rubik_font" size="13" weight="600" color="primary">
												{{ comma(address.last_height) }}
											</Text>
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

	padding: 40px 24px 60px 24px;
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
	border-radius: 0 0 0 8px;
	background: rgba(255, 255, 255, 0.1);
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
		gap: 16px;

		height: initial;

		padding: 16px;
	}
}
</style>
