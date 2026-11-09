export default defineEventHandler((event) => {
	const site = getSiteConfig(event)
	setHeader(event, "Content-Type", "text/plain; charset=utf-8")
	if (site.indexable === false) return "User-agent: *\nDisallow: /\n"
	// 允许抓取 noindex 页面，让搜索引擎能读到 noindex 指令。
	return `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${new URL("/sitemap.xml", site.url).href}\n`
})
