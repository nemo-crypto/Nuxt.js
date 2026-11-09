import { useModalsStore } from "./modals"

export const useAppStore = defineStore("app", () => {
	const modalsStore = useModalsStore()

	const network = ref()

	const head = ref()
	const gas = ref({
		fast: 0,
		median: 0,
		slow: 0,
	})
	const currentPrice = ref({
		time: "",
		open: "0",
		high: "0",
		low: "0",
		close: "0",
	})

	const address = ref("")
	const balance = ref(0)

	const latestBlocks = ref([])
	const lastHead = ref({})
	const isLatestBlocksLoaded = ref(false)
	const isPaused = ref(false)

	const showCmd = ref(false)

	const theme = ref("")

	const confirmation = ref(null)
	const createConfirmation = (metadata) => {
		confirmation.value = metadata

		modalsStore.open("confirmation")
	}

	return {
		network,
		head,
		gas,
		currentPrice,
		address,
		balance,
		latestBlocks,
		lastHead,
		isPaused,
		isLatestBlocksLoaded,
		showCmd,
		theme,
		confirmation,
		createConfirmation,
	}
})
