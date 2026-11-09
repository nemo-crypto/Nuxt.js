import { test } from "node:test"
import assert from "node:assert/strict"
import { getSeoPolicy, serializeJsonLd, getResourceStatus } from "../shared/utils/seo.js"
const site = "https://explorer.example.com"

test("canonical strips tracking parameters while preserving distinct pagination", () => {
	assert.equal(getSeoPolicy(site, "/blocks/", { page: "1", utm_source: "newsletter" }).canonical, `${site}/blocks`)
	const page = getSeoPolicy(site, "/blocks", { page: "2", gclid: "tracker" })
	assert.equal(page.canonical, `${site}/blocks?page=2`)
	assert.equal(page.noindex, false)
	assert.equal(page.page, 2)
})
test("filtered, private and non-production pages cannot be indexed", () => {
	for (const query of [{ status: "failed" }, { page: "0" }, { page: ["1", "2"] }, { page: "1e3" }]) {
		assert.equal(getSeoPolicy(site, "/txs", query).noindex, true)
	}
	assert.equal(getSeoPolicy(site, "/bookmarks").noindex, true)
	assert.equal(getSeoPolicy(site, "/namespaces/treemap/").noindex, true)
	assert.equal(getSeoPolicy(site, "/", {}, false).noindex, true)
	assert.equal(getSeoPolicy(site, "/", {}, "false").noindex, true)
})
test("canonical stays on the configured origin and sorts query keys", () => {
	assert.equal(new URL(getSeoPolicy(site, "//evil.example/path").canonical).origin, site)
	assert.equal(getSeoPolicy(site, "/txs", { status: "failed", page: "2" }).canonical, `${site}/txs?page=2&status=failed`)
})
test("JSON-LD preserves chain text without allowing script breakout", () => {
	const input = { name: '</script><script>alert("x")</script>\u2028' }
	const serialized = serializeJsonLd(input)
	assert.ok(!serialized.includes("<"))
	assert.deepEqual(JSON.parse(serialized), input)
})
test("resource absence is 404 while upstream failures remain retryable 503", () => {
	assert.equal(getResourceStatus(null, null), 404)
	assert.equal(getResourceStatus([], null), 404)
	assert.equal(getResourceStatus(null, {statusCode: 404}), 404)
	for (const statusCode of [401, 429, 500, 502, 504]) assert.equal(getResourceStatus(null, { statusCode }), 503)
	assert.equal(getResourceStatus(null, new Error("timeout")), 503)
	assert.equal(getResourceStatus({height: 1}, null), 200)
})
