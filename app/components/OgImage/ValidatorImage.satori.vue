<script setup>
/** Services */
import { abbreviate } from "@/services/utils"

defineOptions({
	inheritAttrs: false,
})

const props = defineProps({
	title: String,
	validator: Object,
})

const bgStyles = computed(() => {
	return {
		style: {
			position: "absolute",
			top: "0",
			left: "0",
			filter: "grayscale(1)",
			opacity: "0.05",
		},
	}
})
</script>

<template>
	<div class="w-full h-full" :style="{ background: '#111111', padding: '100px 80px', fontFamily: 'IBM Plex Mono' }">
		<img src="/img/bg.png" v-bind="bgStyles" />

		<div :style="{ height: '100%', display: 'flex', flexDirection: 'column', gap: '50px' }">
			<div :style="{ display: 'flex', alignItems: 'center' }">
				<span :style="{ fontSize: '60px', color: 'rgba(255,255,255, 0.9)' }">validator</span>
				<span :style="{ fontSize: '60px', color: 'rgba(255,255,255, 0.3)' }">('</span>
				<span :style="{ fontSize: '40px', color: '#FF8351' }"> nubitvaloper•••{{ validator.address.slice(-4) }} </span>
				<span :style="{ fontSize: '60px', color: 'rgba(255,255,255, 0.3)' }">')</span>
			</div>

			<span :style="{ fontSize: '46px', color: 'rgba(255,255,255, 0.9)' }">
				{{ validator.moniker }}
			</span>

			<div :style="{ display: 'flex', gap: '12px' }">
				<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.3)' }">Voting Power: </span>
				<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.6)' }">{{ abbreviate(validator.voting_power) }} NUB</span>
			</div>
		</div>
		<div :style="{ display: 'flex', flexDirection: 'column', gap: '24px' }">
			<div v-if="validator.website" :style="{ display: 'flex', gap: '12px' }">
				<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.3)' }">{{ validator.website }} </span>
			</div>
		</div>
	</div>
</template>
