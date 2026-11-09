/** Services */
import { useServerURL } from "@/services/config"

export const fetchAddresses = async ({ limit, offset, sort }) => {
	try {
		const url = new URL(`${useServerURL()}/address`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchAddressesCount = async () => {
	try {
		const url = new URL(`${useServerURL()}/address/count`)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchAddressByHash = async (hash) => {
	try {
		const url = new URL(`${useServerURL()}/address/${hash}`)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchTxsByAddressHash = async ({ limit, offset, sort, hash, status, msg_type }) => {
	try {
		const url = new URL(`${useServerURL()}/address/${hash}/txs`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)
		if (msg_type) url.searchParams.append("msg_type", msg_type)
		if (status) url.searchParams.append("status", status)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchMessagesByAddressHash = async ({ limit, offset, sort, hash, msg_type }) => {
	try {
		const url = new URL(`${useServerURL()}/address/${hash}/messages`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)
		if (msg_type) url.searchParams.append("msg_type", msg_type)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchBlobsByAddressHash = async ({ limit, offset, sort, hash }) => {
	try {
		const url = new URL(`${useServerURL()}/address/${hash}/blobs`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchAddressDelegations = async ({ hash, limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/address/${hash}/delegations`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchAddressRedelegations = async ({ hash, limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/address/${hash}/redelegations`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchAddressUndelegations = async ({ hash, limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/address/${hash}/undelegations`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}
