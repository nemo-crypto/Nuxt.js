<script setup>
/**
 * Vendor
 */
import { ref, watch, nextTick, onBeforeUnmount } from "vue"
import * as focusTrap from "focus-trap"

/**
 * Composable
 */
import { useOutside } from "@/composables/outside"

const props = defineProps({
	side: {
		type: String,
		default: "bottom",
		validator: (value) => {
			return ["top", "bottom", "left", "right"].includes(value)
		},
	},
	position: {
		type: String,
		default: "start",
		validator: (value) => {
			return ["start", "end"].includes(value)
		},
	},

	forceOpen: Boolean,
	disabled: Boolean,

	width: {
		type: String,
		default: null,
	},
	height: {
		type: String,
		default: null,
	},
	fullWidth: {
		type: Boolean,
		default: false,
	},
	customPosition: {
		type: Object,
	},

	verticalOverflow: {
		type: Boolean,
		default: false,
	},
})

const emit = defineEmits(["onClose"])

const trigger = ref(null)
const dropdown = ref(null)
const isOpen = ref(false)
const trap = ref({})

watch(
	() => props.forceOpen,
	() => {
		isOpen.value = props.forceOpen
	},
)

const toggleDropdown = (event) => {
	if (event) event.stopPropagation()
	if (props.disabled) return
	isOpen.value = !isOpen.value
}
const close = (event) => {
	if (event) event.stopPropagation()

	isOpen.value = false

	emit("onClose")
}

const dropdownStyles = ref({})

let removeOutside
const handleOutside = (e) => {
	const path = e.path ? e.path : e.composedPath()
	if (path.find((el) => el.id === "trigger")) {
		return
	} else {
		close()
	}
}

watch(isOpen, () => {
	if (!isOpen.value) {
		trap.value.deactivate()
		removeOutside()

		if (Object.prototype.hasOwnProperty.call(dropdownStyles.value, "top")) {
			delete dropdownStyles.value.top
		}
		if (Object.prototype.hasOwnProperty.call(dropdownStyles.value, "bottom")) {
			delete dropdownStyles.value.bottom
		}

		document.removeEventListener("keydown", onKeydown)
	} else {
		document.addEventListener("keydown", onKeydown)

		const triggerRect = trigger.value.getBoundingClientRect()

		if (props.width) {
			dropdownStyles.value.width = `${props.width}px`
		}

		if (props.fullWidth) {
			dropdownStyles.value.width = `${triggerRect.width}px`
		}

		switch (props.position) {
			case "start":
				dropdownStyles.value.right = `${window.innerWidth - triggerRect.x - triggerRect.width}px`
				break

			case "end":
				dropdownStyles.value.left = `${triggerRect.x}px`
				break
		}

		nextTick(() => {
			trap.value = focusTrap.createFocusTrap(dropdown.value.$el, {
				initialFocus: false,
			})
			trap.value.activate()

			/** Check if there is enough space to open (top/bottom) */
			const dropdownRect = dropdown.value.$el.getBoundingClientRect()

			switch (props.side) {
				case "top":
					if (triggerRect.top < dropdownRect.height) {
						dropdownStyles.value.top = `${triggerRect.y + triggerRect.height + 8}px`
					} else {
						dropdownStyles.value.bottom = `${window.innerHeight - triggerRect.y + 8}px`
					}
					break

				case "bottom":
					if (window.innerHeight - dropdownRect.height - triggerRect.top < 50) {
						dropdownStyles.value.bottom = `${window.innerHeight - triggerRect.y + 8}px`
					} else {
						dropdownStyles.value.top = `${triggerRect.y + triggerRect.height + 8}px`
					}
					break
			}

			if (props.customPosition) {
				delete dropdownStyles.value.top
				delete dropdownStyles.value.bottom
				delete dropdownStyles.value.left
				delete dropdownStyles.value.right

				dropdownStyles.value = { ...props.customPosition }
			}

			if (props.height) dropdownStyles.value.maxHeight = props.height
			if (props.verticalOverflow) dropdownStyles.value.overflowY = "auto"

			removeOutside = useOutside(dropdown.value.wrapper, handleOutside)
		})
	}
})

onBeforeUnmount(() => {
	if (trap.value.active) trap.value.deactivate()
	if (removeOutside) removeOutside()
	document.removeEventListener("keydown", onKeydown)
})

const onKeydown = (event) => {
	if (event.key === "Escape") close()
	if (event.key === "Enter") {
		document.activeElement.click()
	}

	if (event.key === "ArrowDown") {
		const itemsToNavigate = dropdown.value.wrapper.querySelectorAll('[tabindex = "1"]')
		const activeItemIdx = [...itemsToNavigate].findIndex((item) => item.isEqualNode(document.activeElement))

		if (activeItemIdx === -1 || activeItemIdx === itemsToNavigate.length - 1) {
			itemsToNavigate[0].focus()
		} else {
			itemsToNavigate[activeItemIdx + 1].focus()
		}
	}

	if (event.key === "ArrowUp") {
		const itemsToNavigate = dropdown.value.wrapper.querySelectorAll('[tabindex = "1"]')
		const activeItemIdx = [...itemsToNavigate].findIndex((item) => item.isEqualNode(document.activeElement))

		if (activeItemIdx === -1 || activeItemIdx === 0) {
			itemsToNavigate[itemsToNavigate.length - 1].focus()
		} else {
			itemsToNavigate[activeItemIdx - 1].focus()
		}
	}
}
</script>

<template>
	<div :class="$style.wrapper">
		<div ref="trigger" id="trigger" @click="toggleDropdown" :class="$style.trigger">
			<slot />
			<slot name="trigger" :isOpen="isOpen" />
		</div>

		<ClientOnly>
			<teleport to="#dropdown">
				<div v-if="isOpen" :class="$style.canvas" />

				<Transition name="fastfade">
					<Flex
						v-if="isOpen"
						ref="dropdown"
						@click="close"
						:class="[$style.dropdown, dropdownStyles.top ? $style.transform_origin_top : $style.transform_origin_bottom]"
						:style="{
							...dropdownStyles,
						}"
						direction="column"
						gap="4"
					>
						<slot name="popup" />
					</Flex>
				</Transition>
			</teleport>
		</ClientOnly>
	</div>
</template>

<style module>
.wrapper {
	position: relative;
}

.trigger {
	width: fit-content;
}

.canvas {
	position: fixed;
	inset: 0;
	z-index: 2000;
}

.dropdown {
	position: fixed;
	z-index: 2001;

	border-radius: 5px;
	background: var(--card-background);
	box-shadow: rgb(0 0 0 / 20%) 0px 2px 6px;
	border: 1px solid var(--op-5);

	padding: 4px 0;
}

.dropdown.transform_origin_top {
	transform-origin: top;
}

.dropdown.transform_origin_bottom {
	transform-origin: bottom center;
}
</style>
