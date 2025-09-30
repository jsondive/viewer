import {
	diff as jsonDiff,
	Operation,
	type IChange,
	applyChangeset,
} from "json-diff-ts"
import { useMemo } from "react"
import { NodeBuilder } from "./model/NodeBuilder"
import { NodeName, RootNodeName } from "./model/DiveNode"
import { builtinAttribute } from "./model/builtinAttributes"
import { isDefined } from "@jsondive/library"
import { DocumentInput } from "./model/DocumentInput"
import { JSONDive } from "./JSONDive"

export type JSONDiveDiffProps = {
	before: Record<string, unknown>
	after: Record<string, unknown>
}

export function JSONDiveDiff(props: JSONDiveDiffProps) {
	const { before, after } = props

	const changes = useMemo(() => jsonDiff(before, after), [before, after])

	const input = useMemo(() => {
		const nodeBuilder = NodeBuilder.startEmpty()
		buildNodes({
			json: before,
			currentName: RootNodeName,
			parent: nodeBuilder,
			changes,
		})
		return DocumentInput.fromNode(nodeBuilder.build())
	}, [before, changes])

	return <JSONDive input={input} />
}

const ADDITION_COLORS = {
	default: "var(--json-dive-color-diff-addition-background)",
	hover: "var(--json-dive-color-diff-addition-active-background)",
	active: "var(--json-dive-color-diff-addition-active-background)",
}

const REMOVAL_COLORS = {
	default: "var(--json-dive-color-diff-removal-background)",
	hover: "var(--json-dive-color-diff-removal-active-background)",
	active: "var(--json-dive-color-diff-removal-active-background)",
}

function buildNodes(args: {
	json: unknown
	currentName: NodeName
	parent: NodeBuilder
	changes: IChange[]
	type?: "addition" | "removal"
}) {
	const { json, currentName, parent, changes, type } = args

	let builder: NodeBuilder
	if (json === null) {
		builder = parent.createChild(currentName)
		builder.setAttribute(builtinAttribute.primitiveValue, { type: "null" })
	} else if (typeof json === "string") {
		builder = parent.createChild(currentName)
		builder.setAttribute(builtinAttribute.primitiveValue, {
			type: "string",
			value: json,
		})
	} else if (typeof json === "number") {
		builder = parent.createChild(currentName)
		builder.setAttribute(builtinAttribute.primitiveValue, {
			type: "number",
			value: json,
		})
	} else if (typeof json === "boolean") {
		builder = parent.createChild(currentName)
		builder.setAttribute(builtinAttribute.primitiveValue, {
			type: "boolean",
			value: json,
		})
	} else if (Array.isArray(json) || typeof json === "object") {
		if (Array.isArray(json) && changes.length > json.length * 0.75) {
			// If >75% of the entires in array have changed, just show it as a diff
			// on the entire array.
			const newArray = applyChangeset(json, changes)
			buildNodes({
				json,
				currentName,
				parent,
				changes: [],
				type: "removal",
			})
			buildNodes({
				json: newArray,
				currentName,
				parent,
				changes: [],
				type: "addition",
			})
			return
		}

		builder = parent.createChild(currentName)
		const changesByKey = getChangesByKey(changes)
		// Note/slight hack: json may be an array. Object.entries (for an array)
		// returns the keys as stringified numbers. This is actually handy because
		// json-diff-ts stringifies the array indices. i.e. the first element of
		// an array has key "0".
		for (const [key, value] of Object.entries(json)) {
			const changesForKey = changesByKey.get(key) ?? []
			const childChanges = changesForKey.flatMap(change => change.changes ?? [])
			// Convert keys back to numbers when sub-building.
			const keyForBuilding = Array.isArray(json) ? Number(key) : key
			if (
				changesForKey.length === 1 &&
				changesForKey[0].type === Operation.UPDATE &&
				changesForKey[0].oldValue
			) {
				// Updating a primitive value.
				// Show as a removal and then addition.
				for (let i = 0; i < 2; i++) {
					buildNodes({
						json: i === 0 ? value : changesForKey[0].value,
						currentName: keyForBuilding,
						parent: builder,
						changes: childChanges,
						type: i === 0 ? "removal" : "addition",
					})
				}
			} else {
				const isRemoval =
					changesForKey.filter(change => change.type === Operation.REMOVE)
						.length > 0
				buildNodes({
					json: value,
					currentName: keyForBuilding,
					parent: builder,
					changes: childChanges,
					type: type ?? (isRemoval ? "removal" : undefined),
				})
			}
		}

		// Handle additions.
		for (const change of changes) {
			if (change.type !== Operation.ADD || change.value === undefined) {
				continue
			}

			buildNodes({
				json: change.value,
				changes: [],
				// Make sure to un-stringify keys from json-diff-ts.
				currentName: Array.isArray(json) ? Number(change.key) : change.key,
				parent: builder,
				type: "addition",
			})
		}

		builder.setAttribute(
			builtinAttribute.containerType,
			Array.isArray(json) ? "array" : "object"
		)

		// If there are no changes in this object or array, default to being collapsed.
		if (changes.length === 0 && !isDefined(type)) {
			builder.setAttribute(builtinAttribute.defaultCollapsed, true)
		}
	} else {
		throw new Error(`Encountered unknown type in JSON: ${json}`)
	}

	if (type === "addition") {
		builder.setAttribute(builtinAttribute.backgroundColor, ADDITION_COLORS)
	}
	if (type === "removal") {
		builder.setAttribute(builtinAttribute.backgroundColor, REMOVAL_COLORS)
	}
}

function getChangesByKey(changes: IChange[]) {
	const map = new Map<string, IChange[]>()
	for (const change of changes) {
		const array = map.get(change.key) ?? []
		array.push(change)
		map.set(change.key, array)
	}
	return map
}
