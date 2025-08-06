import { isDefined, Result } from "@jsondive/library"
import { CannotHandleInput, FileType, DivePlugin } from "."
import { NodeName, RootNodeName } from "../model/DiveNode"
import _ from "lodash"
import { builtinAttribute } from "../model/builtinAttributes"
import { NodeBuilder } from "../model/NodeBuilder"
import { MimeType } from "../model/MimeType"

export const json = _.memoize(
	(): DivePlugin => ({
		getFileTypes(): FileType[] {
			return [
				{
					name: "json",
					parseIntoNode(input) {
						if (input.contentType !== MimeType.Json) {
							return { error: CannotHandleInput }
						}

						const json = input.asJson()
						if (!isDefined(json)) {
							return {
								error: CannotHandleInput,
							}
						}

						const nodeBuilder = NodeBuilder.start()
						buildNodesFromJson(json, RootNodeName, nodeBuilder)
						return {
							value: nodeBuilder.build(),
						}
					},
				},

				{
					name: "jsonl",
					parseIntoNode(input) {
						if (input.contentType !== MimeType.JsonLines) {
							return { error: CannotHandleInput }
						}

						const text = input.asText()
						if (!isDefined(text)) {
							return { error: CannotHandleInput }
						}

						const rowsResult = Result.wrap(() =>
							text.split("\n").map(line => JSON.parse(line.trim()))
						)
						if (Result.isFail(rowsResult)) {
							return rowsResult
						}

						const rows = rowsResult.value
						const parentBuilder = NodeBuilder.start()
						const arrayBuilder = parentBuilder.createChild(RootNodeName)
						for (const [index, value] of rows.entries()) {
							buildNodesFromJson(value, index, arrayBuilder)
						}
						arrayBuilder.setAttribute(builtinAttribute.containerType, "array")

						return {
							value: parentBuilder.build(),
						}
					},
				},
			]
		},
	})
)

export function buildNodesFromJson(
	json: unknown,
	currentName: NodeName,
	parent: NodeBuilder
) {
	if (json === null) {
		const builder = parent.createChild(currentName)
		builder.setAttribute(builtinAttribute.primitiveValue, { type: "null" })
	} else if (typeof json === "string") {
		const builder = parent.createChild(currentName)
		builder.setAttribute(builtinAttribute.primitiveValue, {
			type: "string",
			value: json,
		})
	} else if (typeof json === "number") {
		const builder = parent.createChild(currentName)
		builder.setAttribute(builtinAttribute.primitiveValue, {
			type: "number",
			value: json,
		})
	} else if (typeof json === "boolean") {
		const builder = parent.createChild(currentName)
		builder.setAttribute(builtinAttribute.primitiveValue, {
			type: "boolean",
			value: json,
		})
	} else if (Array.isArray(json)) {
		// NOTE: Needs to go before object because an array is an object.
		const builder = parent.createChild(currentName)
		for (const [index, value] of json.entries()) {
			buildNodesFromJson(value, index, builder)
		}
		builder.setAttribute(builtinAttribute.containerType, "array")
	} else if (typeof json === "object") {
		const builder = parent.createChild(currentName)
		for (const [key, value] of Object.entries(json)) {
			buildNodesFromJson(value, key, builder)
		}
		builder.setAttribute(builtinAttribute.containerType, "object")
	} else {
		throw new Error(`Encountered unknown type in JSON: ${json}`)
	}
}
