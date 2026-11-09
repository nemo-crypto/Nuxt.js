<script setup>
/** Components: Modules */
import ValidatorOverview from "@/components/modules/validator/ValidatorOverview.vue"

/** API */
import { fetchValidatorByID } from "@/services/api/validator"

/** UI */
import Button from "@/components/ui/Button.vue"

/** Store */
import { useCacheStore } from "@/store/cache"
const cacheStore = useCacheStore()

const route = useRoute()
const router = useRouter()

const validator = ref()
const { data: rawValidator } = await fetchValidatorByID(route.params.id)

if (!rawValidator.value) {
	router.push("/")
} else {
	validator.value = rawValidator.value
	cacheStore.current.validator = validator.value
}

defineOgImage("ValidatorImage", {
	title: "Validator",
	validator: validator.value,
})

useHead({
	title: `Validator ${validator.value?.moniker} - Nubit Explorer`,
	link: [
		{
			rel: "canonical",
			href: `https://www.explorer.nubit.org${route.path}`,
		},
	],
	meta: [
		{
			name: "description",
			content: `Validator ${validator.value?.moniker} blocks, metadata, uptime, rates, social links, contacts and other data.`,
		},
		{
			name: "keywords",
			content:
				"Nubit, Bitcoin, Data Availability, Data Availability Layer, DA, Data Layer, Secured by Bitcoin, Polychain, Bitcoin DA, BTC DA, Scalable Blockchain, Secure Blockchain, Blockchain Innovation, Bitcoin Security, Data Infrastructure, Cryptocurrency, Blockchain Technology, Bitcoin Ecosystem, Data Scalability,  Blockchain Development, Polychain Capital",
		},
		{
			property: "og:title",
			content: `Validator ${validator.value?.moniker} - Nubit Explorer`,
		},
		{
			property: "og:description",
			content: `Validator ${validator.value?.moniker} blocks, metadata, uptime, rates, social links, contacts and other data.`,
		},
		{
			name: "twitter:title",
			content: `Validator ${validator.value?.moniker} - Nubit Explorer`,
		},
		{
			name: "twitter:description",
			content: `Validator ${validator.value?.moniker} blocks, metadata, uptime, rates, social links, contacts and other data.`,
		}
	],
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
