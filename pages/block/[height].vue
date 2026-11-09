<script setup>
/** Components: Modules */
import BlockOverview from "@/components/modules/block/BlockOverview.vue"
import BlobsTable from "@/components/modules/block/BlobsTable.vue"

/** Services */
import { comma } from "@/services/utils"

/** API */
import { fetchBlockByHeight } from "@/services/api/block"

/** Store */
import { useCacheStore } from "@/store/cache"
const cacheStore = useCacheStore()

const route = useRoute()

const block = ref()
const { data: rawBlock } = await fetchBlockByHeight(route.params.height)

if (!rawBlock.value) {
	navigateTo({
		path: "/",
		query: {
			error: "not_found",
			target: "block",
			id: route.params.height,
		},
	})
} else {
	block.value = rawBlock.value
	cacheStore.current.block = block.value
}

defineOgImage("BlockImage", {
	title: "Block",
	block: block.value,
})

useHead({
	title: `Block ${comma(block.value?.height)} - Nubit Explorer`,
	link: [
		{
			rel: "canonical",
			href: `https://www.explorer.nubit.org${route.path}`,
		},
	],
	meta: [
		{
			name: "description",
			content: `Nubit Block Height ${block.value?.height}. The timestamp, hash, proposer, metadata, gas used and transactions in the block.`,
		},
		{
			name: "keywords",
			content:
				"Nubit, Bitcoin, Data Availability, Data Availability Layer, DA, Data Layer, Secured by Bitcoin, Polychain, Bitcoin DA, BTC DA, Scalable Blockchain, Secure Blockchain, Blockchain Innovation, Bitcoin Security, Data Infrastructure, Cryptocurrency, Blockchain Technology, Bitcoin Ecosystem, Data Scalability,  Blockchain Development, Polychain Capital",
		},
		{
			property: "og:title",
			content: `Block ${comma(block.value?.height)} - Nubit Explorer`,
		},
		{
			property: "og:description",
			content: `Nubit Block Height ${block.value?.height}. The timestamp, hash, proposer, metadata, gas used and transactions in the block.`,
		},
		{
			name: "twitter:title",
			content: `Block ${comma(block.value?.height)} - Nubit Explorer`,
		},
		{
			name: "twitter:description",
			content: `Nubit Block Height ${block.value?.height}. The timestamp, hash, proposer, metadata, gas used and transactions in the block.`,
		}
	],
})
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Breadcrumbs
			v-if="block"
			:items="[
				{ link: '/', name: 'Home' },
				{ link: '/blocks', name: 'Blocks' },
				{ link: route.fullPath, name: `Block ${comma(block.height)}` },
			]"
			:class="$style.breadcrumbs"
		/>

		<Flex v-if="block" direction="column" gap="40">
			<BlockOverview :block="block" />

			<BlobsTable :height="block.height" description="This height does not contain blobs" />
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
