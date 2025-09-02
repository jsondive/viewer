import { DiveNode, NodeName, RootNodeName } from "./DiveNode"
import { Attribute } from "./Attribute"

export type NodeBuilder = {
	createChild(name: NodeName): NodeBuilder
	setAttribute<T>(attribute: Attribute<T>, value: T): void
	build(): DiveNode
}

export const NodeBuilder = {
	startEmpty(): NodeBuilder {
		return new EmptyNodeBuilder()
	},

	start(): NodeBuilder {
		return new ConcreteNodeBuilder(undefined, RootNodeName)
	},
}

class EmptyNodeBuilder implements NodeBuilder {
	private rootNodeBuilder: NodeBuilder | undefined

	createChild(name: NodeName): NodeBuilder {
		if (name !== RootNodeName) {
			throw new Error(`Expected RootNodeName`)
		}

		if (this.rootNodeBuilder) {
			throw new Error(`There can only be one root node.`)
		}

		this.rootNodeBuilder = new ConcreteNodeBuilder(undefined, RootNodeName)

		return this.rootNodeBuilder
	}

	setAttribute<T>(_attribute: Attribute<T>, _value: T) {
		throw new Error(
			`Cannot setAttribute() on the empty NodeBuilder; create a root first.`
		)
	}

	build(): DiveNode {
		if (!this.rootNodeBuilder) {
			throw new Error(`No root node was created.`)
		}

		return this.rootNodeBuilder.build()
	}
}

class ConcreteNodeBuilder implements NodeBuilder {
	private readonly attributes: Map<Attribute<unknown>, unknown> = new Map()
	private childBuilders: Array<ConcreteNodeBuilder> = []

	constructor(
		protected readonly parent: ConcreteNodeBuilder | undefined,
		protected readonly name: NodeName
	) {}

	static start() {
		return new ConcreteNodeBuilder(undefined, RootNodeName)
	}

	setAttribute<T>(attribute: Attribute<T>, value: T) {
		this.attributes.set(attribute, value)
	}

	createChild(name: NodeName): ConcreteNodeBuilder {
		const childBuilder = new ConcreteNodeBuilder(this, name)
		this.childBuilders.push(childBuilder)
		return childBuilder
	}

	private buildInternal(parent: DiveNode | undefined): DiveNode {
		const children: DiveNode[] = []
		const node = new DiveNode({
			parent,
			attributes: this.attributes,
			name: this.name,
			children,
		})
		children.push(...this.childBuilders.map(child => child.buildInternal(node)))
		return node
	}

	build() {
		if (this.parent) {
			throw new Error(`build() should be called on the root node!`)
		}
		return this.buildInternal(undefined)
	}
}
