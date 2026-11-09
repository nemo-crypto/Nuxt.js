<script setup>
/** Components: Modules */
import ValidatorOverview from "@/components/modules/validator/ValidatorOverview.vue"

/** UI */
import Button from "@/components/ui/Button.vue"

/** Store */
import { useCacheStore } from "@/store/cache"
const cacheStore = useCacheStore()

const route = useRoute()

const validator = await useExplorerResource(`/validators/${encodeURIComponent(route.params.id)}`, {})
cacheStore.current.validator = validator.value

defineOgImage("ValidatorImage", {
	title: "Validator",
	validator: validator.value,
})

useExplorerSeo({
	title: () => `Validator ${validator.value?.moniker} - Nubit Explorer`,
	description: () => `Validator ${validator.value?.moniker} blocks, metadata, uptime, rates, social links, contacts and other data.`,
	dynamicImage: true,
})
</script>

<template>
	<Flex direction="column" gap="32" wide :class="$style.wrapper">
		<Flex direction="column" gap="16">
			<Flex align="end" justify="between" :class="$style.breadcrumbs">
				<Breadcrumbs
					v-if="validator"
					:items="[
						{ link: '/', name: 'Home' },
						{ link: '/validators', name: 'Validators' },
						{ link: route.fullPath, name: validator.moniker ? validator.moniker : validator.address },
					]"
				/>
			</Flex>

			<ValidatorOverview v-if="validator" :validator="validator" />
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	max-width: calc(var(--base-width) + 48px);

	padding: 40px 24px 60px 24px;
}

@media (max-width: 500px) {
	.wrapper {
		padding: 32px 12px;
	}
}
</style>
