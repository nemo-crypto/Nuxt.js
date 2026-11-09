import { defineNuxtModule } from "@nuxt/kit"
import { version } from "../app/config/env"

export default defineNuxtModule({
	meta: {
		name: "build-env",
	},
	async setup(_options, nuxt) {
		nuxt.options.appConfig = nuxt.options.appConfig || {}
		nuxt.options.appConfig.version = version
	},
})
