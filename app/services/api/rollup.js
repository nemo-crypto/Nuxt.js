/** Services */
import { useServerURL } from "@/services/config"

export const fetchRollups = async ({ limit, offset, sort, sort_by }) => {
	try {
		const url = new URL(`${useServerURL()}/rollup`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)
		if (sort_by) url.searchParams.append("sort_by", sort_by)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchRollupsCount = async () => {
	try {
		const url = new URL(`${useServerURL()}/rollup/count`)

		const data = await useFetch(url.href)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchRollupByID = async (id) => {
	try {
		const url = new URL(`${useServerURL()}/rollup/${id}`)

		const data = await useFetch(encodeURI(url.href))
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchRollupBySlug = async (slug) => {
	try {
		const url = new URL(`${useServerURL()}/rollup/slug/${slug}`)

		const data = await useFetch(encodeURI(url.href))
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchRollupBlobs = async ({ id, limit, offset, sort, sort_by }) => {
	try {
		const url = new URL(`${useServerURL()}/rollup/${id}/blobs`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)
		if (sort) url.searchParams.append("sort", sort)
		if (sort_by) url.searchParams.append("sort_by", sort_by)

		const data = await useFetch(encodeURI(url.href))
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchRollupNamespaces = async ({ id, limit, offset }) => {
	try {
		const url = new URL(`${useServerURL()}/rollup/${id}/namespaces`)

		if (limit) url.searchParams.append("limit", limit)
		if (offset) url.searchParams.append("offset", offset)

		const data = await useFetch(encodeURI(url.href))
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchRollupExportData = async ({ id, from, to }) => {
	try {
		const url = new URL(`${useServerURL()}/rollup/${id}/export`)

		url.searchParams.append("from", from)
		url.searchParams.append("to", to)

		const data = await useFetch(encodeURI(url.href))
		return data
	} catch (error) {
		console.error(error)
	}
}
