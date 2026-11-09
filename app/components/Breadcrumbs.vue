<script setup>
import { serializeJsonLd, getSeoPolicy } from "#shared/utils/seo.js"
const props = defineProps({
	items: {
		type: Array,
		required: true,
	},
})
const site = useSiteConfig()
const route = useRoute()
useHead(() => ({
	script: getSeoPolicy(site.url, route.path, route.query, site.indexable).noindex ? [] : [{
		key: "breadcrumb-schema",
		type: "application/ld+json",
		innerHTML: serializeJsonLd({
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			itemListElement: props.items.map((item, index) => ({
				"@type": "ListItem",
				position: index + 1,
				name: item.name,
				item: new URL(item.link.split(/[?#]/)[0], site.url).href,
			})),
		}),
	}],
}))
</script>

<template>
	<Flex tag="nav" aria-label="Breadcrumb" align="center" gap="6" :class="$style.items">
		<Flex v-for="(item, idx) in items" :key="idx" align="center" gap="6" :class="$style.item">
			<NuxtLink :to="item.link" :aria-current="idx === items.length - 1 ? 'page' : undefined">
				<Text class="animate__animated animate__fadeInLeft" size="14" weight="600" :color="idx < items.length - 1 ? 'secondary' : 'primary'">{{ item.name }}</Text>
			</NuxtLink>
			<img alt="" class="animate__animated animate__fadeInLeft" v-if="idx < items.length - 1" width="14" height="14" src="/img/breadcrumbsRigth.png" />
		</Flex>
	</Flex>
</template>

<style module>
.items {
	overflow: hidden;
}

.item {
	& a {
		display: flex;
		font-style: italic;

		&:hover {
			& span {
				color: var(--txt-primary);
			}
		}
	}
}
</style>
