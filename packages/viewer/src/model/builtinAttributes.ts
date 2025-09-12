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

export type BackgroundColor = {
	default: string
	active?: string
	hover?: string
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
	backgroundColor: new Attribute<BackgroundColor>("builtin.backgroundColor"),
	defaultCollapsed: new Attribute<boolean>("builtin.defaultCollapsed"),
}
