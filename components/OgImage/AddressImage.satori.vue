<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** Services */
import { tia, comma } from "@/services/utils"

defineOptions({
	inheritAttrs: false,
})

const props = defineProps({
	title: String,
	address: Object,
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
	<div class="w-full h-full" :style="{ background: '#111111', padding: '100px 120px', fontFamily: 'IBM Plex Mono' }">
		<img src="/img/bg.png" v-bind="bgStyles" />

		<div :style="{ height: '100%', display: 'flex', flexDirection: 'column', gap: '40px' }">
			<div :style="{ display: 'flex', alignItems: 'center' }">
				<span :style="{ fontSize: '70px', color: 'rgba(255,255,255, 0.9)' }">addr</span>
				<span :style="{ fontSize: '70px', color: 'rgba(255,255,255, 0.3)' }">('</span>
				<span :style="{ fontSize: '70px', color: '#FF8351' }"> nubit•••{{ address.hash.slice(-4) }} </span>
				<span :style="{ fontSize: '70px', color: 'rgba(255,255,255, 0.3)' }">')</span>
			</div>

			<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.7)' }"> {{ comma(tia(address.balance.spendable)) }} NUB </span>

			<div :style="{ display: 'flex', flexDirection: 'column', gap: '24px' }">
				<div :style="{ display: 'flex', gap: '12px' }">
					<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.3)' }">First Height: </span>
					<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.6)' }">{{ comma(address.first_height) }} </span>
				</div>
				<div :style="{ display: 'flex', gap: '12px' }">
					<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.3)' }">Last Height: </span>
					<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.6)' }">{{ comma(address.last_height) }} </span>
				</div>
			</div>
		</div>
	</div>
</template>
