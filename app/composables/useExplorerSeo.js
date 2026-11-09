import { SITE_NAME, getSeoPolicy, serializeJsonLd } from "#shared/utils/seo.js"

export function useExplorerSeo({ title, description, image = "/img/seo/main.png", dynamicImage = false, noindex = false }) {
	const route = useRoute()
	const site = useSiteConfig()
	const policy = computed(() => getSeoPolicy(site.url, route.path, route.query, noindex ? false : site.indexable))
	const pageTitle = computed(() => `${toValue(title)}${policy.value.page > 1 ? ` · Page ${policy.value.page}` : ""}`)
	const imageUrl = computed(() => new URL(toValue(image), site.url).href)
	useSeoMeta({
		title: () => pageTitle.value,
		description: () => toValue(description),
		robots: () => policy.value.robots,
		ogTitle: () => pageTitle.value,
		ogDescription: () => toValue(description),
		ogUrl: () => policy.value.canonical,
		ogType: "website",
		ogSiteName: SITE_NAME,
		ogLocale: "en_US",
		twitterCard: "summary_large_image",
		twitterTitle: () => pageTitle.value,
		twitterDescription: () => toValue(description),
		...(!dynamicImage ? { ogImage: () => imageUrl.value, twitterImage: () => imageUrl.value, ogImageAlt: () => pageTitle.value } : {}),
	})
	useHead(() => ({
		link: [{ key: "canonical", rel: "canonical", href: policy.value.canonical }],
		script: policy.value.noindex ? [] : [{
			key: "page-schema",
			type: "application/ld+json",
			innerHTML: serializeJsonLd({
				"@context": "https://schema.org",
				"@graph": [
					{ "@type": "WebSite", "@id": `${new URL("/", site.url).href}#website`, url: new URL("/", site.url).href, name: SITE_NAME, inLanguage: "en" },
					{ "@type": "WebPage", "@id": `${policy.value.canonical}#webpage`, url: policy.value.canonical, name: pageTitle.value, description: toValue(description), inLanguage: "en", isPartOf: { "@id": `${new URL("/", site.url).href}#website` } },
				],
			}),
		}],
	}))
	return { policy }
}
