<script setup>
/** Components: Modules */
import AddressOverview from "@/components/modules/address/AddressOverview.vue"

/** API */
import { fetchAddressByHash } from "@/services/api/address"

/** Store */
import { useCacheStore } from "@/store/cache"
const cacheStore = useCacheStore()

const route = useRoute()
const router = useRouter()

const address = ref()
const { data: rawAddress } = await fetchAddressByHash(route.params.hash)

if (!rawAddress.value) {
	router.push("/")
} else {
	address.value = rawAddress.value
	cacheStore.current.address = address.value
}

defineOgImage("AddressImage", {
	title: "Address",
	address: address.value,
})

useHead({
	title: `Address ${address.value?.hash} - Nubit Explorer`,
	link: [
		{
			rel: "canonical",
			href: `https://www.explorer.nubit.org${route.path}`,
		},
	],
	meta: [
		{
			name: "description",
			content: `Address ${address.value?.hash} balance, transactions and other data.`,
		},
		{
			name: "keywords",
			content:
				"Nubit, Bitcoin, Data Availability, Data Availability Layer, DA, Data Layer, Secured by Bitcoin, Polychain, Bitcoin DA, BTC DA, Scalable Blockchain, Secure Blockchain, Blockchain Innovation, Bitcoin Security, Data Infrastructure, Cryptocurrency, Blockchain Technology, Bitcoin Ecosystem, Data Scalability,  Blockchain Development, Polychain Capital",
		},
		{
			property: "og:title",
			content: `Address ${address.value?.hash} - Nubit Explorer`,
		},
		{
			property: "og:description",
			content: `Address ${address.value?.hash} balance, transactions and other data.`,
		},
		{
			name: "twitter:title",
			content: `Address ${address.value?.hash} - Nubit Explorer`,
		},
		{
			name: "twitter:description",
			content: `Address ${address.value?.hash} balance, transactions and other data.`,
		}
	],
})

onBeforeRouteLeave(() => {
	cacheStore.current.address = null
})
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Breadcrumbs
			v-if="address"
			:items="[
				{ link: '/', name: 'Home' },
				{ link: '/addresses', name: 'Addresses' },
				{ link: route.fullPath, name: `${address.hash}` },
			]"
			:class="$style.breadcrumbs"
		/>

		<AddressOverview v-if="address" :address="address" />
	</Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);

	padding: 60px 24px;
}

.breadcrumbs {
	margin-bottom: 16px;
}

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}
}
</style>
