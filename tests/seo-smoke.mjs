import assert from "node:assert/strict"
import { createServer } from "node:http"
import { spawn } from "node:child_process"
import { once } from "node:events"
import { randomBytes } from "node:crypto"

const site = "https://seo-test.example.com"
const block = { height: 123, message_types: [], hash: "ab".repeat(32), time: "2026-11-09T00:00:00Z", proposer: {moniker: "SEO fixture validator", cons_address: "nubitvalcons1234567890"}, stats: {block_time: 1000, bytes_in_block: 128, blobs_count: 0, blobs_size: 0, events_count: 0, fee: "0", tx_count: 0} }
const requests = []
const api = createServer((req, res) => {
	const url = new URL(req.url, "http://localhost")
	requests.push(url.pathname + url.search)
	res.setHeader("Content-Type", "application/json")
	if (url.pathname.endsWith("/missing")) { res.statusCode = 404; return res.end('{"message":"Not found"}') }
	if (url.pathname.endsWith("/unavailable")) { res.statusCode = 500; return res.end('{"message":"Temporary upstream failure"}') }
	if (url.pathname.endsWith("/namespace/empty")) return res.end("[]")
	if (url.pathname.endsWith("/block/123")) return res.end(JSON.stringify(block))
	if (url.pathname.endsWith("/block/count")) return res.end("40")
	if (url.pathname.endsWith("/block")) return res.end(JSON.stringify([block]))
	if (url.pathname.endsWith("/validators/count")) return res.end('{"active":0,"inactive":0,"jailed":0}')
	if (url.pathname.endsWith("/count")) return res.end("0")
	res.end("[]")
})
api.listen(0, "127.0.0.1")
await once(api, "listening")
const apiBase = `http://127.0.0.1:${api.address().port}/v1`

async function startApp(indexable) {
	const child = spawn(process.execPath, [".output/server/index.mjs"], {
		env: { ...process.env, HOST: "127.0.0.1", PORT: "0", NUXT_SITE_URL: site, NUXT_SITE_INDEXABLE: String(indexable), NUXT_PUBLIC_API_BASE: apiBase, NUXT_APP_SECRET: randomBytes(32).toString("hex") },
		stdio: ["ignore", "pipe", "pipe"],
	})
	let logs = ""
	child.stderr.on("data", data => { logs += data })
	const base = await new Promise((resolve, reject) => {
		const timeout = setTimeout(() => { child.kill(); reject(new Error(`SSR startup timeout: ${logs}`)) }, 15000)
		child.stdout.on("data", data => {
			logs += data
			const match = logs.match(/Listening on (http:\/\/[^\s]+)/)
			if (match) { clearTimeout(timeout); resolve(match[1]) }
		})
		child.once("error", reject)
		child.once("exit", code => { clearTimeout(timeout); reject(new Error(`SSR exited ${code}: ${logs}`)) })
	})
	return { base, child, logs: () => logs }
}
async function stopApp(app) {
	app.child.kill("SIGTERM")
	await once(app.child, "exit")
}
async function get(app, path, status = 200) {
	const res = await fetch(app.base + path, { signal: AbortSignal.timeout(15000), redirect: "manual" })
	const body = await res.text()
	assert.equal(res.status, status, `${path}: ${body.slice(0, 300)}\n${app.logs()}`)
	return { res, body }
}
function meta(html, name) {
	return [...html.matchAll(/<meta\b[^>]*>/g)].find(([tag]) => tag.includes(`name="${name}"`) || tag.includes(`property="${name}"`))?.[0]
}
function canonical(html) {
	const links = [...html.matchAll(/<link\b[^>]*rel="canonical"[^>]*>/g)]
	assert.equal(links.length, 1, "one canonical per page")
	return links[0][0].match(/href="([^"]+)"/)[1].replaceAll("&amp;", "&")
}
let app
try {
	app = await startApp(true)
	const home = (await get(app, "/?utm_source=test")).body
	assert.equal(canonical(home), `${site}/`)
	assert.equal(home.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<[^>]*>/g, "").trim(), "Nubit Explorer")
	assert.match(meta(home, "og:image"), new RegExp(`${site}/img/seo/main.png`))
	assert.match(meta(home, "twitter:card"), /summary_large_image/)
	const schemas = [...home.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map(match => JSON.parse(match[1]))
	assert.ok(schemas.some(schema => schema["@graph"]?.some(node => node["@type"] === "WebSite")))
	assert.ok(!home.includes('name="keywords"'))
	const blocks = (await get(app, "/blocks?page=2&utm_source=test")).body
	assert.equal(canonical(blocks), `${site}/blocks?page=2`)
	assert.ok(blocks.includes("Page 2"), "pagination title")
	assert.ok(blocks.includes("SEO fixture validator"), "block row must be present in SSR HTML")
	assert.match(blocks, /href="[^"]*page=1/)
	assert.ok(requests.some(path => path.includes("offset=20")))
	const detail = (await get(app, "/block/123")).body
	assert.equal(canonical(detail), `${site}/block/123`)
	assert.equal([...detail.matchAll(/<h1\b/g)].length, 1, "one main heading per detail")
	assert.ok(detail.includes('"@type":"BreadcrumbList"'), "detail breadcrumb schema")
	const ogUrl = meta(detail, "og:image")?.match(/content="([^"]+)"/)?.[1].replaceAll("&amp;", "&")
	assert.ok(ogUrl, "detail OG URL")
	const og = await fetch(app.base + new URL(ogUrl).pathname, {signal: AbortSignal.timeout(25000)})
	assert.equal(og.status, 200, "detail OG rendering")
	assert.equal(og.headers.get("content-type"), "image/png")
	assert.equal(Buffer.from(await og.arrayBuffer()).subarray(0,8).toString("hex"), "89504e470d0a1a0a")
	const txs = await get(app, "/txs?status=failed&utm_source=test")
	assert.match(txs.res.headers.get("x-robots-tag"), /noindex/)
	assert.match(meta(txs.body, "robots"), /noindex/)
	const bookmarks = await get(app, "/bookmarks")
	assert.match(bookmarks.res.headers.get("x-robots-tag"), /noindex/)
	assert.match(meta(bookmarks.body, "robots"), /noindex/)
	const sitemap = (await get(app, "/sitemap.xml")).body
	assert.ok(sitemap.includes(`${site}/blocks`))
	assert.ok(sitemap.includes(`${site}/block/123`))
	assert.ok(!sitemap.includes("/bookmarks") && !sitemap.includes("/namespaces/treemap"))
	assert.match((await get(app, "/robots.txt")).body, new RegExp(`Sitemap: ${site}/sitemap.xml`))
	for (const resource of ["block", "tx", "address", "validator", "namespace"]) {
		const missing = await get(app, `/${resource}/missing`, 404)
		assert.match(missing.res.headers.get("x-robots-tag"), /noindex/)
		const unavailable = await get(app, `/${resource}/unavailable`, 503)
		assert.equal(unavailable.res.headers.get("retry-after"), "60")
	}
	await get(app, "/namespace/empty", 404)
	await get(app, "/blocks?page=-1", 404)
	await get(app, "/blocks?page=3", 404)
	await get(app, "/txs?page=2", 404)
	assert.match((await get(app, "/this-page-does-not-exist", 404)).res.headers.get("x-robots-tag"), /noindex/)
	await stopApp(app)
	app = await startApp(false)
	assert.match((await get(app, "/robots.txt")).body, /Disallow: \/\n/)
	const preview = await get(app, "/")
	assert.match(preview.res.headers.get("x-robots-tag"), /noindex/)
	assert.match(meta(preview.body, "robots"), /noindex/)
	console.log("PASS: SSR content, canonical pagination, social metadata, JSON-LD, noindex, sitemap, robots, five resource 404/503 paths and staging indexing policy")
} finally {
	if (app?.child.exitCode === null && !app.child.killed) await stopApp(app)
	api.close()
	api.closeAllConnections()
}
