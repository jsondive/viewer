import { MimeType } from "../model/MimeType"

// https://chatgpt.com/c/68764661-d040-8011-a02e-0837c0496659
export function detectFileType(textInput: string): MimeType {
	if (/\s*[{[]/.test(textInput)) {
		if (
			// Unquoted labels means it's JavaScript
			/((\s|{)[a-zA-Z_\-0-9]+:)|((\s|{)\[["'][a-zA-Z_\-0-9]+["']\]:)/.test(
				textInput
			) ||
			// Trailing commas means it's JavaScript
			/,\s+[\]}]/.test(textInput)
		) {
			return MimeType.JavaScript
		}

		if (/\n\{/m.test(textInput)) {
			return MimeType.JsonLines
		}

		return MimeType.Json
	}

	if (/\s*</.test(textInput)) {
		return MimeType.Xml
	}

	const lines = textInput.split("\n")
	const firstLines = lines.slice(0, 5)
	const hasUnquotedKey = firstLines.some(line => /^[a-zA-Z-_0-9]+:/.test(line))
	const hasYamlArray = firstLines.some(line => /^\s*-\s+/.test(line))
	if (hasUnquotedKey || hasYamlArray) {
		return MimeType.Yaml
	}

	// TODO: csv
	return MimeType.OctetStream
}
