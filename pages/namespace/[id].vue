<script setup>
/** Components: Modules */
import NamespaceOverview from "@/components/modules/namespace/NamespaceOverview.vue"
import NamespaceCharts from "@/components/modules/namespace/NamespaceCharts.vue"

/** Services */
import { getNamespaceID } from "@/services/utils"

/** API */
import { fetchNamespaceByID } from "@/services/api/namespace"

/** Store */
import { useCacheStore } from "@/store/cache"
const cacheStore = useCacheStore()

const route = useRoute()
const router = useRouter()

const namespace = ref()
	
const { data: rawNamespace } = await fetchNamespaceByID(route.params.id)

if (!rawNamespace.value) {
	Ïrouter.push("/")
} else {
	namespace.value = rawNamespace.value[0]
	cacheStore.current.namespace = namespace.value
}

defineOgImage("NamespaceImage", {
	title: "Namespace",
	namespace: namespace.value,
})

useHead({
	title: `Namespace ${getNamespaceID(namespace.value?.namespace_id)} - Nubit Explorer`,
	link: [
		{
			rel: "canonical",
			href: `https://www.explorer.nubit.org${route.path}`,
		},
	],
	meta: [
		{
			name: "description",
			content: `Namespace ${getNamespaceID(namespace.value?.namespace_id)} blobs, messages, metadata and other data.`,
		},
		{
			name: "keywords",
			content:
				"Nubit, Bitcoin, Data Availability, Data Availability Layer, DA, Data Layer, Secured by Bitcoin, Polychain, Bitcoin DA, BTC DA, Scalable Blockchain, Secure Blockchain, Blockchain Innovation, Bitcoin Security, Data Infrastructure, Cryptocurrency, Blockchain Technology, Bitcoin Ecosystem, Data Scalability,  Blockchain Development, Polychain Capital",
		},
		{
			property: "og:title",
			content: `Namespace ${getNamespaceID(namespace.value?.namespace_id)} - Nubit Explorer`,
		},
		{
			property: "og:description",
			content: `Namespace ${getNamespaceID(namespace.value?.namespace_id)} blobs, messages, metadata and other data.`,
		},
		{
			name: "twitter:title",
			content: `Namespace ${getNamespaceID(namespace.value?.namespace_id)} - Nubit Explorer`,
		},
		{
			name: "twitter:description",
			content: `Namespace ${getNamespaceID(namespace.value?.namespace_id)} blobs, messages, metadata and other data.`,
		}
	],
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
