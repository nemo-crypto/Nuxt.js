<script setup>
/** Vendor */
import { useDebounceFn } from "@vueuse/core"
import * as focusTrap from "focus-trap"
import { v4 as id } from "uuid"

/** Composables */
import { useOutside } from "@/composables/outside"

/** UI */
import Kbd from "@/components/ui/Kbd.vue"

/** Components */
import Item from "./Item.vue"

/** Custom Components */
import FeeCalculator from "./custom/FeeCalculator.vue"

/** Services */
import { isMac, isPrefersDarkScheme } from "@/services/utils/general"
import { capitilize } from "@/services/utils/strings"

/** API */
import { search } from "@/services/api/search"

/** Store */
import { useAppStore } from "@/store/app"
import { useCacheStore } from "@/store/cache"
import { useModalsStore } from "@/store/modals"
import { useBookmarksStore } from "@/store/bookmarks"
import { useNotificationsStore } from "@/store/notifications"
const appStore = useAppStore()
const cacheStore = useCacheStore()
const modalsStore = useModalsStore()
const bookmarksStore = useBookmarksStore()
const notificationsStore = useNotificationsStore()

const appConfig = useAppConfig()

const theme = useCookie("theme", { default: () => "dark" })

const route = useRoute()
const router = useRouter()

let root = null

let trap = null
const popupEl = ref(null)
const inputEl = ref(null)

const listEl = ref(null)
const actionEl = ref(null)

let removeOutside = null

const placeholder = ref()
const searchTerm = ref("")

const bounce = ref(false)

const developerMode = ref(false)
const featurePreviewMode = ref(false)

const mode = ref(null)
const isCommandMode = computed(() => mode.value === "command")
const isCustomMode = computed(() => mode.value === "custom")

const rules = ref([])

/** Command Mode Params */
const commandMetadata = reactive({
	action: null,
})
const resetMetadata = () => {
	commandMetadata.action = null
}

/** Footer Metadata: Run Text */
const runText = ref("")

/**
 * Actions & Groups
 */

const suggestedActions = ref([])
const makeSuggestions = () => {
	suggestedActions.value = []

	if (route.name === "namespaces") {
		suggestedActions.value.push({
			type: "callback",
			icon: "treemap",
			title: "Open Treemap View",
			runText: "Open",
			callback: () => {
				router.push("/namespaces/treemap")
			},
		})
	}

	if (route.name === "namespace-id") {
		suggestedActions.value.push({
			type: "callback",
			icon: "namespace",
			title: "View Raw Namespace",
			runText: "View",
			callback: () => {
				cacheStore.current._target = "namespace"
				modalsStore.open("rawData")
			},
		})
		suggestedActions.value.push({
			type: "callback",
			icon: "tx",
			title: "View Raw Messages",
			runText: "View",
			callback: () => {
				cacheStore.current._target = "messages"
				modalsStore.open("rawData")
			},
		})
	}

	if (route.name === "block-height") {
		suggestedActions.value.push({
			type: "callback",
			icon: "block",
			title: "View Raw Block",
			runText: "View",
			callback: () => {
				cacheStore.current._target = "block"
				modalsStore.open("rawData")
			},
		})
		suggestedActions.value.push({
			type: "callback",
			icon: "tx",
			title: "View Raw Transactions",
			runText: "View",
			callback: () => {
				cacheStore.current._target = "transactions"
				modalsStore.open("rawData")
			},
		})
	}

	if (route.name === "tx-hash") {
		suggestedActions.value.push({
			type: "callback",
			icon: "blob",
			title: "View Blob",
			runText: "View",
			callback: () => {
				modalsStore.open("blob")
			},
		})
		suggestedActions.value.push({
			type: "callback",
			icon: "tx",
			title: "View Raw Transactions",
			runText: "View",
			callback: () => {
				cacheStore.current._target = "transaction"
				modalsStore.open("rawData")
			},
		})
		suggestedActions.value.push({
			type: "callback",
			icon: "tx",
			title: "View Raw Events",
			runText: "View",
			callback: () => {
				cacheStore.current._target = "events"
				modalsStore.open("rawData")
			},
		})
	}

	if (route.name === "address-hash") {
		suggestedActions.value.push({
			type: "callback",
			icon: "address",
			title: "View Raw Address",
			runText: "View",
			callback: () => {
				cacheStore.current._target = "address"
				modalsStore.open("rawData")
			},
		})
		suggestedActions.value.push({
			type: "callback",
			icon: "tx",
			title: "View Raw Transactions",
			runText: "View",
			callback: () => {
				cacheStore.current._target = "transactions"
				modalsStore.open("rawData")
			},
		})
	}
}
const suggestionGroup = computed(() => {
	const actions = suggestedActions.value.map((a) => ({ id: id(), ...a }))

	return {
		title: "Suggestion",
		actions: actions.filter(({ title }) => title.toLowerCase().includes(searchTerm.value.toLowerCase())),
	}
})

const rawNavigationActions = [
	{
		type: "callback",
		icon: "arrow-narrow-right",
		title: "Go to Namespaces",
		runText: "Open Namespaces",
		callback: () => {
			router.push("/namespaces")
		},
	},
	{
		type: "callback",
		icon: "arrow-narrow-right",
		title: "Go to Rollups",
		runText: "Open Rollups",
		callback: () => {
			router.push("/rollups")
		},
	},
	{
		type: "callback",
		icon: "arrow-narrow-right",
		title: "Go to Transactions",
		runText: "Open Transactions",
		callback: () => {
			router.push("/txs")
		},
	},
	{
		type: "callback",
		icon: "arrow-narrow-right",
		title: "Go to Blocks",
		runText: "Open Blocks",
		callback: () => {
			router.push("/blocks")
		},
	},
	{
		type: "callback",
		icon: "arrow-narrow-right",
		title: "Go to Validators",
		runText: "Open Validators",
		callback: () => {
			router.push("/validators")
		},
	},
	{
		type: "callback",
		icon: "arrow-narrow-right",
		title: "Go to Addresses",
		runText: "Open Addresses",
		callback: () => {
			router.push("/addresses")
		},
	}
]
const navigationGroup = computed(() => {
	const actions = rawNavigationActions.map((a) => ({ id: id(), ...a }))

	return {
		title: "Navigation",
		actions: actions.filter(({ title }) => title.toLowerCase().includes(searchTerm.value.toLowerCase())),
	}
})

const rawQuickCommandsActions = [
	{
		type: "command:input",
		icon: "tx",
		title: "Open Transaction..",
		subtitle: "Command",
		placeholder: "Type tx hash...",
		runText: "Run Command",

		callback: (hash) => {
			router.push(`/tx/${hash}`)
		},

		metadata: {},
	},
	{
		type: "command:input",
		icon: "block",
		title: "Open Block..",
		subtitle: "Command",
		placeholder: "Type block height...",
		runText: "Run Command",

		callback: (height) => {
			router.push(`/block/${height}`)
		},
	},
	{
		type: "command:input",
		icon: "validator",
		title: "Open Validator..",
		subtitle: "Command",
		placeholder: "Type validator moniker...",
		runText: "Run Command",

		callback: (id) => {
			router.push(`/validator/${id}`)
		},
	},
	{
		type: "command:input",
		icon: "namespace",
		title: "Open Namespace..",
		subtitle: "Command",
		placeholder: "Type namespace ID...",
		runText: "Run Command",

		callback: (id) => {
			router.push(`/namespace/${id}`)
		},
	},
	{
		type: "command:input",
		icon: "address",
		title: "Open Address..",
		subtitle: "Command",
		placeholder: "Type address hash...",
		runText: "Run Command",

		callback: (hash) => {
			router.push(`/address/${hash}`)
		},
	},
	{
		type: "callback",
		icon: "bookmark-plus",
		title: "Open My Bookmarks",
		subtitle: "Command",
		runText: "Run Command",

		callback: () => {
			router.push("/bookmarks")
		},
	}
]
const quickCommandsGroup = computed(() => {
	const actions = rawQuickCommandsActions.map((a) => ({ id: id(), ...a }))

	return {
		title: "Quick Actions",
		actions: actions.filter(({ title }) => title.toLowerCase().includes(searchTerm.value.toLowerCase())),
	}
})

const rawSettingsActions = []
const settingsGroup = computed(() => {
	const actions = rawSettingsActions.map((a) => ({ id: id(), ...a }))

	return {
		title: "Settings",
		actions: actions.filter(({ title }) => title.toLowerCase().includes(searchTerm.value.toLowerCase())),
	}
})

const rawDeveloperActions = [
	{
		type: "callback",
		icon: "zap",
		title: "View Constants",
		subtitle: "Command",
		runText: "View Constants",
		callback: () => {
			modalsStore.open("constants")
		},
	},
	{
		type: "callback",
		icon: "settings",
		title: "Full Reload",
		subtitle: "Command",
		runText: "Reload",
		callback: () => {
			appStore.createConfirmation({
				title: `Do you want to fully reload the page?`,
				description: "The app will reload with a cache reset",

				buttons: {
					confirm: {
						color: "red",
						title: "Yes, clear",
					},
					cancel: {
						title: "Cancel",
					},
				},

				confirmCb: () => {
					location.reload(true)

					modalsStore.close("confirmation")
				},
				cancelCb: () => {
					modalsStore.close("confirmation")
				},
			})
		},
	},
	{
		type: "callback",
		icon: "settings",
		title: "Clear local storage",
		subtitle: "Command",
		runText: "Clear",
		callback: () => {
			appStore.createConfirmation({
				title: `Do you want to clear local storage?`,
				description: "Your local storage will be cleared (including bookmarks)",

				buttons: {
					confirm: {
						color: "red",
						title: "Yes, clear",
					},
					cancel: {
						title: "Cancel",
					},
				},

				confirmCb: () => {
					localStorage.clear()

					notificationsStore.create({
						notification: {
							type: "info",
							icon: "check",
							title: `Local storage successfully cleared`,
							autoDestroy: true,
						},
					})

					modalsStore.close("confirmation")
				},
				cancelCb: () => {
					modalsStore.close("confirmation")
				},
			})
		},
	},
	{
		type: "callback",
		icon: "bookmark-plus",
		title: "Clear bookmarks",
		subtitle: "Command",
		runText: "Clear",
		callback: () => {
			appStore.createConfirmation({
				title: `Do you want to clear your bookmarks?`,
				description: "Your local storage for bookmarks will be cleared",

				buttons: {
					confirm: {
						color: "red",
						title: "Yes, delete all bookmarks",
					},
					cancel: {
						title: "Cancel",
					},
				},

				confirmCb: () => {
					localStorage.removeItem("bookmarks")
					bookmarksStore.clearBookmarks()

					notificationsStore.create({
						notification: {
							type: "info",
							icon: "check",
							title: `Your bookmarks successfully cleared`,
							autoDestroy: true,
						},
					})

					modalsStore.close("confirmation")
				},
				cancelCb: () => {
					modalsStore.close("confirmation")
				},
			})
		},
	},
	{
		type: "callback",
		icon: "settings",
		title: "Hard Reset",
		subtitle: "Command",
		runText: "Reset",
		callback: () => {
			appStore.createConfirmation({
				title: `Do you want to hard reset?`,
				description: "Your local storage will be cleared and app will reload with a cache reset",

				buttons: {
					confirm: {
						title: "Yes, reset",
					},
					cancel: {
						title: "Cancel",
					},
				},

				confirmCb: () => {
					localStorage.clear()
					location.reload(true)

					modalsStore.close("confirmation")
				},
				cancelCb: () => {
					modalsStore.close("confirmation")
				},
			})
		},
	},
	{
		type: "callback",
		icon: "settings",
		title: "Toggle Search Scoring",
		subtitle: "Command",
		runText: "Reset",
		callback: () => {
			notificationsStore.create({
				notification: {
					type: "info",
					icon: "info",
					title: `Search scoring is not available`,
					autoDestroy: true,
				},
			})
		},
	},
	{
		type: "callback",
		icon: "stars",
		title: "Toggle Feature Preview",
		subtitle: "Command",
		runText: "Toggle",
		callback: () => {
			localStorage.featurePreview = !localStorage.featurePreview
			featurePreviewMode.value = !featurePreviewMode.value

			notificationsStore.create({
				notification: {
					type: "info",
					icon: featurePreviewMode.value ? "check" : "close",
					title: `Feature preview ${featurePreviewMode.value ? "enabled" : "disabled"}`,
					description:
						featurePreviewMode.value &&
						"You can now get early access to the new beta features. You can report bugs to our GitHub repo.",
					autoDestroy: true,
				},
			})
		},
	},
]
const developerGroup = computed(() => {
	const actions = rawDeveloperActions.map((a) => ({ id: id(), ...a }))

	return {
		title: "Developer",
		actions: developerMode.value ? actions.filter(({ title }) => title.toLowerCase().includes(searchTerm.value.toLowerCase())) : [],
	}
})

const rawOtherActions = [
	{
		type: "callback",
		icon: "terminal",
		title: "Toggle Developer Mode",
		subtitle: "Command",
		runText: "Toggle",
		callback: () => {
			localStorage.developer = !localStorage.developer
			developerMode.value = !developerMode.value

			notificationsStore.create({
				notification: {
					type: "info",
					icon: developerMode.value ? "check" : "close",
					title: `Developer mode ${developerMode.value ? "enabled" : "disabled"}`,
					description: developerMode.value && "Now you can access additional features in the command menu.",
					autoDestroy: true,
				},
			})
		},
	},
	{
		type: "callback",
		icon: "arrow-narrow-up-right",
		title: "Go to Discord",
		subtitle: "Quicklink",
		runText: "Open Discord",
		callback: () => {
			window.open("https://discord.gg/nubit", "_blank")
		},
	},
	{
		type: "callback",
		icon: "arrow-narrow-up-right",
		title: "Go to Twitter",
		subtitle: "Quicklink",
		runText: "Open Twitter",
		callback: () => {
			window.open("https://twitter.com/Nubit_org", "_blank")
		},
	},
	{
		type: "callback",
		icon: "arrow-narrow-up-right",
		title: "Go to Github",
		subtitle: "Quicklink",
		runText: "Open Github",
		callback: () => {
			window.open("https://github.com/RiemaLabs", "_blank")
		},
	},
]
const otherGroup = computed(() => {
	const actions = rawOtherActions.map((a) => ({ id: id(), ...a }))

	return {
		title: "Other",
		actions: actions.filter(({ title }) => title.toLowerCase().includes(searchTerm.value.toLowerCase())),
	}
})

const searchAction = {
	id: id(),
	type: "callback",
	icon: "search",
	title: "Search your query on the blockchain...",
	runText: "Run Search",
	callback: async () => {
		if (!searchTerm.value.length) return

		const { data } = await search(searchTerm.value.trim())
		if (!data.value.length) {
			notificationsStore.create({
				notification: {
					type: "info",
					icon: "search",
					title: "Nothing was found",
					description: "Use the hash of a block, transaction, address or namespace for correct search",
					autoDestroy: true,
				},
			})

			return
		}

		switch (data.value[0].type) {
			case "tx":
				router.push(`/tx/${data.value[0].result.hash}`)
				break

			case "block":
				router.push(`/block/${data.value[0].result.height}`)
				break

			case "namespace":
				router.push(`/namespace/${data.value[0].result.namespace_id}`)
				break

			case "address":
				router.push(`/address/${data.value[0].result.hash}`)
				break

			case "rollup":
				router.push(`/rollup/${data.value[0].result.slug}`)
				break

			case "validator":
				router.push(`/validator/${data.value[0].result.id}`)
				break

			default:
				break
		}
	},
}
const searchGroup = computed(() => {
	return {
		title: `Query "${searchTerm.value}"`,
		actions: searchTerm.value ? [searchAction] : [],
	}
})

const autocompleteActions = ref([])
const autocompleteGroup = computed(() => {
	return {
		title: "Search Result",
		actions: autocompleteActions.value,
	}
})

const debouncedSearch = useDebounceFn(async (e) => {
	const { data } = await search(searchTerm.value.trim())
	if (!data.value?.length) return

	autocompleteActions.value = []

	for (let i = 0; i < Math.min(3, data.value.length); i++) {
		let title
		let routerLink
		switch (data.value[i].type) {
			case "tx":
				title = data.value[i].result.hash
				routerLink = `/tx/${data.value[i].result.hash}`
				break

			case "block":
				title = data.value[i].result.hash
				routerLink = `/block/${data.value[i].result.height}`
				break

			case "namespace":
				title = data.value[i].result.hash
				routerLink = `/namespace/${data.value[i].result.namespace_id}`
				break

			case "address":
				title = data.value[i].result.hash
				routerLink = `/address/${data.value[i].result.hash}`
				break

			case "rollup":
				title = data.value[i].result.name
				routerLink = `/rollup/${data.value[i].result.slug}`
				break

			case "validator":
				title = data.value[i].result.moniker ? data.value[i].result.moniker : data.value[i].result.address
				routerLink = `/validator/${data.value[i].result.id}`
				break

			default:
				break
		}

		autocompleteActions.value.push({
			id: id(),
			type: "callback",
			icon: data.value[i].type,
			title: title,
			subtitle: capitilize(data.value[i].type),
			runText: "Open",
			callback: () => {
				router.push(routerLink)
			},
		})
	}
}, 250)

const groups = reactive([
	searchGroup
])

const fakeFocus = ref()

const copyData = ref()
const handleShareCopyData = (data) => {
	copyData.value = data
}

onMounted(() => {
	developerMode.value = localStorage.developer
	featurePreviewMode.value = localStorage.featurePreview

	root = document.querySelector("html")

	document.addEventListener("keydown", (e) => {
		if (["Escape"].includes(e.code) && appStore.showCmd) {
			if (!mode.value) {
				appStore.showCmd = false
				return
			} else {
				exitCommandMode()
				return
			}
		}

		if (e.code === "KeyK" && ((isMac && e.metaKey) || (!isMac && e.ctrlKey))) {
			e.preventDefault()
			appStore.showCmd = !appStore.showCmd
		}
	})
})

const exitCommandMode = () => {
	mode.value = null
	searchTerm.value = ""
	runText.value = ""
	placeholder.value = null
	rules.value = []

	runBounce()

	resetMetadata()
}

watch(
	() => appStore.showCmd,
	() => {
		if (appStore.showCmd) {
			makeSuggestions()

			nextTick(() => {
				document.addEventListener("keydown", onKeydown)

				fakeFocus.value = actionEl.value[0].wrapper.wrapper.id

				handleFocus()

				trap = focusTrap.createFocusTrap(popupEl.value.wrapper, {
					initialFocus: false,
				})
				trap.activate()

				removeOutside = useOutside(popupEl.value.wrapper, () => {
					handleOutside()
				})
			})
		} else {
			document.removeEventListener("keydown", onKeydown)

			if (trap && trap.active) trap.deactivate()

			if (removeOutside) removeOutside()

			searchTerm.value = ""
			autocompleteActions.value = []
		}
	},
)

const getActionById = () => {
	const actions = []
	let target = null

	groups.forEach((g) => {
		g.value.actions.forEach((a) => {
			actions.push(a)

			if (a.actions) {
				actions.push(...a.actions)
			}
		})
	})

	actions.forEach((a) => {
		if (a.id === fakeFocus.value) {
			target = a
		}
	})

	return target
}

const onActionFocus = () => {
	const action = getActionById()

	if (!action) return

	if (!mode.value) {
		runText.value = action.runText
	} else {
		runText.value = action.nestedRunText ? action.nestedRunText : action.runText
	}
}

const handleSearchTermInput = () => {
	if (!searchTerm.value.length) return
	if (!rules.value.length) return

	const inputRules = rules.value.filter((r) => r.type === "input")

	inputRules.forEach((r) => {
		searchTerm.value = r.callback(searchTerm.value)
	})
}

const handleExecute = (action) => {
	/** Set fake focus on click */
	if (action && action.id && action.id !== fakeFocus.value) {
		fakeFocus.value = action.id
	}

	let target = action?.id ? action : null

	if (!target) {
		target = getActionById()
	}

	if (!isCommandMode.value && target) {
		switch (target.type) {
			case "callback":
				target.callback()
				appStore.showCmd = false
				break

			case "command:input":
				mode.value = "command"

				if (target.placeholder) placeholder.value = target.placeholder

				commandMetadata.action = target

				runText.value = target.runText

				inputEl.value.focus()
				searchTerm.value = ""

				runBounce()

				break

			case "command:nested":
				mode.value = "command"

				if (target.placeholder) placeholder.value = target.placeholder

				commandMetadata.action = target

				runText.value = target.runText

				inputEl.value.focus()
				searchTerm.value = ""

				nextTick(() => {
					fakeFocus.value = actionEl.value[0].wrapper.wrapper.id
				})

				runBounce()

				break

			case "command:custom":
				mode.value = "custom"

				runText.value = target.runText

				if (target.placeholder) placeholder.value = target.placeholder
				if (target.nestedRunText) runText.value = target.nestedRunText
				if (target.rules) rules.value = target.rules

				commandMetadata.action = target

				searchTerm.value = ""

				runBounce()

				break

			default:
				break
		}

		return
	}

	if (isCommandMode.value) {
		if (commandMetadata.action.type === "command:nested") {
			target.callback()
			appStore.showCmd = false

			exitCommandMode()

			return
		}

		if (!searchTerm.value && commandMetadata.action.type === "command:input") return

		commandMetadata.action.callback(searchTerm.value)
		exitCommandMode()

		appStore.showCmd = false
	}

	if (isCustomMode.value) {
		if (!searchTerm.value || !copyData.value) return

		commandMetadata.action.callback(searchTerm.value)
		exitCommandMode()

		appStore.showCmd = false
	}
}

const handleExecuteBy = () => {
	if (searchGroup.value.actions.length > 0) {
		handleExecute(searchGroup.value.actions[0])
	}
}

const onKeydown = (e) => {
	let itemsToNavigate = null
	let activeItemIdx = null

	if (["ArrowDown", "ArrowUp", "PageUp", "PageDown"].includes(e.key)) {
		e.preventDefault()

		itemsToNavigate = actionEl.value
		activeItemIdx = [...actionEl.value].findIndex((item) => item.wrapper.wrapper.id === fakeFocus.value)
	}

	if (e.key === "ArrowDown") {
		if (activeItemIdx === -1 || activeItemIdx === itemsToNavigate.length - 1) {
			fakeFocus.value = itemsToNavigate[0].wrapper.wrapper.id
		} else {
			fakeFocus.value = itemsToNavigate[activeItemIdx + 1].wrapper.wrapper.id
		}
	}

	if (e.key === "ArrowUp") {
		if (activeItemIdx === -1 || activeItemIdx === 0) {
			fakeFocus.value = itemsToNavigate[itemsToNavigate.length - 1].wrapper.wrapper.id
		} else {
			fakeFocus.value = itemsToNavigate[activeItemIdx - 1].wrapper.wrapper.id
		}
	}

	if (e.key === "PageUp") {
		fakeFocus.value = itemsToNavigate[0].wrapper.wrapper.id
	}

	if (e.key === "PageDown") {
		fakeFocus.value = itemsToNavigate[itemsToNavigate.length - 1].wrapper.wrapper.id
	}

	if (["ArrowDown", "ArrowUp", "PageUp", "PageDown"].includes(e.key)) {
		actionEl.value.forEach((a) => {
			if (a.wrapper.wrapper.id === fakeFocus.value) {
				a.wrapper.wrapper.scrollIntoView({ block: "nearest" })
			}
		})
	}
}

watch(
	() => searchTerm.value,
	() => {
		if (searchTerm.value.length < 3 && !mode.value) {
			autocompleteActions.value = []
		} else if (searchTerm.value.length > 2 && !mode.value) {
			debouncedSearch()
		}

		nextTick(() => {
			fakeFocus.value = actionEl.value[0]?.wrapper.wrapper.id
		})
	},
)

watch(
	() => fakeFocus.value,
	() => {
		onActionFocus()
	},
)

const handleFocus = () => {
	inputEl.value?.focus()
}

const handleOutside = () => {
	exitCommandMode()

	appStore.showCmd = false
}

const runBounce = () => {
	bounce.value = true
	setTimeout(() => {
		bounce.value = false
	}, 150)
}
</script>

<template>
	<Transition name="fastpopup">
		<div :class="$style.wrapperNew">
			<Flex @click.stop="handleFocus" ref="popupEl" direction="column"
				:class="[$style.popupNew, bounce && $style.bounce]">
				<!-- Input Field -->
				<Flex direction="column" :class="$style.header">
					<Flex v-if="isCommandMode" align="center" gap="8" :class="$style.breadcrumbs">
						<Icon @click="exitCommandMode" name="arrow-narrow-left" size="12" color="secondary"
							:class="$style.back_btn" />

						<Flex align="center" gap="6">
							<Text size="12" weight="600" color="tertiary">Quick Actions</Text>
							<Text size="12" weight="600" color="support">/</Text>
							<Text size="12" weight="600" color="secondary">{{ commandMetadata.action.title }}</Text>
						</Flex>
					</Flex>

					<Flex align="center" :class="$style.input">
						<input v-model="searchTerm" ref="inputEl"
							:placeholder="placeholder || 'Find blocks, validators, namespaces, transactions ...'"
							tabindex="1" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
							@input="handleSearchTermInput" @keydown.enter="handleExecute" />
					</Flex>
					<img class="animate__animated animate__fadeIn hvr-pulse-grow" :class="$style.searchGlobalIcon"
						width="24" height="24" src="/img/searchGlobal.svg" @click="handleExecuteBy()" />
				</Flex>

				<!-- Default List -->
				<Flex v-if="!mode" ref="listEl" direction="column" :class="$style.list">
					<template v-for="group in groups" :key="group?.value?.title">
						<Flex v-if="group.value.actions.length" direction="column" :class="$style.group">
							<Text size="12" weight="500" color="yellowNew" :class="$style.label">{{ group.value.title
								}}</Text>

							<Flex direction="column" :class="$style.actions">
								<Item v-for="action in group.value.actions" :key="action.id" ref="actionEl"
									:id="action.id" @click="handleExecute(action)" :action="action"
									:isFocused="action.id === fakeFocus" />
							</Flex>
						</Flex>
					</template>
				</Flex>

				<!-- Command Mode -->
				<Flex v-else-if="isCommandMode" direction="column" :class="$style.list">
					<Flex direction="column" :class="$style.group">
						<Text v-if="commandMetadata.action.nestedTitle" size="12" weight="500" color="tertiary"
							:class="$style.label">
							{{ commandMetadata.action.nestedTitle }}
						</Text>

						<Flex direction="column" :class="$style.actions">
							<Item v-for="action in commandMetadata.action.actions" :key="action.id" ref="actionEl"
								:id="action.id" @click="handleExecute(action)" :action="action"
								:isFocused="action.id === fakeFocus" />
						</Flex>
					</Flex>
				</Flex>

				<!-- Custom Component Mode -->
				<Flex v-else-if="isCustomMode" direction="column" :class="$style.list">
					<FeeCalculator :searchTerm="searchTerm" @shareCopyData="handleShareCopyData" />
				</Flex>

			</Flex>
		</div>
	</Transition>
</template>

<style module>
@media (max-width: 768px) {
	.popup {
		width: 95%;
		top: 7%;
	}

	.wrapperNew {
		width: 100%;
		padding: 0 20px;

		.popupNew {
			width: 360px;
		}

		.searchGlobalIcon {
			margin-left: 307px;
			background: #3a3535;
		}

		.header {
			.input {

				& input {
					font-size: 12px;
				}

			}
		}

	}

}


.wrapperNew {
	margin-top: 30px;
}

.popupNew {
	width: 1320px;
	max-height: 450px;
	overflow: hidden;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 8px 8px 8px 8px
}

.popup.bounce {
	animation: bounce 0.1s ease-in-out;
}

.searchGlobalIcon {
	position: absolute;
	margin-left: 1251px;
	margin-top: 13px;
	cursor: pointer;
}

@keyframes bounce {
	0% {
		transform: translateY(-5px) translateX(-50%);
	}

	100% {
		transform: translateY(0) translateX(-50%);
	}
}

.header {
	padding: 2px 20px 2px 20px;

	.breadcrumbs {
		padding-top: 12px;

		.back_btn {
			background: var(--op-5);
			border-radius: 4px;
			box-sizing: content-box;
			cursor: pointer;

			padding: 2px 4px;

			transition: all 0.2s ease;

			&:hover {
				background: var(--op-8);
			}

			&:active {
				background: var(--op-10);
			}
		}
	}

	.input {
		min-height: 48px;

		cursor: text;
		border-bottom: 1px solid var(--op-5);

		& input {
			width: 100%;

			font-size: 14px;
			line-height: 1;
			color: var(--txt-primary);
			font-weight: 500;
		}

		& input::-webkit-input-placeholder {
			color: var(--txt-tertiary);
		}
	}
}

.list {
	display: none;
	position: absolute;
	width: 1320px;
	margin-top: 60px;
	z-index: 100;
	background: #353337;
}

.group {
	.label {
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		padding: 12px 12px 6px 12px;
	}

	.actions {
		padding: 10px;
	}
}

.footer {
	background: var(--op-5);
	border-top: 1px solid var(--op-5);

	padding: 8px 20px;
}

/** footer button */
.button {
	cursor: pointer;

	&:hover {
		span {
			color: var(--txt-primary);
		}
	}
}
</style>
