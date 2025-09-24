import { NonRootNodeName } from "../model/DiveNode"

type ResolvedPathPart = {
	isBracketed: boolean
	segmentString: string
}

function resolvePart(part: NonRootNodeName): ResolvedPathPart {
	if (typeof part === "number") {
		return {
			isBracketed: true,
			segmentString: String(part),
		}
	}

	// Valid identifier: starts with letter/_, contains only letters, numbers, _
	if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(part)) {
		return {
			isBracketed: false,
			segmentString: part,
		}
	}

	// Else quote it
	return {
		isBracketed: true,
		segmentString: `"${part.replace(/"/g, '\\"')}"`,
	}
}

function stringifyPart(part: ResolvedPathPart) {
	return part.isBracketed ? `[${part.segmentString}]` : part.segmentString
}

/**
 * Given a list of JSON path parts, build a JSON path and make sure
 * to escape invalid identifiers.
 */
export function buildJsonPath(parts: NonRootNodeName[]): string {
	if (parts.length === 0) {
		return "$" // Root
	}

	let result = stringifyPart(resolvePart(parts[0]))

	for (let i = 1; i < parts.length; i++) {
		const resolved = resolvePart(parts[i])
		if (!resolved.isBracketed) {
			result += "."
		}
		result += stringifyPart(resolved)
	}

	return result
}
