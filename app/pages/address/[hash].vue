<script setup>
/** Components: Modules */
import AddressOverview from "@/components/modules/address/AddressOverview.vue"

/** Store */
import { useCacheStore } from "@/store/cache"
const cacheStore = useCacheStore()

const route = useRoute()

const address = await useExplorerResource(`/address/${encodeURIComponent(route.params.hash)}`, {})
cacheStore.current.address = address.value

defineOgImage("AddressImage", {
	title: "Address",
	address: address.value,
})

useExplorerSeo({
	title: () => `Address ${address.value?.hash} - Nubit Explorer`,
	description: () => `Address ${address.value?.hash} balance, transactions and other data.`,
	dynamicImage: true,
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
