import { isDefined } from "@jsondive/library"
import {
	builtinAttribute,
	primitiveValueToString,
} from "../model/builtinAttributes"
import { DiveNode } from "../model/DiveNode"
import _ from "lodash"

export type SearchResult = {
	matchingNodes: DiveNode[]
}

const emptyResult = new Set<DiveNode>()

export function executeSearch(args: { rootNode: DiveNode; query: string }) {
	const { rootNode, query: rawQuery } = args

	const normalizedQuery = rawQuery.toLowerCase()
	if (normalizedQuery.length === 0) {
		return emptyResult
	}

	// TODO: this doesn't work, i don't think
	const pathParts = normalizedQuery.split(".")
	const pathMatch = rootNode.getChildByPath(pathParts)

	const contentMatches: DiveNode[] = []
	rootNode.visitAll(node => {
		if (node.isRoot) {
			return
		}

		let testString = node.nameString
		const primitiveValue = node.getAttribute(builtinAttribute.primitiveValue)
		if (isDefined(primitiveValue)) {
			testString = testString + primitiveValueToString(primitiveValue)
		}
		testString = testString.toLowerCase()

		if (testString.includes(normalizedQuery)) {
			contentMatches.push(node)
		}
	})

	return new Set(_.compact([pathMatch, ...contentMatches]))
}
