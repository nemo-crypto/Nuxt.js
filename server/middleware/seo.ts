import { getSeoPolicy } from "#shared/utils/seo.js"

export default defineEventHandler((event) => {
	const path = getRequestURL(event).pathname
	if (/^\/(?:api|_nuxt|_og|__nuxt)(?:\/|$)/.test(path) || /\.[a-z0-9]+$/i.test(path)) return
	const site = getSiteConfig(event)
	const policy = getSeoPolicy(site.url, path, getQuery(event), site.indexable)
	if (policy.noindex) setHeader(event, "X-Robots-Tag", policy.robots)
})
