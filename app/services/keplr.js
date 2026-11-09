import Long from "long"
import Base64 from "crypto-js/enc-base64"
import Hex from "crypto-js/enc-hex"

import { AuthInfo, Fee, TxBody, TxRaw, SignerInfo } from "./proto/gen/tx"
import { SignMode } from "./proto/gen/signing"
import { PubKey } from "./proto/gen/keys"

export const suggestChain = (network) => {
	return new Promise(async (resolve, reject) => {
		try {
			await window.keplr.experimentalSuggestChain(network)

			await window.keplr.enable(network.chainId)

			resolve({ success: true })
		} catch (error) {
			reject({ success: false, message: error.message })
		}
	})
}

export const disconnect = () => {
	window?.keplr?.disable()
}

export const getAccounts = (network) => {
	return new Promise(async (resolve, reject) => {
		try {
			const offlineSigner = window.getOfflineSigner(network.chainId)
			const accounts = await offlineSigner.getAccounts()
			resolve(accounts)
		} catch (error) {
			reject(error.message)
		}
	})
}

const buildSubmitBlobPayment = (tx, blob) => {
	let blobTx = new proto.BlobTx()
	blobTx.setTx(tx)
	blobTx.setTypeId("BLOB")
	blobTx.addBlobs(blob)
	return blobTx.serializeBinary()
}

export const sendSubmitBlobPayment = async (network, sender, proto, fee, blob) => {
	const account = await fetchAccountInfo(network, sender)
	const { pubKey } = await window.keplr.getKey(network.chainId)

	const tx = TxBody.encode(
		TxBody.fromPartial({
			messages: proto,
			memo: "Sent via Explorer.nubit.org",
		}),
	).finish()

	if (account) {
		const signDoc = {
			bodyBytes: tx,
			authInfoBytes: AuthInfo.encode({
				signerInfos: [
					{
						publicKey: {
							typeUrl: "/cosmos.crypto.secp256k1.PubKey",
							value: PubKey.encode({
								key: pubKey,
							}).finish(),
						},
						modeInfo: {
							single: {
								mode: SignMode.SIGN_MODE_DIRECT,
							},
							multi: undefined,
						},
						sequence: account.sequence,
					},
				],
				fee: Fee.fromPartial({
					amount: fee.amount.map((coin) => {
						return {
							denom: coin.denom,
							amount: coin.amount.toString(),
						}
					}),
					gasLimit: fee.gas,
				}),
			}).finish(),
			chainId: network.chainId,
			accountNumber: Long.fromString(account.account_number),
		}

		const signed = await keplr.signDirect(network.chainId, sender, signDoc)

		const body = buildSubmitBlobPayment(
			TxRaw.encode({
				bodyBytes: signed.signed.bodyBytes,
				authInfoBytes: signed.signed.authInfoBytes,
				signatures: [decodeSignature(signed.signature.signature)],
			}).finish(),
			blob,
		)

		const signedTx = {
			tx: body,
			signDoc: signed.signed,
		}

		const txHash = await broadcastTxSync(network.chainId, signedTx.tx)
		return Buffer.from(txHash).toString("hex")
	}
}

export const simulateMsgs = async (network, sender, proto, fee) => {
	const account = await fetchAccountInfo(network, sender)

	if (account) {
		const unsignedTx = TxRaw.encode({
			bodyBytes: TxBody.encode(
				TxBody.fromPartial({
					messages: proto,
					memo: "",
				}),
			).finish(),
			authInfoBytes: AuthInfo.encode({
				signerInfos: [
					SignerInfo.fromPartial({
						modeInfo: {
							single: {
								mode: SignMode.SIGN_MODE_DIRECT,
							},
							multi: undefined,
						},
						sequence: account.sequence,
					}),
				],
				fee: Fee.fromPartial({
					amount: fee.map((coin) => {
						return {
							denom: coin.denom,
							amount: coin.amount.toString(),
						}
					}),
				}),
			}).finish(),
			signatures: [new Uint8Array(64)],
		}).finish()

		const simulatedResult = await $fetch(`${network.rest}/cosmos/tx/v1beta1/simulate`, {
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({
				tx_bytes: Buffer.from(unsignedTx).toString("base64"),
			}),
		})

		const gasUsed = parseInt(simulatedResult.gas_info.gas_used)
		if (Number.isNaN(gasUsed)) {
			throw new Error(`Invalid integer gas: ${simulatedResult.gas_info.gas_used}`)
		}

		return gasUsed * 1.2
	}

	return undefined
}

export const sendMsgs = async (network, sender, proto, fee) => {
	const account = await fetchAccountInfo(network, sender)
	const { pubKey } = await window.keplr.getKey(network.chainId)

	const tx = TxBody.encode(
		TxBody.fromPartial({
			messages: proto,
			memo: "Sent via Explorer.nubit.org",
		}),
	).finish()

	if (account) {
		const signDoc = {
			bodyBytes: tx,
			authInfoBytes: AuthInfo.encode({
				signerInfos: [
					{
						publicKey: {
							typeUrl: "/cosmos.crypto.secp256k1.PubKey",
							value: PubKey.encode({
								key: pubKey,
							}).finish(),
						},
						modeInfo: {
							single: {
								mode: SignMode.SIGN_MODE_DIRECT,
							},
							multi: undefined,
						},
						sequence: account.sequence,
					},
				],
				fee: Fee.fromPartial({
					amount: fee.amount.map((coin) => {
						return {
							denom: coin.denom,
							amount: coin.amount.toString(),
						}
					}),
					gasLimit: fee.gas,
				}),
			}).finish(),
			chainId: network.chainId,
			accountNumber: Long.fromString(account.account_number),
		}

		const signed = await window.keplr.signDirect(network.chainId, sender, signDoc)

		const signedTx = {
			tx: TxRaw.encode({
				bodyBytes: signed.signed.bodyBytes,
				authInfoBytes: signed.signed.authInfoBytes,
				signatures: [decodeSignature(signed.signature.signature)],
			}).finish(),
			signDoc: signed.signed,
		}

		const txHash = await broadcastTxSync(network.chainId, signedTx.tx)
	}
}

export const fetchAccountInfo = async (network, address) => {
	try {
		const uri = `${network.rest}/cosmos/auth/v1beta1/accounts/${address}`
		const response = await $fetch(uri)
		return response.account
	} catch (e) {
		return undefined
	}
}

export const broadcastTxSync = async (chainId, tx) => {
	return window.keplr.sendTx(chainId, tx, "sync")
}

export const fromHexString = (hexString) => Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)))
function decodeSignature(s) {
	return fromHexString(Base64.parse(s).toString(Hex))
}
