import { isDefined, Result } from "@jsondive/library"
import { CannotHandleInput, FileType, DivePlugin } from "."
import { RootNodeName } from "../model/DiveNode"
import _ from "lodash"
import { NodeBuilder } from "../model/NodeBuilder"
import { MimeType } from "../model/MimeType"
import { buildNodesFromJson } from "./json"
import { parse as yamlParse } from "yaml"

export const yaml = _.memoize(
	(): DivePlugin => ({
		getFileTypes(): FileType[] {
			return [
				{
					name: "yaml",
					parseIntoNode(input) {
						if (input.contentType !== MimeType.Yaml) {
							return { error: CannotHandleInput }
						}

						const text = input.asText()
						if (!isDefined(text)) {
							return {
								error: CannotHandleInput,
							}
						}

						const parseResult = Result.wrap(() => yamlParse(text))
						if (Result.isFail(parseResult)) {
							return parseResult
						}

						const nodeBuilder = NodeBuilder.start()
						buildNodesFromJson(parseResult.value, RootNodeName, nodeBuilder)
						return {
							value: nodeBuilder.build(),
						}
					},
				},
			]
		},
	})
)
