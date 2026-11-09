<script setup>
defineProps({
	hash: {
		type: String,
		required: true,
	},
	color: {
		type: String,
		default: "primary"
	}
})
</script>

<template>
	<NuxtLink :to="`/address/${hash}`" @click.stop>
		<Flex align="center" gap="6">
			<template v-if="hash?.startsWith('nubitvaloper')">
				<Text class="rubik_font" size="13" weight="600" :color="color"> nubitvaloper </Text>

				<Flex align="center" gap="3">
					<div v-for="dot in 3" :key="dot" class="dot rubik_font" />
				</Flex>

				<Text class="rubik_font" size="13" weight="600" :color="color">
					{{ hash?.slice(hash.length - 4, hash.length) }}
				</Text>
			</template>
			<template v-else-if="hash?.startsWith('nubitvalcons')">
				<Text class="rubik_font" size="13" weight="600" :color="color"> nubitvalcons </Text>

				<Flex align="center" gap="3">
					<div v-for="dot in 3" :key="dot" class="dot rubik_font" />
				</Flex>

				<Text class="rubik_font" size="13" weight="600" :color="color">
					{{ hash?.slice(hash.length - 4, hash.length) }}
				</Text>
			</template>
			<template v-else>
				<Text class="rubik_font" size="13" weight="600" :color="color"> nubit </Text>

				<Flex align="center" gap="3">
					<div v-for="dot in 3" :key="dot" class="dot rubik_font" />
				</Flex>

				<Text class="rubik_font" size="13" weight="600" :color="color">
					{{ hash?.slice(hash.length - 4, hash.length) }}
				</Text>
			</template>
		</Flex>
	</NuxtLink>
</template>