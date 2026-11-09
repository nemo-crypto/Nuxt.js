<script setup>
/** Store */
import { useNotificationsStore } from "@/store/notifications"
const notificationsStore = useNotificationsStore()

const props = defineProps({
	text: {
		type: [String, Number],
	},
	size: {
		type: String,
		default: "14",
	},
})

const isCopied = ref(false)

const handleCopy = (target) => {
	window.navigator.clipboard.writeText(target)

	notificationsStore.create({
		notification: {
			type: "info",
			icon: "check",
			title: "Successfully copied to clipboard",
			autoDestroy: true,
		},
	})

	isCopied.value = true
	setTimeout(() => {
		isCopied.value = false
	}, 1500)
}
</script>

<template>
	<img v-if="!isCopied" @click.prevent.stop="handleCopy(text)" :width="size" :height="size" src="/img/copy.svg" />
	<Icon v-if="isCopied"  @click.prevent.stop="" name="check" :size="size" :color="!isCopied ? 'yellowNew' : 'yellowNew'" class="copyable" />
</template>
