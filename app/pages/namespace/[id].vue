<script setup>
/** Components: Modules */
import NamespaceOverview from "@/components/modules/namespace/NamespaceOverview.vue"
import NamespaceCharts from "@/components/modules/namespace/NamespaceCharts.vue"

/** Services */
import { getNamespaceID } from "@/services/utils"

/** Store */
import { useCacheStore } from "@/store/cache"
const cacheStore = useCacheStore()

const route = useRoute()

const namespace = await useExplorerResource(`/namespace/${encodeURIComponent(route.params.id)}`, { first: true })
cacheStore.current.namespace = namespace.value

defineOgImage("NamespaceImage", {
	title: "Namespace",
	namespace: namespace.value,
})

useExplorerSeo({
	title: () => `Namespace ${getNamespaceID(namespace.value?.namespace_id)} - Nubit Explorer`,
	description: () => `Namespace ${getNamespaceID(namespace.value?.namespace_id)} blobs, messages, metadata and other data.`,
	dynamicImage: true,
})

onBeforeRouteLeave(() => {
	cacheStore.current.namespace = null
})
</script>

<template>
	<Flex direction="column" gap="32" wide :class="$style.wrapper">
		<Flex direction="column" gap="16">
			<Breadcrumbs
				v-if="namespace"
				:items="[
					{ link: '/', name: 'Home' },
					{ link: '/namespaces', name: 'Namespaces' },
					{ link: route.fullPath, name: `${getNamespaceID(namespace.namespace_id)}` },
				]"
			/>

			<NamespaceOverview v-if="namespace" :namespace="namespace" />
		</Flex>

		<NamespaceCharts v-if="namespace" :id="namespace.namespace_id" />
	</Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);

	padding: 40px 24px 60px 24px;
}

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}
}
</style>
