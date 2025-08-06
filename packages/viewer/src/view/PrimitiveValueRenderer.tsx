import { unreachable } from "@jsondive/library"
import { PrimitiveValue } from "../model/builtinAttributes"

export function PrimitiveValueRenderer(props: { value: PrimitiveValue }) {
	const { value } = props

	if (value.type === "boolean" || value.type === "number") {
		return value.value.toString()
	} else if (value.type === "null") {
		return "null"
	} else if (value.type === "string") {
		return `"${value.value}"`
	} else {
		unreachable(value)
	}
}
