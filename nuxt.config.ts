import { nodePolyfills } from "vite-plugin-node-polyfills"

export default defineNuxtConfig({
	srcDir: ".",
	components: [{ path: "~/components", extensions: ["vue"] }],
	compatibilityDate: "2026-11-09",
	experimental: {
		defaults: { useAsyncData: { deep: true } },
	},
	modules: ["@nuxtjs/sitemap", "@pinia/nuxt", "nuxt-og-image"],

	site: {
		url: "https://www.explorer.nubit.org/",
	},

	sitemap: {
		xsl: false,
	},

	routeRules: {
		"/": {
			sitemap: {
				changefreq: "daily",
				priority: 1,
			},
		},
		"/blocks": {
			sitemap: {
				changefreq: "daily",
				priority: 0.9,
			},
		},
		"/namespaces": {
			sitemap: {
				changefreq: "daily",
				priority: 0.8,
			},
		},
		"/txs": {
			sitemap: {
				changefreq: "daily",
				priority: 0.7,
			},
		},
		"/addresses": {
			sitemap: {
				changefreq: "daily",
				priority: 0.6,
			},
		}
	},

	runtimeConfig: {
		public: {
			AMP: process.env.AMP,
		},
	},

	app: {
		head: {
			htmlAttrs: {
				lang: "en",
			},
			meta: [
				{ name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1" },
				{
					name: "lang",
					content: "en",
				},
			],
			link: [
				{
					id: "favicon",
					rel: "icon",
					type: "image/png",
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
				{
					rel: "preload",
					as: "style",
					href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@700&display=swap",
					onload: "this.onload=null;this.rel='stylesheet'",
				},
				{
					rel: "preload",
					as: "script",
					href: "https://www.googletagmanager.com/gtag/js?id=G-M6NP8RB5YP",
				}
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
