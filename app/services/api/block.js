/** Services */
import { useServerURL } from "@/services/config"

export const fetchBlocks = async ({ limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/block`)

		url.searchParams.append("stats", true)
		url.searchParams.append("sort", "desc")

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchBlocksCount = async () => {
	try {
		const url = new URL(`${useServerURL()}/block/count`)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchLatestBlocks = async () => {
	try {
		const url = new URL(`${useServerURL()}/block`)

		url.searchParams.append("stats", true)
		url.searchParams.append("sort", "desc")
		url.searchParams.append("limit", 15)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchAvgBlockTime = async ({ from }) => {
	try {
		const url = new URL(`${useServerURL()}/stats/summary/block_stats/avg?column=block_time`)

		url.searchParams.append("from", from)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchBlockByHeight = async (height) => {
	try {
		const data = await useFetch(`${useServerURL()}/block/${height}?stats=true`)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchBlockNamespaces = async ({ height, limit, offset, sort }) => {
	try {
		const url = new URL(`${useServerURL()}/block/${height}/namespace`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchBlockNamespacesCount = async (height) => {
	try {
		const data = await $fetch(`${useServerURL()}/block/${height}/namespace/count`)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchBlockBlobs = async ({ height, limit, offset, sort }) => {
	try {
		const url = new URL(`${useServerURL()}/block/${height}/blobs`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchBlockBlobsCount = async (height) => {
	try {
		const data = await $fetch(`${useServerURL()}/block/${height}/blobs/count`)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchBlockEvents = async ({ height, limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/block/${height}/events`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}
