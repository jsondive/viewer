import { Result } from "./Result"

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/readText#exceptions
 */
abstract class AbstractClipboardError extends Error {}

export class ClipboardUnsupportedClipboardError extends AbstractClipboardError {
	type = "clipboard_unsupported"

	constructor() {
		super(`The clipboard is unsupported in your browser.`)
	}
}

/**
 * Thrown if the access to read the clipboard is not allowed.
 */
class PermissionDeniedClipboardError extends AbstractClipboardError {
	type = "permission_denied"

	constructor() {
		super(
			`Access to the clipboard has been denied. Please fix this in the settings for this website.`
		)
	}
}

/**
 * Thrown if the clipboard indicates that it contains data that can be represented as a
 * text but is unable to provide a textual representation.
 */
class NotFoundClipboardError extends AbstractClipboardError {
	type = "not_found"

	constructor() {
		super(`Clipboard does not contain text.`)
	}
}

class UnknownClipboardError extends AbstractClipboardError {
	type = "unknown"

	constructor(public readonly underlying: Error) {
		super(`An unknown error occurred.`)
	}
}

type ClipboardError =
	| ClipboardUnsupportedClipboardError
	| PermissionDeniedClipboardError
	| NotFoundClipboardError
	| UnknownClipboardError

const ClipboardError = {
	fromUnknownError(error: Error): ClipboardError {
		if (error.name === "NotAllowedError") {
			return new PermissionDeniedClipboardError()
		} else if (error.name === "NotFoundError") {
			return new NotFoundClipboardError()
		} else {
			return new UnknownClipboardError(error)
		}
	},
}

export async function tryReadClipboard(): Promise<
	Result<string, ClipboardError>
> {
	if (!navigator.clipboard) {
		return { error: new ClipboardUnsupportedClipboardError() }
	}

	const readResult = await Result.wrapAsync(() => {
		return navigator.clipboard.readText()
	})

	if (Result.isFail(readResult)) {
		return {
			error: ClipboardError.fromUnknownError(readResult.error),
		}
	}

	return { value: readResult.value }
}

export async function tryWriteClipboard(
	text: string
): Promise<Result<{ success: true }, ClipboardError>> {
	if (!navigator.clipboard) {
		return { error: new ClipboardUnsupportedClipboardError() }
	}

	const writeResult = await Result.wrapAsync(() => {
		return navigator.clipboard.writeText(text)
	})

	if (Result.isFail(writeResult)) {
		return {
			error: ClipboardError.fromUnknownError(writeResult.error),
		}
	}

	return { value: { success: true } }
}

// TODO: Create a dank utility for writing to clipboard too.
