import { sha256 } from "js-sha256"
import { Tree } from "./tree"

const shareSize = 512
const subTreeRootThreshold = 64

export function prepareBlob(signer, ns, data) {
	ns = ns.replace("0x", "").padStart(56, "0")
	data = data.replace("0x", "")

	let blob = {
		namespace_id: hex2Bytes(ns),
		version: 0,
		share_version: 0,
		data: hex2Bytes(data),
	}

	let pfb = newMsgSubmitBlobPayment(signer, blob)
	let msg = pfb.serializeBinary()

	let decodableBlob = new window.proto.Blob()
	decodableBlob.setData(fromHexString(data))
	decodableBlob.setNamespaceId(fromHexString(ns))
	decodableBlob.setShareVersion(0)
	decodableBlob.setNamespaceVersion(0)

	return [msg, decodableBlob, blob.data.length]
}

function newMsgSubmitBlobPayment(signer, blob) {
	if (blob.version > 255 || !supportedVersion(blob.version)) {
		console.error("invalid version", blob.version)
		return
	}

	if (reserved(blob.namespace_id)) {
		console.error("try to send to reserved namespace", blob.namespace_id)
		return
	}

	if (blob.data.length === 0) {
		console.error("try to send empty blob")
		return
	}

	if (!supportedShareVersion(blob.share_version)) {
		console.error("unsupported share version")
		return
	}

	let namespace = new Uint8Array(29)
	namespace.set([blob.version])
	namespace.set(blob.namespace_id, 1)

	let commitment = createCommitments(blob)

	let pfb = new window.proto.MsgSubmitBlobPayment()
	pfb.setSigner(signer)
	pfb.addNamespaces(namespace)
	pfb.addBlobSizes(blob.data.length)
	pfb.addShareCommitments(commitment)
	pfb.addShareVersions(blob.share_version)
	return pfb
}

export function hex2Bytes(hex) {
	var arr = []
	for (var i = 0; i < hex.length; i += 2) arr.push(parseInt(hex.substr(i, 2), 16))
	return arr
}

function int32ToBytes(i) {
	var arr = [0, 0, 0, 0]
	for (let index = arr.length - 1; index > -1; index--) {
		var byte = i & 0xff
		arr[index] = byte
		i = i >> 8
	}
	return arr
}

function reserved(nsId) {
	return isPrimaryReserved(nsId) || isSecondaryReserved(nsId)
}

function isPrimaryReserved(nsId) {
	var reserved = true
	for (let i = 0; i < nsId.length - 1; i++) {
		if (nsId[i] !== 0) {
			reserved = false
			break
		}
	}
	return reserved
}

function isSecondaryReserved(nsId) {
	var reserved = true
	for (let i = 0; i < nsId.length - 1; i++) {
		if (nsId[i] !== 0xff) {
			reserved = false
			break
		}
	}
	return reserved && nsId[nsId.length - 1] === 0
}

function supportedVersion(version) {
	return version === 0
}

function supportedShareVersion(version) {
	return version === 0
}

export function createCommitments(blob) {
	let shares = createShares(blob)
	let stw = subTreeWidth(shares.length, subTreeRootThreshold)
	let treeSizes = merkleMountainRangeSizes(shares.length, stw)

	let leafSets = []
	let cursor = 0
	for (let i = 0; i < treeSizes.length; i++) {
		let s = shares.slice(cursor, cursor + treeSizes[i])
		leafSets.push(sharesToBytes(s))
		cursor += treeSizes[i]
	}

	let subTreeRoots = []
	for (let i = 0; i < leafSets.length; i++) {
		const tree = new Tree(sha256.digest)
		for (let j = 0; j < leafSets[i].length; j++) {
			let leaf = [blob.version]
			leaf.push(...blob.namespace_id)
			leaf.push(...leafSets[i][j])
			tree.push(leaf)
		}
		let root = tree.getRoot()
		subTreeRoots.push(root)
	}

	return hashFromByteSlices(subTreeRoots)
}

function infoByte(version, isFirstShare) {
	let prefix = version << 1
	return isFirstShare ? prefix + 1 : prefix
}

function createShares(blob) {
	let shares = []
	var [share, left] = createCompactShare(blob, blob.data, true)
	shares.push(share)

	while (left !== undefined) {
		;[share, left] = createCompactShare(blob, left, false)
		shares.push(share)
	}

	return shares
}

function createCompactShare(blob, data, isFirstShare) {
	let shareData = [blob.version]
	shareData.push(...blob.namespace_id)
	shareData.push(infoByte(blob.version, isFirstShare))
	if (isFirstShare) {
		shareData.push(...int32ToBytes(data.length))
	}
	let padding = shareSize - shareData.length

	if (padding >= data.length) {
		shareData.push(...data)
		for (let i = data.length; i < padding; i++) {
			shareData.push(0)
		}
		return [shareData, undefined]
	}

	shareData.push(...data.slice(0, padding))
	return [shareData, data.slice(padding, data.length)]
}

function subTreeWidth(sharesCount, threshold) {
	let s = Math.floor(sharesCount / threshold)
	if (sharesCount % threshold != 0) {
		s++
	}
	s = roundUpPowerOfTwo(s)
	let minSquareSize = roundUpPowerOfTwo(Math.ceil(Math.sqrt(s)))
	return minSquareSize < s ? minSquareSize : s
}

function roundUpPowerOfTwo(s) {
	let pwr = 1
	while (pwr < s) {
		pwr <<= 1
	}
	return pwr
}

function roundDownPowerOfTwo(s) {
	let pwr = roundUpPowerOfTwo(s)
	if (pwr === s) return pwr
	return pwr / 2
}

function merkleMountainRangeSizes(totalSize, maxTreeSize) {
	let treeSizes = []

	while (totalSize > 0) {
		if (totalSize >= maxTreeSize) {
			treeSizes.push(maxTreeSize)
			totalSize -= maxTreeSize
		} else {
			let size = roundDownPowerOfTwo(totalSize)
			treeSizes.push(size)
			totalSize -= treeSizes
		}
	}

	return treeSizes
}

function sharesToBytes(shares) {
	let bytes = []
	for (let i = 0; i < shares.length; i++) {
		bytes.push(shares[i])
	}
	return bytes
}

function hashFromByteSlices(slices) {
	if (slices.length === 0) {
		return new Uint8Array(0)
	}
	if (slices.length === 1) {
		let arr = [0]
		arr.push(...slices[0])
		return hash(arr)
	}

	let sp = getSplitPoint(slices.length)
	let left = hashFromByteSlices(slices.slice(0, sp))
	let right = hashFromByteSlices(slices.slice(sp, slices.length))
	let arr = [1]
	arr.push(...left)
	arr.push(...right)
	return hash(arr)
}

export function getSplitPoint(length) {
	if (length < 1) {
		console.error("Trying to split a tree with size < 1")
		return 0
	}
	let b = 0
	for (let i = 1; i < length; i <<= 1) {
		b++
	}
	let k = 1 << (b - 1)
	if (k === length) {
		k >>= 1
	}
	return k
}

export const fromHexString = (hexString) => Uint8Array.from(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)))
export const toHexString = (bytes) => bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "")

function hash(data) {
	return new Uint8Array(sha256.digest(data))
}
