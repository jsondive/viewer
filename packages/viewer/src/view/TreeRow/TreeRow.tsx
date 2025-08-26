import React, { JSX, useCallback, useEffect, useMemo, useRef } from "react"
import {
	Badge,
	isDefined,
	iterHelpers,
	unreachable,
	useIsOverflowing,
} from "@jsondive/library"
import { DiveNode } from "../../model/DiveNode"
import _ from "lodash"
import { ConnectorIcon, ExpandIcon, TypeIconForContainer } from "./graphics"
import {
	useDecorationsForNode,
	useDiveController,
	useNodeFindState,
	useNodeState,
	useRegisterNode,
	useSetNodesExpanded,
	useSetNodeVisibility,
} from "../../state"
import { builtinAttribute } from "../../model/builtinAttributes"
import { PrimitiveValueRenderer } from "../PrimitiveValueRenderer"
import * as stylex from "@stylexjs/stylex"
import { useHandleContextMenu } from "./useHandleContextMenu"
import { MagnifyButton } from "./MagnifyButton"
import { isMimeType, MimeType } from "../../model/MimeType"
import { defaultActions } from "../../plugins/defaultActions"

export const treeRowHeight = 20

const FOCUS_COLOR = "var(--json-dive-color-row-focus)"
const HORIZONTAL_GAP = `var(--json-dive-spacing-1)`

const styles = stylex.create({
	rowBody: (yOffset: number) => ({
		alignItems: "center",
		backgroundColor: {
			":focus": FOCUS_COLOR,
			":hover": "var(--json-dive-color-row-hover)",
		},
		display: "flex",
		gap: HORIZONTAL_GAP,
		height: `${treeRowHeight}px`,
		left: 0,
		outline: "none",
		position: "absolute",
		top: 0,
		transform: `translateY(${yOffset}px)`,
		width: "100%",
		paddingRight: HORIZONTAL_GAP,

		// eslint-disable-next-line @stylexjs/valid-styles
		":is(.json-dive-temp-force-focus-state)": {
			backgroundColor: FOCUS_COLOR,
		},
	}),

	// HACK: For some reason this style doesn't work when grouped into
	// the rowBody style.
	rowBodyBackgroundColor: {
		backgroundColor: {
			":focus": FOCUS_COLOR,
			":hover": "var(--json-dive-color-row-hover)",
		},
	},

	findMatch: {
		backgroundColor: {
			default: "var(--json-dive-color-find-match-background)",
			":focus": "var(--json-dive-color-find-match-background-active)",
			":hover": "var(--json-dive-color-find-match-background-active)",
		},
	},

	currentFindMatch: {
		backgroundColor: {
			default: "var(--json-dive-color-current-find-match-background)",
			":focus": "var(--json-dive-color-current-find-match-background-active)",
			":hover": "var(--json-dive-color-current-find-match-background-active)",
		},
	},

	iconWrap: {
		alignSelf: "stretch",
	},

	depthLineWrap: {
		alignSelf: "stretch",
		width: "1em",
	},

	valuePrefix: {
		display: "flex",
		flexShrink: 0,
		alignItems: "center",
		gap: HORIZONTAL_GAP,
		height: "100%",
	},

	value: {
		whiteSpace: "nowrap",
		textOverflow: "ellipsis",
		overflow: "hidden",
	},

	linkifiedValue: {
		textDecoration: {
			default: "none",
			":hover": "underline",
		},
		userSelect: "none",
		// eslint-disable-next-line @stylexjs/valid-styles
		"-webkit-user-drag": "none",
	},

	numberName: {
		// Color for array indices is slightly lighter.
		color: "var(--json-dive-color-row-array-number-index)",
	},
})

const primitiveTypeStyles = stylex.create({
	string: {
		color: "var(--json-dive-color-value-string)",
	},

	number: {
		color: "var(--json-dive-color-value-number)",
	},

	boolean: {
		color: "var(--json-dive-color-value-boolean)",
	},

	null: {
		color: "var(--json-dive-color-value-null)",
		fontStyle: "italic",
	},
})

export type NodeDisplayInfo =
	| {
			type: "shown"
			yOffset: number
	  }
	| {
			type: "invisible"
	  }

export type NodeDisplayMap = Map<DiveNode, NodeDisplayInfo>

type TreeRowProps = {
	node: DiveNode
	nodeDisplayMap: NodeDisplayMap
	depth: number
	depthLines: number[]
	/**
	 * Whether this node is the last one at the current depth level.
	 */
	isLast: boolean
	isRoot: boolean
	intersectionObserver: IntersectionObserver | undefined
}

export function RootTreeRow(
	props: Omit<TreeRowProps, "depth" | "depthLines" | "isLast" | "isRoot">
) {
	return (
		<TreeRow
			{...props}
			depth={0}
			depthLines={[]}
			isLast={false}
			isRoot={true}
		/>
	)
}

export function TreeRow(props: TreeRowProps) {
	const {
		node,
		nodeDisplayMap,
		depth,
		depthLines,
		isLast,
		isRoot,
		intersectionObserver,
	} = props
	console.log("TreeRow render")

	const displayInfo = nodeDisplayMap.get(node)
	if (!displayInfo) {
		throw new Error(`Node should be present in nodeDisplayMap`)
	}

	const childElements: JSX.Element[] = []
	for (const [childIndex, child] of iterHelpers.zipWithIndex(
		node.getChildren()
	)) {
		if (nodeDisplayMap.has(child)) {
			const childIsLast = childIndex === node.childCount - 1
			childElements.push(
				<TreeRow
					key={child.id}
					node={child}
					nodeDisplayMap={nodeDisplayMap}
					depth={depth + 1}
					isLast={childIsLast}
					isRoot={false}
					intersectionObserver={intersectionObserver}
					depthLines={[...depthLines, ...(isLast || isRoot ? [] : [depth])]}
				/>
			)
		}
	}

	return (
		<>
			{displayInfo.type === "shown" && (
				<TreeRowBody {...props} displayInfo={displayInfo} />
			)}
			{childElements}
		</>
	)
}

function TreeRowBody(
	props: TreeRowProps & {
		displayInfo: Extract<NodeDisplayInfo, { type: "shown" }>
	}
) {
	const {
		node,
		depth,
		isLast,
		isRoot,
		displayInfo,
		depthLines,
		intersectionObserver,
	} = props

	const containerRef = useRef<HTMLDivElement>(null)

	useRegisterNode(node, containerRef)

	const setNodesExpanded = useSetNodesExpanded()
	const expanded = useNodeState(node).expanded

	const primitiveValue = node.getAttribute(builtinAttribute.primitiveValue)
	const nestedFileType = node.parent
		? node.getAttribute(builtinAttribute.fileTypeName)
		: undefined

	const controller = useDiveController()

	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			if (e.metaKey) {
				void controller.invoke(defaultActions.copyValueToClipboard, {
					node,
					invokedFrom: "other",
				})
			}
		},
		[controller, node]
	)

	const handleContextMenu = useHandleContextMenu(node)

	const decorations = useDecorationsForNode(node)
	const inlineDecorations = decorations.filter(d => d.type === "inline")
	const linkifyDecoration = decorations.filter(d => d.type === "linkify").at(-1) // Take last one.

	const valueRef = useRef<HTMLElement>(null)
	const isOverflowing = useIsOverflowing(valueRef)

	const resolvedName = useMemo(
		(): string => (node.isRoot ? rootNodeToName(node) : node.nameString),
		[node]
	)

	const primitiveValueInner = isDefined(primitiveValue) ? (
		<PrimitiveValueRenderer value={primitiveValue} />
	) : undefined
	let maybePrimitiveValue: JSX.Element | undefined
	if (isDefined(primitiveValue) && isDefined(primitiveValueInner)) {
		const baseStyles: stylex.StyleXStyles = [
			styles.value,
			primitiveTypeStyles[primitiveValue.type],
		]
		maybePrimitiveValue = linkifyDecoration ? (
			<a
				href={linkifyDecoration.href}
				target="_blank"
				rel="noreferrer"
				{...stylex.props(styles.linkifiedValue, baseStyles)}
				ref={gotRef => {
					valueRef.current = gotRef
				}}
			>
				{primitiveValueInner}
			</a>
		) : (
			<div
				{...stylex.props(baseStyles)}
				ref={gotRef => {
					valueRef.current = gotRef
				}}
			>
				{primitiveValueInner}
			</div>
		)
	}

	const { match: findMatch, currentMatch: currentFindMatch } =
		useNodeFindState(node)

	useManageIntersectionObserver({ containerRef, node, intersectionObserver })

	return (
		<div
			tabIndex={0}
			ref={containerRef}
			{...stylex.props(
				styles.rowBody(displayInfo.yOffset),
				styles.rowBodyBackgroundColor,
				findMatch && styles.findMatch,
				currentFindMatch && styles.currentFindMatch
			)}
			onMouseDown={handleMouseDown}
			onContextMenu={handleContextMenu}
		>
			<div {...stylex.props(styles.valuePrefix)}>
				{_.range(0, depth).map(i => (
					<div key={i} {...stylex.props(styles.depthLineWrap)}>
						{depthLines.includes(i) && <ConnectorIcon type={"vertical"} />}
					</div>
				))}
				<div {...stylex.props(styles.iconWrap)}>
					{node.childCount > 0 ? (
						<ExpandIcon
							expanded={expanded}
							onClick={() => {
								setNodesExpanded([node], !expanded)
							}}
							onMouseDown={e => {
								// Prevent capturing focus
								e.preventDefault()
							}}
							connectors={[
								"top",
								...(isLast || isRoot ? [] : ["bottom" as const]),
							]}
						/>
					) : (
						<ConnectorIcon type={isLast ? "corner" : "tri"} />
					)}
				</div>
				<MaybeTypeIcon node={node} />
				<div>
					<span
						{...stylex.props(
							typeof node.name === "number" && styles.numberName
						)}
					>
						{resolvedName}
					</span>
					{isDefined(primitiveValue) && " : "}
				</div>
			</div>
			{maybePrimitiveValue}
			{inlineDecorations.map((d, i) => (
				<React.Fragment key={i}>{d.render()}</React.Fragment>
			))}
			{isDefined(nestedFileType) && (
				<Badge tooltip="Parsed from string value">{nestedFileType}</Badge>
			)}
			{isOverflowing && <MagnifyButton node={node} />}
		</div>
	)
}

function rootNodeToName(node: DiveNode) {
	const fileType = node.getAttribute(builtinAttribute.contentType)
	if (fileType && isMimeType(fileType)) {
		if (fileType === MimeType.Json) {
			return "JSON"
		} else if (fileType === MimeType.JavaScript) {
			return "JavaScript"
		} else if (fileType === MimeType.Csv) {
			return "CSV"
		} else if (fileType === MimeType.JsonLines) {
			return "JSON-Lines"
		} else if (fileType === MimeType.Xml) {
			return "XML"
		} else if (fileType === MimeType.Yaml) {
			return "YAML"
		} else if (fileType === MimeType.OctetStream) {
			return "Unknown"
		} else {
			unreachable(fileType)
		}
	}

	return "Unknown"
}

function MaybeTypeIcon(props: { node: DiveNode }) {
	const { node } = props
	const containerType = node.getAttribute(builtinAttribute.containerType)
	return isDefined(containerType) ? (
		<TypeIconForContainer containerType={containerType} />
	) : null
}

function useManageIntersectionObserver(args: {
	containerRef: React.RefObject<HTMLDivElement | null>
	node: DiveNode
	intersectionObserver: IntersectionObserver | undefined
}) {
	const { containerRef, node, intersectionObserver } = args

	const setNodeVisibility = useSetNodeVisibility()

	useEffect(() => {
		const el = containerRef.current
		if (el && intersectionObserver) {
			console.log("observing..")
			intersectionObserver.observe(el)
			return () => {
				console.log("unobserving")
				intersectionObserver.unobserve(el)
				setNodeVisibility([
					{
						node,
						visible: false,
					},
				])
			}
		}
	}, [containerRef, intersectionObserver, node, setNodeVisibility])
}
