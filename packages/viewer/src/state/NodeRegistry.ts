import { Map as ImmutableMap } from "immutable"
import { DiveNode, RootNodeName } from "../model/DiveNode"

type NodeRegistryEntry = {
	node: DiveNode
	element: HTMLElement
}

/**
 * Used to track the set of mounted nodes (including e.g. their associated
 * HTMLElement, so that we can focus them.)
 */
export class NodeRegistry {
	private nodeToEntry: ImmutableMap<DiveNode, NodeRegistryEntry>
	private elementToEntry: ImmutableMap<HTMLElement, NodeRegistryEntry>
	public readonly rootNode: DiveNode | undefined

	private constructor(args: {
		nodeToEntry: ImmutableMap<DiveNode, NodeRegistryEntry>
		elementToEntry: ImmutableMap<HTMLElement, NodeRegistryEntry>
		rootNode: DiveNode | undefined
	}) {
		this.nodeToEntry = args.nodeToEntry
		this.elementToEntry = args.elementToEntry
		this.rootNode = args.rootNode
	}

	static empty() {
		return new NodeRegistry({
			elementToEntry: ImmutableMap(),
			nodeToEntry: ImmutableMap(),
			rootNode: undefined,
		})
	}

	register(entry: NodeRegistryEntry) {
		return new NodeRegistry({
			elementToEntry: this.elementToEntry.set(entry.element, entry),
			nodeToEntry: this.nodeToEntry.set(entry.node, entry),
			rootNode: entry.node.name === RootNodeName ? entry.node : this.rootNode,
		})
	}

	unregisterNode(node: DiveNode) {
		const entry = this.nodeToEntry.get(node)
		if (!entry) {
			console.warn(
				`[NodeRegistry] Tried to unregister node that was not registered`,
				node
			)
			return this
		}

		const newNodeToEntry = this.nodeToEntry.delete(entry.node)
		return new NodeRegistry({
			elementToEntry: this.elementToEntry.delete(entry.element),
			nodeToEntry: newNodeToEntry,
			rootNode:
				this.rootNode && newNodeToEntry.has(this.rootNode)
					? this.rootNode
					: undefined,
		})
	}

	findEntryByElement(element: HTMLElement) {
		return this.elementToEntry.get(element)
	}

	findEntryByNode(node: DiveNode) {
		return this.nodeToEntry.get(node)
	}
}
