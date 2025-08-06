import { addClassName, isDefined, unreachable } from "@jsondive/library"
import * as stylex from "@stylexjs/stylex"
import {
	IconBraces,
	IconBracketsLine,
	IconMinusSquare,
	IconPlusSquare,
	IconRoundedSquare,
} from "../../lib/icons"
import { DiveNode } from "../../model/DiveNode"
import { builtinAttribute } from "../../model/builtinAttributes"

const connectorStrokeColor = "rgb(156 163 175)"

export function ExpandIcon(
	props: React.SVGProps<SVGSVGElement> & {
		expanded: boolean
		connectors: Array<"top" | "bottom">
	}
) {
	const { expanded, connectors, ...restProps } = props
	const Component = expanded ? IconMinusSquare : IconPlusSquare
	return (
		<Component
			style={{ cursor: "pointer", userSelect: "none" }}
			height="100%"
			className="json-dive-tutorial-target-expand-icon"
			{...restProps}
		>
			{connectors.includes("top") && (
				<line
					x1="512"
					y1="-512"
					x2="512"
					y2="144"
					strokeWidth="72"
					stroke={connectorStrokeColor}
				/>
			)}
			{connectors.includes("bottom") && (
				<line
					x1="512"
					y1="880"
					x2="512"
					y2="1536"
					strokeWidth="72"
					stroke={connectorStrokeColor}
				/>
			)}
		</Component>
	)
}

export function ConnectorIcon(props: { type: "vertical" | "corner" | "tri" }) {
	const { type } = props

	return (
		<svg viewBox="0 0 1024 1024" fill="currentColor" height="100%" width="1em">
			<line
				x1="512"
				y1="-512"
				x2="512"
				y2={type === "corner" ? 512 : 1536}
				strokeWidth="72"
				stroke={connectorStrokeColor}
			/>
			{(type === "corner" || type === "tri") && (
				<line
					x1={512 - 72 / 2}
					y1="512"
					x2="1536"
					y2="512"
					strokeWidth="72"
					stroke={connectorStrokeColor}
				/>
			)}
		</svg>
	)
}

const typeIconStyles = stylex.create({
	string: {
		color: "var(--json-dive-color-green-400)",
	},

	number: {
		color: "var(--json-dive-color-blue-400)",
	},

	boolean: {
		color: "var(--json-dive-color-yellow-400)",
	},

	null: {
		color: "var(--json-dive-color-red-400)",
	},
})

// TODO: this is now unused?
export function TypeIconForNode(props: { node: DiveNode }) {
	const { node } = props

	const containerType = node.getAttribute(builtinAttribute.containerType)
	if (isDefined(containerType)) {
		if (containerType === "object") {
			return <IconBraces className="json-dive-tutorial-target-type-icon" />
		} else if (containerType === "array") {
			return (
				<IconBracketsLine className="json-dive-tutorial-target-type-icon" />
			)
		} else {
			unreachable(containerType)
		}
	}

	const primitiveValue = node.getAttribute(builtinAttribute.primitiveValue)
	if (isDefined(primitiveValue)) {
		if (primitiveValue.type === "string") {
			return (
				<IconRoundedSquare
					{...addClassName(
						stylex.props(typeIconStyles.string),
						"json-dive-tutorial-target-type-icon"
					)}
				/>
			)
		} else if (primitiveValue.type === "number") {
			return (
				<IconRoundedSquare
					{...addClassName(
						stylex.props(typeIconStyles.number),
						"json-dive-tutorial-target-type-icon"
					)}
				/>
			)
		} else if (primitiveValue.type === "boolean") {
			return (
				<IconRoundedSquare
					{...addClassName(
						stylex.props(typeIconStyles.boolean),
						"json-dive-tutorial-target-type-icon"
					)}
				/>
			)
		} else if (primitiveValue.type === "null") {
			return (
				<IconRoundedSquare
					{...addClassName(
						stylex.props(typeIconStyles.null),
						"json-dive-tutorial-target-type-icon"
					)}
				/>
			)
		} else {
			unreachable(primitiveValue)
		}
	}

	// Fallback.
	return <IconRoundedSquare {...stylex.props(typeIconStyles.string)} />
}
