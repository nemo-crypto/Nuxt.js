<script setup>
/** Components: Modules */
import BlockOverview from "@/components/modules/block/BlockOverview.vue"
import BlobsTable from "@/components/modules/block/BlobsTable.vue"

/** Services */
import { comma } from "@/services/utils"

/** Store */
import { useCacheStore } from "@/store/cache"
const cacheStore = useCacheStore()

const route = useRoute()

const block = await useExplorerResource(`/block/${encodeURIComponent(route.params.height)}`, { query: { stats: true } })
cacheStore.current.block = block.value

defineOgImage("BlockImage", {
	title: "Block",
	block: block.value,
})

useExplorerSeo({
	title: () => `Block ${comma(block.value?.height)} - Nubit Explorer`,
	description: () => `Nubit Block Height ${block.value?.height}. The timestamp, hash, proposer, metadata, gas used and transactions in the block.`,
	dynamicImage: true,
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
