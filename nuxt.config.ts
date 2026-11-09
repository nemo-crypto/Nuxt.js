import { nodePolyfills } from "vite-plugin-node-polyfills"

export default defineNuxtConfig({
	components: [{ path: "~/components", extensions: ["vue"] }],
	compatibilityDate: "2026-11-09",
	experimental: {
		defaults: {
			useAsyncData: { deep: true },
			useFetch: { timeout: 10000, retry: 0 },
		},
	},
	modules: ["@nuxtjs/sitemap", "@pinia/nuxt", "nuxt-og-image"],

	site: {
		url: "https://www.explorer.nubit.org",
		name: "Nubit Explorer",
		defaultLocale: "en",
		trailingSlash: false,
	},

	sitemap: {
		xsl: false,
		sources: ["/api/__sitemap__/recent"],
		exclude: ["/bookmarks", "/namespaces/treemap"],
	},

	routeRules: {
		"/bookmarks": { headers: { "X-Robots-Tag": "noindex, follow" } },
		"/namespaces/treemap": { headers: { "X-Robots-Tag": "noindex, follow" } },
	},

	runtimeConfig: {
		public: {
			AMP: process.env.AMP,
			apiBase: "https://alphatestnet-api.nubit.org/v1",
			wsUrl: "wss://alphatestnet-api.nubit.org/v1/ws",
		},
	},

	app: {
		head: {
			htmlAttrs: {
				lang: "en",
			},
			meta: [
				{ name: "viewport", content: "width=device-width, initial-scale=1" },
				{
					name: "lang",
					content: "en",
				},
			],
			link: [
				{
					id: "favicon",
					href: "/favicon.ico",
					rel: "icon",
					type: "image/x-icon",
				},
				{
					rel: "preload",
					as: "style",
					href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
					onload: "this.onload=null;this.rel='stylesheet'",
				},
				{
					rel: "preload",
					as: "style",
					href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@700&display=swap",
					onload: "this.onload=null;this.rel='stylesheet'",
				},
			],
		},
	},

	css: ["@/assets/styles/base.scss", "@/assets/styles/flex.scss", "@/assets/styles/text.scss"],

	devtools: {
		enabled: true,
	},

	hooks: {
		"vite:extendConfig"(config, { isClient }) {
			if (isClient) {
				config.plugins ||= []
				config.plugins.push(nodePolyfills())
			}
		},
	},

	vite: {
		define: {
			global: "globalThis",
		},
	},
})
