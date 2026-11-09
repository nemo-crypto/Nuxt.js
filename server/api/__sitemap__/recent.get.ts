// 仅抓取最近 100 个区块和交易，缓存 5 分钟，不扫描整条链。
export default defineCachedEventHandler(async (event) => {
	const base = useRuntimeConfig(event).public.apiBase.replace(/\/$/, "")
	const results = await Promise.allSettled([
		$fetch<unknown>(`${base}/block`, { query: { limit: 100, sort: "desc" }, timeout: 5000, retry: 0 }),
		$fetch<unknown>(`${base}/tx`, { query: { limit: 100, sort: "desc" }, timeout: 5000, retry: 0 }),
	])
	return results.flatMap((result, index) => {
		if (result.status !== "fulfilled" || !Array.isArray(result.value)) return []
		return result.value.slice(0, 100).flatMap((row) => {
			if (!row || typeof row !== "object") return []
			const id = index === 0 ? String(row.height ?? "") : String(row.hash ?? "")
			if (!(index === 0 ? /^[1-9]\d*$/.test(id) : /^[a-f\d]{64}$/i.test(id))) return []
			// 不把请求时间当作 lastmod；详情可能补充索引数据，链时间也不等于页面更新时间。
			return [{ loc: `/${index === 0 ? "block" : "tx"}/${id}` }]
		})
	})
}, { maxAge: 300, swr: true })
