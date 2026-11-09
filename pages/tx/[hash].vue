<script setup>
/** Components: Modules */
import TxOverview from "@/components/modules/tx/TxOverview.vue"
import BlobsTable from "@/components/modules/block/BlobsTable.vue"

/** API */
import { fetchTxByHash } from "@/services/api/tx"

/** Store */
import { useCacheStore } from "@/store/cache"
const cacheStore = useCacheStore()

const route = useRoute()
const router = useRouter()

const tx = ref()
const { data: rawTx } = await fetchTxByHash(route.params.hash)
if (!rawTx.value) {
	router.push("/")
} else {
	tx.value = rawTx.value
	cacheStore.current.transaction = tx.value
}

defineOgImage("TxImage", {
	title: "Tx",
	tx: tx.value,
})

useHead({
	title: `Transaction ${tx.value?.hash.toUpperCase().slice(0, 4)} ••• ${tx.value?.hash.toUpperCase().slice(-4)} - Nubit Explorer`,
	link: [
		{
			rel: "canonical",
			href: `https://www.explorer.nubit.org${route.path}`,
		},
	],
	meta: [
		{
			name: "description",
			content: `Nubit Transaction ${tx.value?.hash.toUpperCase().slice(0, 4)} ••• ${tx.value?.hash
				.toUpperCase()
				.slice(-4)}. The timestamp, hash, events, messages, metadata, gas used.`,
		},
		{
			name: "keywords",
			content:
				"Nubit, Bitcoin, Data Availability, Data Availability Layer, DA, Data Layer, Secured by Bitcoin, Polychain, Bitcoin DA, BTC DA, Scalable Blockchain, Secure Blockchain, Blockchain Innovation, Bitcoin Security, Data Infrastructure, Cryptocurrency, Blockchain Technology, Bitcoin Ecosystem, Data Scalability,  Blockchain Development, Polychain Capital",
		},
		{
			property: "og:title",
			content: `Transaction ${tx.value?.hash.toUpperCase().slice(0, 4)} ••• ${tx.value?.hash
				.toUpperCase()
				.slice(-4)} - Nubit Explorer`,
		},
		{
			property: "og:description",
			content: `Nubit Transaction ${tx.value?.hash.toUpperCase().slice(0, 4)} ••• ${tx.value?.hash
				.toUpperCase()
				.slice(-4)}. The timestamp, hash, events, messages, metadata, gas used.`,
		},
		{
			name: "twitter:title",
			content: `Transaction ${tx.value?.hash.toUpperCase().slice(0, 4)} ••• ${tx.value?.hash
				.toUpperCase()
				.slice(-4)} - Nubit Explorer`,
		},
		{
			name: "twitter:description",
			content: `Nubit Transaction ${tx.value?.hash.toUpperCase().slice(0, 4)} ••• ${tx.value?.hash
				.toUpperCase()
				.slice(-4)}. The timestamp, hash, events, messages, metadata, gas used.`,
		}
	],
})
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Breadcrumbs
			v-if="tx"
			:items="[
				{ link: '/', name: 'Home' },
				{ link: '/txs', name: 'Transactions' },
				{
					link: route.fullPath,
					name: `${tx.hash.toUpperCase().slice(0, 4)} ••• ${tx.hash.toUpperCase().slice(-4)}`,
				},
			]"
			:class="$style.breadcrumbs"
		/>

		<Flex v-if="tx" direction="column" gap="40">
			<TxOverview :tx="tx" />

			<BlobsTable :hash="tx.hash" description="This transaction does not contain any blobs" />
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

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}
}
</style>
