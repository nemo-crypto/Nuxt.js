/** Services */
import { useServerURL } from "@/services/config"

export const fetchHead = async () => {
	try {
		const data = await $fetch(`${useServerURL()}/head`)
		return data
	} catch (error) {
		console.error(error)
	}
}

export const fetchConstants = async () => {
	try {
		const data = await $fetch(`${useServerURL()}/constants`)
		return data
	} catch (error) {
		console.error(error)
	}
}
