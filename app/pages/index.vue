<script setup>
/** Components */
import RecentNamespacesTable from "@/components/data/RecentNamespacesTable.vue"
import LatestPFBTable from "@/components/data/LatestPFBTable.vue"
import BlocksTimelineTable from "@/components/data/BlocksTimeline/BlocksTimelineTable.vue"

/** API */
import { fetchLatestBlocks } from "@/services/api/block"

/** Services */
import { parseRedirectQueryError } from "@/services/notifications"

/** Store */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()

const route = useRoute()
const router = useRouter()

definePageMeta({
	layout: "default",
})

useExplorerSeo({
	title: () => "Nubit Explorer",
	description: () => "Explore Nubit blocks, transactions, addresses, validators and namespaces. Inspect data availability, blob activity and network fees.",
	image: "/img/seo/main.png",
})

onBeforeMount(async () => {
	if (Object.keys(route.query).length && route.query.error) {
		parseRedirectQueryError(route.query)
		router.replace({ query: null })
	}

	const data = await fetchLatestBlocks({ limit: 15 })
	appStore.latestBlocks = data || []
	appStore.isLatestBlocksLoaded = true
})
</script>

<template>
	<Flex direction="column" wide :class="$style.wrapper">
		<Flex direction="column" gap="40" :class="$style.main">
			<header>
				<Text as="h1" size="24" weight="600" color="primary">Nubit Explorer</Text>
				<p>Explore blocks, transactions and namespaces on the Nubit network.</p>
			</header>
			<Flex gap="20" :class="$style.small_tables">
				<LatestPFBTable />

				<RecentNamespacesTable />
			</Flex>

			<BlocksTimelineTable v-if="appStore.lastHead && appStore.latestBlocks.length" />
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);

	padding: 0 24px;
	margin-bottom: 120px;
}

.widgets {
	margin-top: 38px;
}

.main {
	margin-top: 38px;
}

.mainTitle {
	font-family: "Space Grotesk";
	font-weight: 600;
	font-size: 14px;
	color: #ffffff;
	line-height: 20px;
	text-align: left;
	font-style: normal;
	text-transform: none;
	margin-bottom: -25px;
}

@media (max-width: 1024px) {
	.small_tables {
		flex-direction: column;
	}
}

@media (max-width: 500px) {
	.widgets {
		margin-top: 24px;
	}

	.wrapper {
		padding: 0 12px;
	}
}
</style>
