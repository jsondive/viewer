import { isDefined, unreachable } from "@jsondive/library"
import { builtinAttribute } from "./builtinAttributes"
import { Attribute } from "./Attribute"

export const RootNodeName = Symbol("$root")
export type RootNodeName = typeof RootNodeName

export type NodeName = RootNodeName | string | number

export type NodeInitArgs = {
	name: NodeName
	parent: DiveNode | undefined
	attributes: Map<Attribute<unknown>, unknown>
	children: DiveNode[]
}

export type NodeId = number

/**
 * A generator that yields a list of Nodes.
 */
type NodeGenerator = Generator<DiveNode, void, unknown>

export class DiveNode {
	public readonly id: NodeId
	private _name: NodeName
	private parentRef: WeakRef<DiveNode> | undefined
	// TODO: make this a mutable map? make DiveNode wholly mutable?
	private attributes: Map<Attribute<unknown>, unknown>
	private readonly children: DiveNode[]
	private static nextId = 1
	private frozen = false
	private _childrenByName: Map<NodeName, DiveNode> | undefined

	constructor(args: NodeInitArgs) {
		this.id = DiveNode.nextId++
		this._name = args.name
		this.parentRef = args.parent ? new WeakRef(args.parent) : undefined
		this.attributes = args.attributes
		this.children = args.children
	}

	get name() {
		return this._name
	}

	get parent() {
		return this.parentRef?.deref()
	}

	visitAll(visitor: (node: DiveNode) => void) {
		visitor(this)
		for (const child of this.getChildren()) {
			child.visitAll(visitor)
		}
	}

	freeze() {
		this.visitAll(node => {
			node.frozen = true
		})
	}

	private ensureNotFrozen() {
		if (this.frozen) {
			throw new Error(`Node is frozen`)
		}
	}

	private ensureFrozen() {
		if (!this.frozen) {
			throw new Error(`Node must be frozen`)
		}
	}

	private get childrenByNameString() {
		this.ensureFrozen()

		if (!isDefined(this._childrenByName)) {
			this._childrenByName = new Map(
				this.children.map((child): [NodeName, DiveNode] => [
					child.nameString,
					child,
				])
			)
		}
		return this._childrenByName
	}

	/**
	 * If a node should be replaced, `replacer` returns its replacement.
	 *
	 * The replacement will be correctly reparented and renamed according
	 * to the node it is replacing.
	 *
	 * This operation will throw if any node involved is frozen.
	 */
	replaceAll(replacer: (node: DiveNode) => DiveNode | undefined) {
		this.ensureNotFrozen()
		for (const [index, child] of this.children.entries()) {
			const replaced = replacer(child)
			if (isDefined(replaced)) {
				replaced.ensureNotFrozen()
				replaced._name = child.name
				replaced.parentRef = new WeakRef(this)
				this.children[index] = replaced
			} else {
				child.replaceAll(replacer)
			}
		}
	}

	get nameString() {
		if (typeof this.name === "string") {
			return this.name
		} else if (typeof this.name === "number") {
			return this.name.toString()
		} else if (this.name === RootNodeName) {
			return "$root"
		} else {
			unreachable(this.name)
		}
	}

	getAttribute<T>(attribute: Attribute<T>): T | undefined {
		return this.attributes.get(attribute) as T | undefined
	}

	getChildren(): Iterable<DiveNode> {
		return this.children
	}

	get childCount() {
		return this.children.length
	}

	get firstChild() {
		return this.children.at(0)
	}

	get isRoot() {
		return this.name === RootNodeName
	}

	get pathParts(): string[] {
		if (this.isRoot) {
			return []
		}

		return [...(this.parent ? this.parent.pathParts : []), this.nameString]
	}

	get pathString() {
		return this.pathParts.join(".")
	}

	getChildByPath(parts: string[]): DiveNode | undefined {
		const firstPart = parts.at(0)
		if (isDefined(firstPart)) {
			const child = this.childrenByNameString.get(firstPart)
			return child?.getChildByPath(parts.slice(1))
		} else {
			return this
		}
	}

	*getFlatChildrenAndSelf(): NodeGenerator {
		yield this
		for (const child of this.getChildren()) {
			yield* child.getFlatChildrenAndSelf()
		}
	}

	*getAncestors(): NodeGenerator {
		const parent = this.parent
		if (isDefined(parent)) {
			yield parent
			yield* parent.getAncestors()
		}
	}

	*getAncestorsAndSelf(): NodeGenerator {
		yield this
		yield* this.getAncestors()
	}

	toJson(): unknown {
		const primitiveValue = this.getAttribute(builtinAttribute.primitiveValue)
		if (isDefined(primitiveValue)) {
			return primitiveValue.type === "null" ? null : primitiveValue.value
		}

		const containerType = this.getAttribute(builtinAttribute.containerType)
		if (isDefined(containerType)) {
			if (containerType === "array") {
				return [...this.getChildren()]
					.sort(
						(a, b) =>
							(typeof a.name === "number" ? a.name : 0) -
							(typeof b.name === "number" ? b.name : 0)
					)
					.map(node => node.toJson())
			} else if (containerType === "object") {
				return Object.fromEntries(
					[...this.getChildren()].map((child): [string, unknown] => [
						child.name.toString(),
						child.toJson(),
					])
				)
			}
		}

		return null
	}

	setAttribute<T>(attribute: Attribute<T>, value: T) {
		this.ensureNotFrozen()
		this.attributes.set(attribute, value)
		return this
	}

	getCopyToClipboardValue(args: { minify: boolean }) {
		const { minify } = args

		const primitiveValue = this.getAttribute(builtinAttribute.primitiveValue)
		if (primitiveValue?.type === "string") {
			return primitiveValue.value
		} else {
			const json = this.toJson()
			return minify ? JSON.stringify(json) : JSON.stringify(json, null, 2)
		}
	}
}
