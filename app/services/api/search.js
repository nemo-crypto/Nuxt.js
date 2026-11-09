/** Services */
import { useServerURL } from "@/services/config"

export const search = async (query) => {
	try {
		const data = await useFetch(`${useServerURL()}/search?query=${query}`)
		return data
	} catch (error) {
		console.error(error)
	}
}
