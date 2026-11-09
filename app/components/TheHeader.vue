<script setup>
/**
 * Composable
 */
import { useOutside } from "@/composables/outside"

/** Services */
import { isMac, getNetworkName } from "@/services/utils/general"

/** UI */
import { Dropdown, DropdownItem, DropdownTitle } from "@/components/ui/Dropdown"
import Tooltip from "@/components/ui/Tooltip.vue"
import Button from "@/components/ui/Button.vue"
import Kbd from "@/components/ui/Kbd.vue"
import Connection from "@/components/Connection.vue"

/** Store */
import { useAppStore } from "@/store/app"
const appStore = useAppStore()

const route = useRoute()

let removeOutside = null
const headerEl = ref(null)
const showPopup = ref(false)

const head = computed(() => appStore.lastHead)

const featurePreviewMode = ref(false)

onMounted(async () => {
	featurePreviewMode.value = localStorage.featurePreview
})

watch(
	() => showPopup.value,
	() => {
		if (showPopup.value === true) {
			nextTick(() => {
				removeOutside = useOutside(headerEl.value.wrapper, () => {
					showPopup.value = false
				})
			})
		} else {
			removeOutside()
		}
	},
)

const isActive = (link) => {
	const splittedPath = route.path.split("/").filter(Boolean)

	switch (link) {
		case "index":
			return route.path === "/"

		case "txs":
			return splittedPath.includes("tx") || splittedPath.includes("txs")

		case "blocks":
			return splittedPath.includes("block") || splittedPath.includes("blocks")

		case "namespaces":
			return splittedPath.includes("namespace") || splittedPath.includes("namespaces")

		case "validators":
			return splittedPath.includes("validator") || splittedPath.includes("validators")

		case "addresses":
			return splittedPath.includes("address") || splittedPath.includes("addresses")

		default:
			break
	}
}

const handleNavigate = (url) => {
	window.location.replace(url)
}

</script>

<template>
	<Flex tag="header" ref="headerEl" justify="center" wide :class="$style.wrapper">
		<Flex align="center" justify="between" wide :class="$style.container">
			<Flex align="center" gap="8">
				<Flex @click="showPopup = !showPopup" align="center" gap="8" :class="[$style.button, $style.menu]">
					<Icon v-if="showPopup" name="close" size="22" color="redNew" />
					<img  v-if="!showPopup"  width="22" height="22" src="/img/menu_h5.png" />
				</Flex>
			</Flex>

			<Flex align="center" gap="8">
				<NuxtLink to="/">
					<Flex align="center" gap="12">
						<img :class="$style.logoNew" src="/img/logoNew.png" />
					</Flex>
				</NuxtLink>
			</Flex>

			<Flex justify="center" align="center" wrap="wrap" gap="8" :class="$style.links">
				<NuxtLink to="/" :class="[$style.link, isActive('index') && $style.active]">
					<Text class="hvr-grow" size="16" weight="600" color="tertiary">Home</Text>
				</NuxtLink>

				<NuxtLink to="/txs" :class="[$style.link, isActive('txs') && $style.active]">
					<Text class="hvr-grow" size="16" weight="600" color="tertiary">Transactions</Text>
				</NuxtLink>

				<NuxtLink to="/blocks" :class="[$style.link, isActive('blocks') && $style.active]">
					<Text class="hvr-grow" size="16" weight="600" color="tertiary">Blocks</Text>
				</NuxtLink>

				<NuxtLink to="/validators" :class="[$style.link, isActive('validators') && $style.active]">
					<Text class="hvr-grow" size="16" weight="600" color="tertiary">Validators</Text>
				</NuxtLink>

				<NuxtLink to="/namespaces" :class="[$style.link, isActive('namespaces') && $style.active]">
					<Text class="hvr-grow" size="16" weight="600" color="tertiary">Namespaces</Text>
				</NuxtLink>

				<NuxtLink to="/addresses" :class="[$style.link, isActive('addresses') && $style.active]">
					<Text class="hvr-grow" size="16" weight="600" color="tertiary">Addresses</Text>
				</NuxtLink>

			</Flex>

			<Flex align="center" gap="20" :class="$style.menuRight">
				<!-- <Connection  />  -->
				
				<a class="hvr-pulse-grow" href="https://twitter.com/Nubit_org" target="_blank">
					<img width="20" height="20" src="/img/icon-twitter.svg" />
				</a>
				<a class="hvr-pulse-grow" href="https://discord.gg/nubit" target="_blank">
					<img width="24" height="24" src="/img/icon-discord2.svg" />
				</a>
				<a class="hvr-pulse-grow" href="https://github.com/RiemaLabs" target="_blank">
					<img width="24" height="24" src="/img/icon-github.svg" />
				</a>
			</Flex>
		</Flex>

		<Flex v-if="showPopup" @click="showPopup = false" direction="column" gap="8" :class="$style.menu_popup">
			<NuxtLink to="/" :class="[$style.link, isActive('index') && $style.active]">
				<Text class="animate__animated animate__fadeInDown" size="14" weight="600"
					color="tertiary">Home</Text>
			</NuxtLink>

			<NuxtLink to="/txs" :class="[$style.link, isActive('txs') && $style.active]">
				<Text class="animate__animated animate__fadeInDown" size="14" weight="600"
					color="tertiary">Transactions</Text>
			</NuxtLink>

			<NuxtLink to="/blocks" :class="[$style.link, isActive('blocks') && $style.active]">
				<Text class="animate__animated animate__fadeInDown" size="14" weight="600"
					color="tertiary">Blocks</Text>
			</NuxtLink>

			<NuxtLink to="/validators" :class="[$style.link, isActive('validators') && $style.active]">
				<Text class="animate__animated animate__fadeInDown" size="14" weight="600"
					color="tertiary">Validators</Text>
			</NuxtLink>

			<NuxtLink to="/namespaces" :class="[$style.link, isActive('namespaces') && $style.active]">
				<Text class="animate__animated animate__fadeInDown" size="14" weight="600"
					color="tertiary">Namespaces</Text>
			</NuxtLink>

			<NuxtLink to="/addresses" :class="[$style.link, isActive('addresses') && $style.active]">
				<Text class="animate__animated animate__fadeInDown" size="14" weight="600"
					color="tertiary">Addresses</Text>
			</NuxtLink>

		</Flex>
	</Flex>
</template>

<style module>

.wrapper {
	position: relative;
	background: rgba(34, 34, 34, 1);
    box-shadow: 0 0 29px -9px #ff6b00;
	height: 72px;
	position: fixed;
	top: 0;
	background-color: #222;
	z-index: 2;
	
	.logoNew {
		height: 30px;
		margin-left: -170px;
	}
}

.menuRight {
	/* display: block; // wallet */ 
	min-width: 180px;
    display: flex;
	justify-content: end;
}

.container {
	max-width: var(--base-width);

	margin: 0 24px;
}

.logo {
	box-sizing: content-box;
	background: linear-gradient(225deg, #1e804d, #093a21);
	box-shadow: inset 0 0 0 1px var(--op-10);
	cursor: pointer;
	border-radius: 8px;

	padding: 6px;
}

.logo_name {
	fill: var(--logo-name);
}

.link {
	display: flex;
	align-items: center;

	height: 26px;

	background: transparent;
	border-radius: 50px;

	padding: 0 10px;

	transition: all 0.1s ease;

	&:hover {

		& span {
			color: #F33928;
		}
	}

	& span {
		transition: all 0.1s ease;
		color: var(--txt-secondary);
		padding: 10px 0;
	}

	&.active {

		& span {
			color: #F33928;
			border-bottom: 2px solid #F33928;
		}
	}
}

.menu_popup {
	position: absolute;
	top: 72px;
	left: 0;
	right: 0;

	display: none;

	background: var(--app-background);
	border-top: 2px solid var(--op-5);
	border-bottom: 2px solid var(--op-5);

	padding: 16px;

	z-index: 100;
}

.button {
	cursor: pointer;
	padding: 0 8px;
	transition: all 0.2s ease;

	&.menu {
		display: none;
	}
}

.status {
	width: 5px;
	height: 5px;
	border-radius: 50px;

	&.green {
		background: var(--green);

		box-shadow: 0 0 6px var(--green);
	}

	&.red {
		background: var(--red);

		box-shadow: 0 0 6px var(--red);
	}
}

.network {
	height: 28px;

	border-radius: 8px;
	background: var(--op-5);
	box-shadow: inset 0 0 0 1px var(--op-5);

	padding: 0 12px;

	&:hover {
		.name {
			color: var(--txt-primary);
		}
	}
}

.globalSearchButton {
	border: 1px solid rgba(255, 149, 2, 1);
	height: 40px !important;
}

@media (max-width: 850px) {

	.wrapper .logoNew {
		margin-left: -80px;
		height: 25px;
	}

	.links {
		display: none;
	}

	.button.menu {
		display: flex;
	}

	.menu_popup {
		display: flex;
		height: 100vh;
	}
}

@media (max-width: 500px) {
	.container {
		margin: 0 12px;
	}

	.menuRight {
		display: none;
	}
}

@media (max-width: 400px) {
	.logo_name {
		display: none;
	}
}
</style>
