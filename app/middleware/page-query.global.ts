export default defineNuxtRouteMiddleware((to) => {
	const page = to.query.page
	if (page === undefined) return
	if (typeof page !== "string" || !/^[1-9]\d*$/.test(page) || !Number.isSafeInteger(Number(page))) {
		throw createError({ statusCode: 404, statusMessage: "Page not found" })
	}
})
