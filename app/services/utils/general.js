export const formatBytes = (bytes, decimals = 2) => {
	if (!+bytes) return "0 Byte"

	const dm = decimals < 0 ? 0 : decimals
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"]

	const i = Math.floor(Math.log(bytes) / Math.log(1024))

	return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(dm))} ${sizes[i]}`
}

export const getNamespaceID = (target) => {
	let s = target

	while (s?.startsWith("00")) {
		s = s.substring(2)
	}

	return s
}

export const strToHex = (str) => {
	let hex = ""
	for (let i = 0; i < str.length; i++) {
		const charCode = str.charCodeAt(i)
		const hexValue = charCode.toString(16)

		hex += hexValue.padStart(2, "0")
	}
	return hex
}

export const shortHex = (hex) => {
	if (hex.length > 16) {
		return `${hex.slice(0, 8)} ••• ${hex.slice(-8)}`
	} else {
		return hex
	}
}

export const splitAddress = (address, format = "string") => {
	if (!address) return '--'

	if (address?.startsWith("nubitvaloper")) {
		return format === "array" ? [`nubitvaloper`, address.slice(-4)] : `nubitvaloper ••• ${address.slice(-4)}`
	} else if (address?.startsWith("nubitvalcons")) {
		return format === "array" ? [`nubitvalcons`, address.slice(-4)] : `nubitvalcons ••• ${address.slice(-4)}`
	} else {
		// return format === "array" ? ["nubit", address.slice(-4)] : `nubit ••• ${address.slice(-4)}`
		return format === "array" ? ["nubit", address.slice(-4)] : `nubit ••• ${address.slice(-4)}`
	}
}

export const getNetworkName = () => {
	const { hostname } = useRequestURL()

	switch (hostname) {
		case "nubit.io":
			return "Mainnet"

		case "mocha-4.nubit.io":
			return "Mocha-4"

		case "mocha.nubit.io":
			return "Mocha-4"

		case "arabica.nubit.io":
			return "Arabica"

		case "dev.nubit.io":
			return "Development"

		case "localhost":
			return "Local"

		default:
			return "Unknown"
	}
}

export const isMac = () => {
	return navigator.platform.toUpperCase().indexOf("MAC") >= 0
}

export const isPrefersDarkScheme = () => {
	return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
}

export function reverseMapping(obj) {
	const reversedObj = {}
	Object.entries(obj).forEach(([key, value]) => {
		reversedObj[value] = key
	})
	return reversedObj
}
