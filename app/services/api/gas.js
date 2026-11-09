/** Services */
import { useServerURL } from "@/services/config"

export const fetchGasPrice = async () => {
	try {
		const url = new URL(`${useServerURL()}/gas/price`)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchGasPriceSeries = async ({ timeframe, from, to }) => {
	try {
		const url = new URL(`${useServerURL()}/stats/series/gas_price/${timeframe}`)

		url.searchParams.append("from", from)
		url.searchParams.append("to", to)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchGasLimitSeries = async ({ timeframe, from, to }) => {
	try {
		const url = new URL(`${useServerURL()}/stats/series/gas_limit/${timeframe}`)

		url.searchParams.append("from", from)
		url.searchParams.append("to", to)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchGasUsedSeries = async ({ timeframe, from, to }) => {
	try {
		const url = new URL(`${useServerURL()}/stats/series/gas_used/${timeframe}`)

		url.searchParams.append("from", from)
		url.searchParams.append("to", to)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchGasEfficiencySeries = async ({ timeframe, from, to }) => {
	try {
		const url = new URL(`${useServerURL()}/stats/series/gas_efficiency/${timeframe}`)

		url.searchParams.append("from", from)
		url.searchParams.append("to", to)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchEstimatedGas = async (length) => {
	try {
		const url = new URL(`${useServerURL()}/gas/estimate_for_pfb?sizes=${length}`)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}
