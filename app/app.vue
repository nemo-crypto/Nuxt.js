<script setup>
import "hover.css"
import "animate.css"
/** Services */
import Socket from "@/services/api/socket"

/** Components */
import ModalsManager from "@/components/modals/ModalsManager.vue"

/** API */
import { fetchGasPrice } from "@/services/api/gas"
import { fetchHead } from "@/services/api/main"

/** Store */
import { useAppStore } from "@/store/app"
import { useBookmarksStore } from "@/store/bookmarks"
const appStore = useAppStore()
const bookmarksStore = useBookmarksStore()
let unsubscribeBookmarks
onBeforeUnmount(() => {
	unsubscribeBookmarks?.()
	Socket.close()
})

onMounted(async () => {
	unsubscribeBookmarks = bookmarksStore.$subscribe((mutation, state) => {
		localStorage.setItem("bookmarks", JSON.stringify(state.bookmarks))
	})
	const head = await fetchHead()
	if (head) appStore.lastHead = head

	Socket.init()

	if (localStorage.bookmarks) {
		bookmarksStore.bookmarks = JSON.parse(localStorage.bookmarks)
	}

	const gasPrice = await fetchGasPrice()
	appStore.gas = gasPrice

	window.onbeforeunload = function () {
		Socket.close()
	}

	window.dataLayer = window?.dataLayer || []
	function gtag() {
		dataLayer.push(arguments)
	}
	gtag("js", new Date())
	gtag("config", "G-M6NP8RB5YP")
})
</script>

<template>
	<NuxtLoadingIndicator height="3" color="#F33928" />
	<NuxtLayout>
		<NuxtPage />

		<div id="tooltip" />
		<div id="modal" />
		<div id="dropdown" />
		<div id="popover" />

		<ModalsManager />
		<Notifications />
	</NuxtLayout>
</template>
