import {
	addClassName,
	intersperseArray,
	libraryIcons,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@jsondive/library"
import { DiveNode } from "../model/DiveNode"
import { useDiveController, useFocusedNode } from "../state"
import * as stylex from "@stylexjs/stylex"
import React, { useCallback } from "react"
import { defaultActions } from "../plugins/defaultActions"

const styles = stylex.create({
	wrap: {
		flexShrink: 0,
		display: "flex",
		alignItems: "center",
		paddingInline: "var(--json-dive-spacing-4)",
		paddingBlock: "var(--json-dive-spacing-2)",
		backgroundColor: "var(--json-dive-color-status-bar-background)",
		borderTopStyle: "solid",
		borderTopWidth: 1,
		borderTopColor: "var(--json-dive-color-light-border)",
		color: "var(--json-dive-color-light-label)",
		gap: "var(--json-dive-spacing-1)",
		zIndex: 100,
	},

	pathParts: {
		display: "flex",
		alignItems: "center",
		gap: "var(--json-dive-spacing-0_5)",
	},

	copyPathButton: {
		cursor: "pointer",
	},
})

export function PathBar(props: { node: DiveNode }) {
	const { node } = props

	const pathParts = node.pathParts

	return (
		<div
			{...addClassName(stylex.props(styles.wrap), "json-dive-font-size-sm")}
			onMouseDown={e => {
				// Prevents the click from changing focus (keep focus within the viewer.)
				e.preventDefault()
			}}
		>
			<div {...stylex.props(styles.pathParts)}>
				{intersperseArray(
					pathParts.map((pathPart, i) => (
						<div key={`part-${i}`}>{pathPart}</div>
					)),
					i => (
						<libraryIcons.ChevronRight key={`chevron-${i}`} size={14} />
					)
				)}
			</div>
			<CopyPathButton node={node} />
		</div>
	)
}

function CopyPathButton(props: { node: DiveNode }) {
	const { node } = props

	const controller = useDiveController()

	const handleClick = useCallback(
		(e: React.MouseEvent) => {
			controller.invoke(defaultActions.copyPathToClipboard, {
				node,
				invokedFrom: "other",
			})
		},
		[controller, node]
	)

	return (
		<Tooltip placement="right">
			<TooltipTrigger asChild>
				<div {...stylex.props(styles.copyPathButton)} onClick={handleClick}>
					<libraryIcons.Copy size={14} />
				</div>
			</TooltipTrigger>
			<TooltipContent>Copy JSON path to clipboard</TooltipContent>
		</Tooltip>
	)
}

export function MaybePathBar() {
	const focusedNode = useFocusedNode()
	return focusedNode && !focusedNode.isRoot ? (
		<PathBar node={focusedNode} />
	) : null
}
