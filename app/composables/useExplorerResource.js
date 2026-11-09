import { useServerURL } from "@/services/config"
import { getResourceStatus } from "#shared/utils/seo.js"

export async function useExplorerResource(path, { query, first = false } = {}) {
	const { data, error } = await useFetch(`${useServerURL()}${path}`, { query, timeout: 10000, retry: 0 })
	const statusCode = getResourceStatus(data.value, error.value)
	if (statusCode !== 200) {
		throw createError({ statusCode, statusMessage: statusCode === 404 ? "Resource not found" : "Chain data temporarily unavailable", fatal: true })
	}
	return computed(() => first ? data.value[0] : data.value)
}
