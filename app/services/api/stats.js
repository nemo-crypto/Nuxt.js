/** Services */
import { useServerURL } from "@/services/config"

export const fetchSeries = async ({ table, period, column, from, to }) => {
	try {
		const url = new URL(`${useServerURL()}/stats/series/${table}/${period}`)

		if (column) url.searchParams.append("column", column)
		if (from) url.searchParams.append("from", from)
		if (to) url.searchParams.append("to", to)
		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchSummary = async ({ table, func }) => {
	try {
		const url = new URL(`${useServerURL()}/stats/summary/${table}/${func}`)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchTPS = async () => {
	try {
		const url = new URL(`${useServerURL()}/stats/tps`)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchPrice = async () => {
	try {
		const url = new URL(`${useServerURL()}/stats/price/current`)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchPriceSeries = async ({ from }) => {
	try {
		const url = new URL(`${useServerURL()}/stats/price/series/1d`)

		if (from) url.searchParams.append("from", from)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchNamespaceUsage = async ({ top }) => {
	try {
		const url = new URL(`${useServerURL()}/stats/namespace/usage`)

		if (top) url.searchParams.append("top", top)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchNamespaceSeries = async ({ id, name, timeframe, from }) => {
	try {
		const url = new URL(`${useServerURL()}/stats/namespace/series/${id}/${name}/${timeframe}`)

		if (from) url.searchParams.append("from", from)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchRollupSeries = async ({ id, name, timeframe, from, to }) => {
	try {
		const url = new URL(`${useServerURL()}/rollup/${id}/stats/${name}/${timeframe}`)

		if (from) url.searchParams.append("from", from)
		if (to) url.searchParams.append("to", to)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}
