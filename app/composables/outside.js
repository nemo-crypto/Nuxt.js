/**
 * Vendor
 */
import { ref, isRef, watch } from "vue"

export function useOutside(el, onOutsidePressCallback) {
	const { value: element } = isRef(el) ? el : ref(el)

	const component = element ? element : el.value

	const handler = (e) => {
		/** resolve collisions */
		if (
			element?.parentNode.closest("div[data-outside]") &&
			element?.parentNode.closest("div[data-outside]").id !== e.target.parentNode.id
		)
			return

		return component && !component.contains(e.target) && onOutsidePressCallback(e)
	}

	const ua = navigator.userAgent

	return useEvent(document, ua.match(/iPad/i) || ua.match(/iPhone/) ? "touchstart" : "mousedown", handler, { passive: true })
}

export function useEvent(el, name, listener, options) {
	let remove = () => {}

	if (el) {
		const element = isRef(el) ? el : ref(el)

		const removeEventListener = (e) => e.removeEventListener(name, listener)
		const addEventListener = (e) => {
			e.addEventListener(name, listener, options)
		}

		const removeWatch = watch(
			element,
			(n, _, cleanUp) => {
				if (n) {
					addEventListener(n)
					cleanUp(() => removeEventListener(n))
				}
			},
			{ immediate: true },
		)

		remove = () => {
			removeEventListener(element.value)
			removeWatch()
		}
	}

	return remove
}
