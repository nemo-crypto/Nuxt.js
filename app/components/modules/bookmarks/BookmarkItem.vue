<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** UI */
import Button from "@/components/ui/Button.vue"

/** Store */
import { useCacheStore } from "@/store/cache"
import { useModalsStore } from "@/store/modals"
const cacheStore = useCacheStore()
const modalsStore = useModalsStore()

const props = defineProps({
	item: Object,
})
const emit = defineEmits(["onRemove"])

const handleEditBookmarkAlias = () => {
	cacheStore.current.bookmark = props.item
	modalsStore.open("edit_alias")
}

const getIcon = () => {
	switch (props.item.type.toLowerCase()) {
		case "namespace":
			return "namespace"

		case "transaction":
			return "tx"

		case "block":
		case "address":
			return props.item.type.toLowerCase()

		default:
			break
	}
}

const getLink = () => {
	switch (props.item.type.toLowerCase()) {
		case "namespace":
			return `/namespace/${props.item.id}`

		case "transaction":
			return `/tx/${props.item.id}`

		case "block":
			return `/block/${props.item.id}`

		case "address":
			return `/address/${props.item.id}`
	}
}
</script>

<template>
	<NuxtLink :to="getLink()">
		<Flex justify="between" align="center" gap="16" :class="$style.wrapper">
			<Flex align="center" gap="8" :class="$style.content">
				<Icon :name="getIcon()" size="14" color="secondary" />
				<Text v-if="item.alias" size="13" weight="600" color="primary" no-wrap>{{ item.alias }}</Text>
				<Text size="13" weight="600" :color="!item.alias ? 'primary' : 'tertiary'" :class="$style.id">{{ item.id }}</Text>
			</Flex>

			<Flex align="center" gap="16">
				<Text size="13" weight="600" color="tertiary" no-wrap>
					{{
						DateTime.fromSeconds(item.ts / 1_000)
							.setLocale("en")
							.toFormat("ff")
					}}
				</Text>

				<Flex align="center" gap="6">
					<Button @click.prevent="handleEditBookmarkAlias" type="tertiary" size="mini">
						<Icon name="edit" size="14" color="primary" />
					</Button>
					<Button @click.prevent="emit('onRemove')" type="tertiary" size="mini">
						<Icon name="trash" size="14" color="primary" />
					</Button>
				</Flex>
			</Flex>
		</Flex>
	</NuxtLink>
</template>

<style module>
.wrapper {
	border-radius: 6px;
	border: 1px solid var(--op-5);
	background: var(--op-5);

	padding: 4px 4px 4px 8px;
}

.content {
	max-width: 100%;
	min-width: 0;
}

.id {
	text-overflow: ellipsis;
	overflow: hidden;
}

@media (max-width: 900px) {
	.wrapper {
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;

		padding: 8px;
	}
}
</style>
