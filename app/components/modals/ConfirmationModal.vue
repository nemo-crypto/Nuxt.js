<script setup>
/**
 * UI
 */
import Button from "@/components/ui/Button.vue"
import Modal from "@/components/ui/Modal.vue"

/**
 * Store
 */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()

defineProps({
	show: Boolean,
})

const handleConfirm = () => {
	appStore.confirmation.confirmCb()
}

const handleCancel = () => {
	appStore.confirmation.cancelCb()
}
</script>

<template>
	<Modal :show="show" width="500" required z-index="1005">
		<Flex direction="column" gap="16">
			<Flex direction="column" gap="8">
				<Text size="14" weight="500" color="primary">
					{{ appStore.confirmation.title }}
				</Text>
				<Text size="13" weight="400" color="tertiary" height="160">
					{{ appStore.confirmation.description }}
				</Text>
			</Flex>

			<Flex gap="8">
				<Button
					@click="handleConfirm"
					:type="appStore.confirmation.buttons.confirm.color ? appStore.confirmation.buttons.confirm.color : 'secondary'"
					size="small"
					block
				>
					{{ appStore.confirmation.buttons.confirm.title }}
				</Button>
				<Button @click="handleCancel" type="secondary" size="small" block>
					{{ appStore.confirmation.buttons.cancel.title }}
				</Button>
			</Flex>
		</Flex>
	</Modal>
</template>
