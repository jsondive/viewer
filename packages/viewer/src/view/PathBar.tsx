import {
	addClassName,
	intersperseArray,
	libraryIcons,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@jsondive/library"
import { DiveNode } from "../model/DiveNode"
import { useDiveController, useFocusedNode, useFocusNode } from "../state"
import * as stylex from "@stylexjs/stylex"
import { useCallback, useEffect, useState } from "react"
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
		color: "var(--json-dive-color-black)",
		gap: "var(--json-dive-spacing-1)",
		zIndex: 100,
	},

	pathItemContainer: {
		display: "flex",
		alignItems: "center",
		gap: "var(--json-dive-spacing-0_5)",
	},

	pathItem: {
		cursor: "pointer",
		textDecoration: {
			":hover": "underline",
		},
	},

	inactivePathItem: {
		color: "var(--json-dive-color-light-label)",
	},

	copyPathButton: {
		cursor: "pointer",
	},
})

type ResolvedPathItem = {
	node: DiveNode
	active: boolean
}

export function PathBar(props: {
	activeNode: DiveNode
	resolvedPath: ResolvedPathItem[]
	onPathItemClick(node: DiveNode): void
}) {
	const { activeNode, resolvedPath, onPathItemClick } = props

	return (
		<div
			{...addClassName(stylex.props(styles.wrap), "json-dive-font-size-sm")}
			onMouseDown={e => {
				// Prevents the click from changing focus (keep focus within the viewer.)
				e.preventDefault()
			}}
		>
			<div {...stylex.props(styles.pathItemContainer)}>
				{intersperseArray(
					resolvedPath.map((item, i) => (
						<RenderPathItem
							key={`part-${i}`}
							node={item.node}
							onClick={() => {
								onPathItemClick(item.node)
							}}
							active={item.active}
						/>
					)),
					i => (
						<libraryIcons.ChevronRight key={`chevron-${i}`} size={14} />
					)
				)}
			</div>
			<CopyPathButton node={activeNode} />
		</div>
	)
}

function RenderPathItem(props: {
	node: DiveNode
	onClick: () => void
	active: boolean
}) {
	const { node, onClick, active } = props

	return (
		<div
			{...stylex.props(styles.pathItem, !active && styles.inactivePathItem)}
			onClick={onClick}
		>
			{node.nameString}
		</div>
	)
}

function CopyPathButton(props: { node: DiveNode }) {
	const { node } = props

	const controller = useDiveController()

	const handleClick = useCallback(() => {
		controller.invoke(defaultActions.copyPathToClipboard, {
			node,
			invokedFrom: "other",
		})
	}, [controller, node])

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

export function ConnectedPathBar() {
	const focusedNodeMaybeRoot = useFocusedNode()
	// Don't do anything with the root node; doesn't make sense to display a path there.
	const focusedNode = focusedNodeMaybeRoot?.isRoot
		? undefined
		: focusedNodeMaybeRoot
	// This needs to get passed in so that it stays mounted even if PathBar unmounts.
	const focusNode = useFocusNode()

	// When a user navigates to a parent path item, the current node becomes "pinned".
	// This means we will still display the full path for the pinned node, but the focus
	// has moved up the hierarchy. This would let the user navigate back *down* to the
	// pinned node, if they wish.
	const [pinnedNode, setPinnedNode] = useState<DiveNode | undefined>(undefined)

	const focusedNodePath = focusedNode?.pathNodes
	const pinnedNodePath = pinnedNode?.pathNodes

	const resolvedPath = (pinnedNodePath ?? focusedNodePath)?.map(
		(pathNode): ResolvedPathItem => ({
			node: pathNode,
			active: Boolean((focusedNodePath ?? pinnedNodePath)?.includes(pathNode)),
		})
	)

	const activeNode = focusedNode ?? pinnedNode

	const onPathItemClick = useCallback(
		(node: DiveNode) => {
			focusNode(node)
			setPinnedNode(resolvedPath?.at(-1)?.node)
		},
		[focusNode, resolvedPath]
	)

	useEffect(() => {
		if (
			pinnedNode &&
			(!focusedNode || !pinnedNode.pathNodes.includes(focusedNode))
		) {
			setPinnedNode(undefined)
		}
	}, [focusedNode, pinnedNode])

	return activeNode && resolvedPath ? (
		<PathBar
			activeNode={activeNode}
			resolvedPath={resolvedPath}
			onPathItemClick={onPathItemClick}
		/>
	) : null
}
