/** Services */
import { useServerURL } from "@/services/config"

export const fetchTransactions = async ({ limit, offset, sort, sort_by, msg_type, status }) => {
	try {
		const url = new URL(`${useServerURL()}/tx`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (msg_type) url.searchParams.append("msg_type", msg_type)
		if (status) url.searchParams.append("status", status)
		if (sort) url.searchParams.append("sort", sort)
		if (sort_by) url.searchParams.append("sort_by", sort_by)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchTxsCount = async () => {
	try {
		const url = new URL(`${useServerURL()}/tx/count`)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchTxByHash = async (hash) => {
	try {
		const url = new URL(`${useServerURL()}/tx/${hash}`)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchTxMessages = async (hash) => {
	try {
		const url = new URL(`${useServerURL()}/tx/${hash}/messages`)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchTxEvents = async ({ hash, limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/tx/${hash}/events`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchTxNamespaces = async ({ hash, limit, offset, sort }) => {
	try {
		const url = new URL(`${useServerURL()}/tx/${hash}/namespace`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchTxNamespacesCount = async (hash) => {
	try {
		const url = new URL(`${useServerURL()}/tx/${hash}/namespace/count`)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchTxBlobs = async ({ hash, limit, offset, sort }) => {
	try {
		const url = new URL(`${useServerURL()}/tx/${hash}/blobs`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchTxBlobsCount = async (hash) => {
	try {
		const url = new URL(`${useServerURL()}/tx/${hash}/blobs/count`)

		const data = await $fetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

/** Latest SubmitBlobPayment */
export const fetchLatestPFBs = async (height) => {
	try {
		const data = await useFetch(`${useServerURL()}/tx?sort=desc&limit=5`)
		// const data = await useFetch(`${useServerURL()}/tx?msg_type=MsgSubmitBlobPayments&sort=desc&limit=5`)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchTransactionsByBlock = async ({ limit, offset, sort, height, from, status, type, excluded_types }) => {
	try {
		const url = new URL(`${useServerURL()}/tx`)

		url.searchParams.append("height", height)
		if (from) url.searchParams.append("from", from)
		if (limit) url.searchParams.append("limit", limit)
		if (sort) url.searchParams.append("sort", sort)
		if (offset) url.searchParams.append("offset", offset)
		if (status) url.searchParams.append("status", status)
		if (type) url.searchParams.append("msg_type", type)
		if (excluded_types) url.searchParams.append("excluded_msg_type", excluded_types)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}
