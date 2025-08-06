import { Attribute } from "./Attribute"

export type ContainerType = "object" | "array"

export type PrimitiveValue =
	| {
			type: "null"
	  }
	| {
			type: "string"
			value: string
	  }
	| {
			type: "boolean"
			value: boolean
	  }
	| {
			type: "number"
			value: number
	  }

export function primitiveValueToString(primitiveValue: PrimitiveValue) {
	return primitiveValue.type === "null"
		? "null"
		: primitiveValue.value.toString()
}

export const builtinAttribute = {
	primitiveValue: new Attribute<PrimitiveValue>("builtin.primitiveValue"),
	containerType: new Attribute<ContainerType>("builtin.containerType"),
	fileTypeName: new Attribute<string>("builtin.fileTypeName"),
	contentType: new Attribute<string>("builtin.contentType"),
}
