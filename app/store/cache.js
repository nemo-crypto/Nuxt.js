/**
 * Vendor
 */
import { ref, reactive } from "vue"
import { defineStore, acceptHMRUpdate } from "pinia"

export const useCacheStore = defineStore("cache", () => {
	const selectedBlob = ref(null)

	const qr = reactive({
		data: null,
		description: null,
		icon: null,
	})

	const current = reactive({
		_target: null,

		/** global */
		transactions: null,

		/** namespace */
		namespace: null,
		messages: null,
		blobs: null,

		/** block */
		block: null,

		/** tx */
		transaction: null,
		events: null,
		message: null,
		event: null,

		/** address */
		address: null,

		/** bookmark */
		bookmark: null,
	})

	return { selectedBlob, qr, current }
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useCacheStore, import.meta.hot))
}
