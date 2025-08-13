import {
	arrayBufferToBase64,
	base64ToArrayBuffer,
	isDefined,
	Result,
	tryDecodeText,
	tryParseJson,
	unreachable,
} from "@jsondive/library"
import _ from "lodash"
import z, { ZodError } from "zod"
import { MimeType } from "./MimeType"
import { detectFileType } from "../lib/detectFileType"

type DocumentInputValue =
	| {
			type: "text"
			text: string
	  }
	| {
			type: "arrayBuffer"
			arrayBuffer: ArrayBuffer
	  }
	| {
			type: "json"
			json: unknown
	  }

const SerializedDocumentInputValueSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("text"),
		text: z.string(),
	}),
	z.object({
		type: z.literal("arrayBuffer"),
		arrayBufferBase64: z.string(),
	}),
	z.object({
		type: z.literal("json"),
		json: z.unknown(),
	}),
])

export const SerializedDocumentInputSchema = z.object({
	value: SerializedDocumentInputValueSchema,
	contentType: z.string(),
})

type SerializedDocumentInputValue = z.infer<
	typeof SerializedDocumentInputValueSchema
>
export type SerializedDocumentInput = z.infer<
	typeof SerializedDocumentInputSchema
>

export class DocumentInput {
	public readonly contentType: string

	private constructor(
		private readonly value: DocumentInputValue,
		contentType: string | AutodetectContentType
	) {
		this.contentType =
			contentType === DocumentInput.Autodetect
				? this.value.type === "text"
					? detectFileType(this.value.text)
					: MimeType.OctetStream
				: contentType
	}

	asText(): string | undefined {
		if (this.value.type === "text") {
			return this.value.text
		} else if (this.value.type === "arrayBuffer") {
			return Result.toOptional(tryDecodeText(this.value.arrayBuffer))
		} else if (this.value.type === "json") {
			return JSON.stringify(this.value.json)
		} else {
			unreachable(this.value)
		}
	}

	asJson(): unknown | undefined {
		// Optimization if we're already JSON: just return it.
		if (this.value.type === "json") {
			return this.value.json
		}

		const text = this.asText()
		return isDefined(text) ? Result.toOptional(tryParseJson(text)) : undefined
	}

	static fromText(text: string, contentType?: string) {
		return new DocumentInput(
			{
				type: "text",
				text,
			},
			contentType ?? DocumentInput.Autodetect
		)
	}

	static fromJson(json: Record<string, unknown>) {
		return new DocumentInput(
			{
				type: "json",
				json,
			},
			MimeType.Json
		)
	}

	static empty = _.memoize(() => DocumentInput.fromText(""))

	static readonly Autodetect = Symbol("AutodetectContentType")

	private serializeValue(): SerializedDocumentInputValue {
		if (this.value.type === "arrayBuffer") {
			return {
				type: "arrayBuffer",
				arrayBufferBase64: arrayBufferToBase64(this.value.arrayBuffer),
			}
		} else {
			return this.value
		}
	}

	serialize(): SerializedDocumentInput {
		return {
			value: this.serializeValue(),
			contentType: this.contentType,
		}
	}

	private static deserializeValue(
		serializedValue: SerializedDocumentInputValue
	): DocumentInputValue {
		if (serializedValue.type === "arrayBuffer") {
			return {
				type: "arrayBuffer",
				arrayBuffer: base64ToArrayBuffer(serializedValue.arrayBufferBase64),
			}
		} else if (serializedValue.type === "json") {
			return {
				type: "json",
				json: serializedValue.json ?? null,
			}
		} else {
			return serializedValue
		}
	}

	static deserialize(value: unknown): Result<DocumentInput, ZodError> {
		const parseResult = SerializedDocumentInputSchema.safeParse(value)
		if (!parseResult.success) {
			return { error: parseResult.error }
		}

		return {
			value: new DocumentInput(
				DocumentInput.deserializeValue(parseResult.data.value),
				parseResult.data.contentType
			),
		}
	}
}

type AutodetectContentType = typeof DocumentInput.Autodetect
