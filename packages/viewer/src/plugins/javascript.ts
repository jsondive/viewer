import { isDefined, Result } from "@jsondive/library"
import { CannotHandleInput, FileType, DivePlugin } from "."
import { DiveNode, NodeName, RootNodeName } from "../model/DiveNode"
import _ from "lodash"
import { builtinAttribute } from "../model/builtinAttributes"
import { NodeBuilder } from "../model/NodeBuilder"
import { MimeType } from "../model/MimeType"
import * as acorn from "acorn"
import { buildNodesFromJson } from "./json"

export const javascript = _.memoize(
	(): DivePlugin => ({
		getFileTypes(): FileType[] {
			return [
				{
					name: "javascript",
					parseIntoNode(input) {
						if (input.contentType !== MimeType.JavaScript) {
							return { error: CannotHandleInput }
						}

						const text = input.asText()
						if (!isDefined(text)) {
							return {
								error: CannotHandleInput,
							}
						}

						return Result.wrap(() => {
							const program = acorn.parse(`(${text})`, {
								ecmaVersion: "latest",
							})
							return convertProgramIntoNode(program)
						})
					},
				},
			]
		},
	})
)

function convertProgramIntoNode(program: acorn.Program): DiveNode {
	if (
		program.body.length === 0 ||
		program.body[0].type !== "ExpressionStatement"
	) {
		throw new Error(`Expected expression`)
	}

	const expression = program.body[0].expression

	const nodeBuilder = NodeBuilder.start()
	buildNodes(expression, RootNodeName, nodeBuilder)
	return nodeBuilder.build()
}

function buildNodes(
	expression: acorn.Expression,
	currentName: NodeName,
	parent: NodeBuilder
) {
	if (expression.type === "ObjectExpression") {
		const builder = parent.createChild(currentName)
		builder.setAttribute(builtinAttribute.containerType, "object")
		for (const property of expression.properties) {
			if (property.type === "SpreadElement") {
				throw new Error(`Spreads are not supported.`)
			}

			let name: string
			if (property.key.type === "Literal") {
				if (typeof property.key.value !== "string") {
					throw new Error(
						`Unsupported literal value: ${JSON.stringify(property.key.value)}`
					)
				}
				name = property.key.value
			} else if (property.key.type === "Identifier") {
				name = property.key.name
			} else {
				throw new Error(`Unsupported property key type: ${property.key.type}`)
			}

			buildNodes(property.value, name, builder)
		}
	} else if (expression.type === "ArrayExpression") {
		const builder = parent.createChild(currentName)
		builder.setAttribute(builtinAttribute.containerType, "array")
		for (const [index, element] of expression.elements.entries()) {
			if (element === null) {
				continue
			}

			if (element.type === "SpreadElement") {
				throw new Error(`Spreads are not supported.`)
			}

			buildNodes(element, index, builder)
		}
	} else if (expression.type === "Literal") {
		buildNodesFromJson(expression.value, currentName, parent)
	}
}
