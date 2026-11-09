<script setup>
/** Services */
import { fetchHead } from "@/services/api/main"

/** Components */
import ModalsManager from "@/components/modals/ModalsManager.vue"

/** UI */
import Button from "@/components/ui/Button.vue"

/** Store */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()

const router = useRouter()
const error = useError()
useSeoMeta({
	title: () => `${error.value?.statusCode || 500} - Nubit Explorer`,
	robots: "noindex, follow",
})
if (import.meta.server) {
	const event = useRequestEvent()
	if (event) event.node.res.setHeader("X-Robots-Tag", "noindex, follow")
}

onMounted(async () => {
	const data = await fetchHead()
	if (data) appStore.head = data
})

const handleBack = () => {
	router.back()
}

const getGithubIssueLink = computed(() => {
	let link = `https://github.com/RiemaLabs/nubit-da-explorer/issues/new?labels=bug&title=[${error.value.statusCode}] ${error.value.statusMessage || error.value.message
		}`

	if (error.value.statusCode === 500) link += `&body=Link: ${error.value.url}. ${error.value.statusMessage}`

	return link
})
</script>

<template>

	<NuxtLayout>
		<Flex v-if="error" direction="column" gap="24" wide :class="$style.wrapper">
			<Flex direction="column" gap="8">
				<Text size="16" color="support" mono> /** </Text>
				<Text size="20" color="primary" mono style="padding: 0 30px">Error Code {{ error?.statusCode }}</Text>
				<Text size="16" color="support" mono> */ </Text>
			</Flex>

			<Flex direction="column" gap="8">
				<Text v-if="error?.statusCode == 404" size="16" weight="500" color="secondary">
					{{ error?.statusMessage }}
				</Text>
				<Text v-else size="16" weight="500" color="secondary"> Unknown Error </Text>

				<Text v-if="error?.statusCode == 404" size="13" weight="500" height="140" color="tertiary"
					style="max-width: 340px">
					It looks like this is an error and such a page does not exist. If there used to be a page at this
					address and it has
					disappeared - please inform us.
				</Text>
				<Text v-else size="13" weight="500" height="140" color="tertiary" style="max-width: 340px"> Something
					went wrong </Text>
			</Flex>

			<Flex align="center" gap="12" :class="$style.errenBtnArray">
				<Button v-if="error?.statusCode == 404" @click="handleBack" type="secondary" size="small"
					style="width: fit-content" :class="$style.errenBtn">
					<Icon name="arrow-back" size="16" color="secondary" />
					Go Back
				</Button>
				<Button v-else link="/" type="secondary" size="small" style="width: fit-content"
					:class="$style.errenBtn">
					<Icon name="arrow-back" size="16" color="secondary" />
					Back to Explorer
				</Button>

				<Text size="16" weight="500" color="tertiary">or</Text>
				<Button :link="getGithubIssueLink" target="_blank" type="secondary" size="small"
					style="width: fit-content" :class="$style.errenBtn">
					<Icon name="github" size="16" color="secondary" />
					Create Issue
				</Button>
			</Flex>
		</Flex>

		<div id="tooltip" />
		<div id="modal" />
		<div id="dropdown" />
		<div id="popover" />

		<ModalsManager />
		<Notifications />
	</NuxtLayout>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);

	padding: 0 24px;
	margin-top: 120px;
}

.errenBtnArray {
	padding-bottom: 60px;
}

.errenBtn {
	border-radius: 4px 4px 4px 4px !important;
	border: 1px solid rgba(255, 255, 255, 0.6) !important;
	color: #fff !important;
	font-size:  16px !important;
}
</style>
