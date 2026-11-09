/** Store */
import { useNotificationsStore } from "@/store/notifications"

export const parseRedirectQueryError = (query) => {
	const notificationsStore = useNotificationsStore()

	switch (query.error) {
		case "not_found":
			notificationsStore.create({
				notification: {
					type: "info",
					icon: "search",
					title: `Couldn't find any ${query.target} by "${query.id}"`,
					autoDestroy: true,
					delay: 5500,
				},
			})
			break

		default:
			break
	}
}
