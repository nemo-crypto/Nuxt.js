import { getSplitPoint } from "./encode"

export class Tree {
	constructor(hashFn) {
		this.hashFn = hashFn
		this.leavesHashes = []
	}

	push(data) {
		this.leavesHashes.push(this.hashLeaf(data))
	}

	hashLeaf(data) {
		let nData = []
		nData.push(0)
		nData.push(...data)

		let nId = data.slice(0, 29)
		let hl = []
		hl.push(...nId)
		hl.push(...nId)
		let h = this.hashFn(nData)
		hl.push(...h)
		return hl
	}

	hashNode(left, right) {
		let nId = left.slice(0, 29)
		let nData = []
		nData.push(1)
		nData.push(...left)
		nData.push(...right)

		let hn = []
		hn.push(...nId)
		hn.push(...nId)
		let h = this.hashFn(nData)
		hn.push(...h)
		return hn
	}

	getRoot() {
		return this._computeRoot(0, this.leavesHashes.length)
	}

	_computeRoot(start, end) {
		let l = end - start
		if (l === 0) {
			return this.emptyRoot()
		} else if (l === 1) {
			return this.leavesHashes[0]
		} else {
			let sp = getSplitPoint(l)
			let left = this._computeRoot(start, start + sp)
			let right = this._computeRoot(start + sp, end)
			return this.hashNode(left, right)
		}
	}

	emptyRoot() {
		let root = []
		for (let i = 0; i < 29; i++) {
			root.push(0)
		}
		for (let i = 0; i < 29; i++) {
			root.push(0)
		}
		for (let i = 0; i < 32; i++) {
			root.push(0)
		}
		return root
	}
}
