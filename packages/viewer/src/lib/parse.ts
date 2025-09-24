import { isDefined, Result, tryParseJson } from "@jsondive/library"
import { DocumentInput } from "../model/DocumentInput"
import { CannotHandleInput, FileType, DivePlugin } from "../plugins"
import { builtinAttribute } from "../model/builtinAttributes"
import { DiveNode } from "../model/DiveNode"
import { MimeType } from "../model/MimeType"

const REPLACEMENT_LIMIT = 1000

const OutOfReplacements = Symbol("OutOfReplacements")

export function parseIntoNode(
	input: DocumentInput,
	plugins: DivePlugin[]
): Result<DiveNode, Error> {
	const directNode = input.getNodeDirectly()
	if (isDefined(directNode)) {
		return { value: directNode }
	}

	const fileTypes = plugins.flatMap(plugin => plugin.getFileTypes?.() ?? [])

	const result = parseUsingFileTypes(input, fileTypes)

	if (Result.isFail(result)) {
		return result
	}

	const root = result.value
	let replacementsLeft = REPLACEMENT_LIMIT
	while (true) {
		let didReplace = false
		try {
			root.replaceAll(node => {
				const primitiveValue = node.getAttribute(
					builtinAttribute.primitiveValue
				)
				if (primitiveValue?.type === "string") {
					const nestedInput = DocumentInput.fromText(primitiveValue.value)
					if (nestedInput.contentType === MimeType.OctetStream) {
						// Nested unwrapping only supported for text subtypes.
						// This is an optimization.
						return
					}
					const nestedResult = parseUsingFileTypes(nestedInput, fileTypes)
					if (
						Result.isSuccess(nestedResult) &&
						nestedResult.value.childCount > 0
					) {
						didReplace = true
						replacementsLeft--
						if (replacementsLeft === 0) {
							throw OutOfReplacements
						}
						return nestedResult.value
					}
				}
			})
		} catch (err) {
			if (err !== OutOfReplacements) {
				throw err
			}
		}

		if (!didReplace || replacementsLeft === 0) {
			break
		}
	}

	root.freeze()
	return { value: root }
}

function parseUsingFileTypes(
	input: DocumentInput,
	fileTypes: FileType[]
): Result<DiveNode, Error> {
	let lastError: Error | undefined

	for (const fileType of fileTypes) {
		const parseResult = fileType.parseIntoNode(input)
		if (Result.isSuccess(parseResult)) {
			const node = parseResult.value
			return {
				value: node
					.setAttribute(builtinAttribute.contentType, input.contentType)
					.setAttribute(builtinAttribute.fileTypeName, fileType.name),
			}
		} else {
			if (parseResult.error !== CannotHandleInput) {
				lastError = parseResult.error
			}
		}
	}

	if (lastError) {
		return { error: lastError }
	}

	// For a nicer error message: assume we're trying to parse the input as JSON,
	// and output the error from that.
	const inputAsText = input.asText()
	if (isDefined(inputAsText)) {
		const jsonResult = tryParseJson(inputAsText)
		if (Result.isFail(jsonResult)) {
			return { error: jsonResult.error }
		}
	}

	return {
		error: new Error(`No plugins could handle this document.`),
	}
}
