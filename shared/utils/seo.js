export const SITE_NAME = "Nubit Explorer"
export const PRIVATE_PATHS = new Set(["/bookmarks", "/namespaces/treemap"])
const TRACKING_PARAM = /^(utm_.+|gclid|dclid|fbclid|msclkid)$/i

export function getSeoPolicy(siteUrl, path, query = {}, indexable = true) {
	const origin = new URL(siteUrl).origin
	const pathname = `/${String(path).split(/[?#]/)[0].replace(/^\/+|\/+$/g, "")}`
	const canonical = new URL(origin)
	canonical.pathname = pathname
	let filtered = false
	let page = 1
	for (const key of Object.keys(query).sort()) {
		if (TRACKING_PARAM.test(key)) continue
		const value = query[key]
		if (key === "page" && !Array.isArray(value) && /^[1-9]\d*$/.test(String(value)) && Number.isSafeInteger(Number(value))) {
			page = Number(value)
			if (page > 1) canonical.searchParams.set(key, String(page))
			continue
		}
		filtered = true
		for (const item of Array.isArray(value) ? value : [value]) canonical.searchParams.append(key, String(item ?? ""))
	}
	const noindex = indexable === false || indexable === "false" || PRIVATE_PATHS.has(pathname) || filtered
	return { canonical: canonical.href, page, noindex, robots: noindex ? "noindex, follow" : "index, follow, max-image-preview:large" }
}

// 防止链上文本中的 HTML 结束标记逃逸 JSON-LD script。
export function serializeJsonLd(value) {
	return JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029")
}

export function getResourceStatus(data, error) {
	if (error) return Number(error.statusCode || error.status) === 404 ? 404 : 503
	return data == null || (Array.isArray(data) && data.length === 0) ? 404 : 200
}
