export default defineNitroPlugin((nitroApp) => {
	nitroApp.hooks.hook("error", (error, { event }) => {
		if (!event || event.node.res.headersSent) return
		const status = Number((error as { statusCode?: number }).statusCode || 500)
		if (status < 400) return
		setHeader(event, "X-Robots-Tag", "noindex, follow")
		if (status === 503) setHeader(event, "Retry-After", "60")
	})
	nitroApp.hooks.hook("beforeResponse", (event, { body }) => {
		const status = body instanceof Response ? body.status : getResponseStatus(event)
		if (status < 400) return
		setHeader(event, "X-Robots-Tag", "noindex, follow")
		if (status === 503) setHeader(event, "Retry-After", "60")
	})
})
