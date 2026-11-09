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
	tx: Object,
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

const messages = computed(() => [...new Set(props.tx.message_types)])
</script>

<template>
	<div class="w-full h-full" :style="{ background: '#111111', padding: '100px 120px', fontFamily: 'IBM Plex Mono' }">
		<img src="/img/bg.png" v-bind="bgStyles" />

		<div :style="{ height: '100%', display: 'flex', flexDirection: 'column', gap: '40px' }">
			<div :style="{ display: 'flex', alignItems: 'center', gap: '24px' }">
				<div :style="{ display: 'flex', alignItems: 'center' }">
					<span :style="{ fontSize: '70px', color: 'rgba(255,255,255, 0.9)' }"> tx </span>
					<span :style="{ fontSize: '70px', color: 'rgba(255,255,255, 0.3)' }">('</span>
					<span :style="{ fontSize: '70px', color: '#FF8351' }">
						{{ tx.hash.slice(0, 4).toUpperCase() }}•••{{ tx.hash.slice(-4).toUpperCase() }}
					</span>
					<span :style="{ fontSize: '70px', color: 'rgba(255,255,255, 0.3)' }">')</span>
				</div>

				<svg
					v-if="tx.status === 'success'"
					width="60"
					height="60"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M20.7071 5.29289C21.0976 5.68342 21.0976 6.31658 20.7071 6.70711L9.70711 17.7071C9.31658 18.0976 8.68342 18.0976 8.29289 17.7071L3.29289 12.7071C2.90237 12.3166 2.90237 11.6834 3.29289 11.2929C3.68342 10.9024 4.31658 10.9024 4.70711 11.2929L9 15.5858L19.2929 5.29289C19.6834 4.90237 20.3166 4.90237 20.7071 5.29289Z"
						fill="#0ade71"
						fill-opacity="0.8"
					/>
				</svg>
				<svg v-else width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M18.7071 6.70711C19.0976 6.31658 19.0976 5.68342 18.7071 5.29289C18.3166 4.90237 17.6834 4.90237 17.2929 5.29289L12 10.5858L6.70711 5.29289C6.31658 4.90237 5.68342 4.90237 5.29289 5.29289C4.90237 5.68342 4.90237 6.31658 5.29289 6.70711L10.5858 12L5.29289 17.2929C4.90237 17.6834 4.90237 18.3166 5.29289 18.7071C5.68342 19.0976 6.31658 19.0976 6.70711 18.7071L12 13.4142L17.2929 18.7071C17.6834 19.0976 18.3166 19.0976 18.7071 18.7071C19.0976 18.3166 19.0976 17.6834 18.7071 17.2929L13.4142 12L18.7071 6.70711Z"
						fill="#eb5757"
						fill-opacity="0.8"
					/>
				</svg>
			</div>

			<div :style="{ display: 'flex' }">
				<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.7)' }">
					{{ messages.slice(0, 4).join(", ") }}
					{{ messages.length > 4 ? `and ${messages.length - 4} more` : "" }}
				</span>
			</div>

			<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.4)' }">{{ DateTime.fromISO(tx.time).toFormat("ff") }}</span>

			<div :style="{ display: 'flex', flexDirection: 'column', gap: '24px' }">
				<div :style="{ display: 'flex', gap: '12px' }">
					<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.3)' }">Fee: </span>
					<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.6)' }">{{ tia(tx.fee) }} </span>
					<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.3)' }">NUB</span>
				</div>
				<div :style="{ display: 'flex', gap: '12px' }">
					<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.3)' }">Block: </span>
					<span :style="{ fontSize: '40px', color: 'rgba(255,255,255, 0.6)' }">{{ comma(tx.height) }} </span>
				</div>
			</div>
		</div>
	</div>
</template>
