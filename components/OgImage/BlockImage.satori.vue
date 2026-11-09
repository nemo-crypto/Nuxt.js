<script setup>
/** Vendor */
import { DateTime } from "luxon"

/** Services */
import { comma, formatBytes } from "@/services/utils"

defineOptions({
	inheritAttrs: false,
})

const props = defineProps({
	title: String,
	block: Object,
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

const messages = computed(() => [...new Set(props.block.message_types)])
</script>

<template>
	<div class="w-full h-full" :style="{ background: '#111111', padding: '100px 120px', fontFamily: 'IBM Plex Mono' }">
		<img src="/img/bg.png" v-bind="bgStyles" />

		<div :style="{ height: '100%', display: 'flex', flexDirection: 'column', gap: '40px' }">
			<div :style="{ display: 'flex' }">
				<span :style="{ fontSize: '70px', color: 'rgba(255,255,255, 0.9)' }"> block </span>
				<span :style="{ fontSize: '70px', color: 'rgba(255,255,255, 0.3)' }">('</span>
				<span :style="{ fontSize: '70px', color: '#FF8351' }">{{ comma(block.height) }}</span>
				<span :style="{ fontSize: '70px', color: 'rgba(255,255,255, 0.3)' }">')</span>
			</div>

			<div :style="{ display: 'flex' }">
				<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.7)' }">
					{{ messages.slice(0, 4).join(", ") }} {{ messages.length > 4 ? `and ${messages.length - 4} more` : "" }}
				</span>
			</div>

			<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.4)' }">{{ DateTime.fromISO(block.time).toFormat("ff") }}</span>

			<div :style="{ display: 'flex', gap: '24px' }">
				<div :style="{ display: 'flex', gap: '12px' }">
					<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.3)' }">Blobs Size: </span>
					<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.6)' }">{{ formatBytes(block.stats.blobs_size) }} </span>
				</div>
			</div>
		</div>
	</div>
</template>
