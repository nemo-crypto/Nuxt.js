<script setup>
/** UI */
import Button from "@/components/ui/Button.vue"
import Spinner from "@/components/ui/Spinner.vue"
import Tooltip from "@/components/ui/Tooltip.vue"
import { Dropdown, DropdownItem, DropdownDivider } from "@/components/ui/Dropdown"

/** Services */
import { suggestChain, getAccounts, disconnect } from "@/services/keplr"
import { chains } from "@/services/chains"

/** API */
import { fetchAddressByHash } from "@/services/api/address"

/** Store */
import { useAppStore } from "@/store/app"
import { useModalsStore } from "@/store/modals"
import { useNotificationsStore } from "@/store/notifications"
const appStore = useAppStore()
const modalsStore = useModalsStore()
const notificationsStore = useNotificationsStore()

const router = useRouter()

const isWalletAvailable = ref(false)
const isFetchingAccounts = ref(false)

const { hostname } = useRequestURL()

switch (hostname) {

	case "localhost":
		appStore.network = chains
		break

	default:
		appStore.network = chains
}


const getBalance = async () => {
	const key = await window.keplr.getKey(appStore.network.chainId)

	if (key) {
		const { data } = await fetchAddressByHash(key.bech32Address)

		if (data.value?.balance) {
			appStore.balance = parseFloat(data.value.balance.spendable / 1_000_000) || 0
		}
	}
}

onMounted(async () => {
	isWalletAvailable.value = !!window.keplr
})

const handleConnect = async () => {
	if (!!window.keplr) {
		try {
			await suggestChain(appStore.network)
			isFetchingAccounts.value = true
			const accounts = await getAccounts(appStore.network)
			if (accounts.length) {
				appStore.address = accounts[0].address
			}
			getBalance()
			isFetchingAccounts.value = false
		} catch (error) {
			switch (error.message) {
				case "Request rejected":
					notificationsStore.create({
						notification: {
							type: "info",
							icon: "close",
							title: "Request rejected",
							description: "You canceled the Keplr wallet request",
							autoDestroy: true,
						},
					})
					break
			}
		}
	} else {
		notificationsStore.create({
			notification: {
				type: "info",
				icon: "check",
				title: "Please install keplr wallet first!",
				autoDestroy: true,
			},
		})
	}

}

const handleDisconnect = () => {
	disconnect()
	appStore.address = undefined
	appStore.balance = 0

	notificationsStore.create({
		notification: {
			type: "info",
			icon: "check",
			title: "Successfully disconnected",
			autoDestroy: true,
		},
	})
}
</script>

<template>
	<div v-if="!appStore?.address" @click="handleConnect" class="hvr-grow" :class="$style.connectWallet">
		<img width="22" height="22" src="/img/connectWallet.svg" />
		<Text :class="$style.connectWalletBtn" size="16" weight="600" color="tertiary">Connect Wallet</Text>
	</div>

	<Dropdown v-else>
		<div :class="$style.connectWallet">
			<Icon name="address" size="18" color="yellowNew" />
			<Text :class="$style.connectWalletBtn" size="14" weight="600" color="tertiary">
				{{ appStore?.address?.slice(0, 8) }}
				...
				{{ appStore?.address?.slice(appStore?.address?.length - 8, appStore?.address?.length) }}
			</Text>
		</div>

		<template #popup>
			<DropdownItem @click="modalsStore.open('send')">
				<img style="margin-right: 8px;" width="22" height="22" src="/img/sendTx.png" />
				Send NUB
			</DropdownItem>
			<DropdownItem @click="modalsStore.open('pfb')">
				<img style="margin-right: 8px;" width="22" height="22" src="/img/sendBlob.png" />
				Submit Blob
			</DropdownItem>
			<DropdownDivider />
			<DropdownItem @click="handleDisconnect">
				<img style="margin-right: 8px;" width="22" height="22" src="/img/logOut.png" />
				Disconnect
			</DropdownItem>
		</template>
	</Dropdown>
</template>

<style module>
.connectWallet {
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	width: 190px;

	.connectWalletBtn {
		color: #ffffff;
		margin-left: 8px;
		margin-left: 8px;
		height: 23px;
		border-bottom: 1px solid #B6B6B6;
	}
}
</style>