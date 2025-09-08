import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
	ScrollToOptions,
	useVirtualizer,
	VirtualItem,
} from "@tanstack/react-virtual"
import { NodeDisplayMap, RootTreeRow, treeRowHeight } from "../TreeRow/TreeRow"
import { DiveNode } from "../../model/DiveNode"
import React from "react"
import {
	NodeVisibilityUpdate,
	useDiveController,
	useNodeRegistryRef,
	useNodeStates,
	useOptions,
	useSetNodeVisibilityRef,
} from "../../state"
import * as stylex from "@stylexjs/stylex"
import { MaybeFindBar } from "../FindBar/FindBar"
import { JSONDiveViewerManipulator } from "../../JSONDiveController"
import { ViewerKeyboardShortcuts } from "./ViewerKeyboardShortcuts"
import { ConnectedPathBar } from "../PathBar"

const styles = stylex.create({
	outerWrap: {
		display: "flex",
		flexDirection: "column",
		width: "100%",
	},

	scrollOuterWrap: {
		display: "flex",
		flexDirection: "column",
		overflow: "scroll",
		flexGrow: 1,
	},

	scrollInnerWrap: (height: string) => ({
		display: "flex",
		flexDirection: "column",
		height,
		minHeight: height,
		position: "relative",
		width: "100%",
	}),
})

export type DocumentViewerProps = {
	rootNode: DiveNode
	onKeyDown: (e: React.KeyboardEvent) => void
}

export const DocumentViewer = React.forwardRef(function DocumentViewer(
	props: DocumentViewerProps,
	forwardedRef: React.ForwardedRef<HTMLDivElement>
) {
	const { rootNode, onKeyDown } = props

	const controller = useDiveController()
	const nodeStates = useNodeStates()

	const flatNodes = useMemo(() => {
		const result: DiveNode[] = []
		function addNodeAndChildrenIfExpanded(node: DiveNode) {
			result.push(node)
			if (nodeStates.get(node).expanded) {
				for (const child of node.getChildren()) {
					addNodeAndChildrenIfExpanded(child)
				}
			}
		}
		addNodeAndChildrenIfExpanded(rootNode)
		return result
	}, [rootNode, nodeStates])

	const scrollParentRef = useRef<HTMLDivElement>(null)

	const rowVirtualizer = useVirtualizer({
		count: flatNodes.length,
		getScrollElement: () => scrollParentRef.current,
		estimateSize: () => treeRowHeight,
		overscan: 100,
	})

	const scrollToNode = useCallback(
		(node: DiveNode, options?: ScrollToOptions) => {
			const indexInFlatNodes = flatNodes.indexOf(node)
			if (indexInFlatNodes > 0) {
				rowVirtualizer.scrollToIndex(indexInFlatNodes, options)
			} else {
				console.warn(
					`Tried to scroll to node but it was not in flatNodes:`,
					node
				)
			}
		},
		[flatNodes, rowVirtualizer]
	)

	const viewerManipulator = useMemo(
		(): JSONDiveViewerManipulator => ({
			scrollToNode,
		}),
		[scrollToNode]
	)

	useEffect(() => {
		controller.setViewerManipulator(viewerManipulator)
		return () => {
			controller.setViewerManipulator(undefined)
		}
	}, [viewerManipulator, controller])

	const nodeDisplayMap = useNodeDisplayMap({
		rootNode,
		virtualItems: rowVirtualizer.getVirtualItems(),
		flatNodes,
	})

	const [intersectionObserver, setIntersectionObserver] = useState<
		IntersectionObserver | undefined
	>(undefined)

	const setNodeVisibilityRef = useSetNodeVisibilityRef()
	const nodeRegistryRef = useNodeRegistryRef()

	return (
		<div
			{...stylex.props(styles.outerWrap)}
			onKeyDown={onKeyDown}
			ref={forwardedRef}
		>
			<ViewerKeyboardShortcuts flatNodes={flatNodes} />
			<MaybeFindBar rootNode={rootNode} flatNodes={flatNodes} />
			<div
				{...stylex.props(styles.scrollOuterWrap)}
				ref={el => {
					scrollParentRef.current = el
					setIntersectionObserver(
						currentValue =>
							currentValue ??
							new IntersectionObserver(
								entries => {
									const updates: NodeVisibilityUpdate[] = []
									for (const entry of entries) {
										if (!(entry.target instanceof HTMLElement)) {
											continue
										}

										const registryEntry =
											nodeRegistryRef.current?.findEntryByElement(entry.target)
										if (!registryEntry) {
											continue
										}

										updates.push({
											node: registryEntry.node,
											visible: entry.isIntersecting,
										})
									}
									setNodeVisibilityRef.current?.(updates)
								},
								{
									root: el,
								}
							)
					)
				}}
			>
				<div
					{...stylex.props(
						styles.scrollInnerWrap(`${rowVirtualizer.getTotalSize()}px`)
					)}
				>
					<RootTreeRow
						node={rootNode}
						nodeDisplayMap={nodeDisplayMap}
						intersectionObserver={intersectionObserver}
					/>
				</div>
			</div>
			<PathBarIfEnabled />
		</div>
	)
})

function PathBarIfEnabled() {
	const options = useOptions()
	return !options.hidePathBar ? <ConnectedPathBar /> : null
}

function useNodeDisplayMap(args: {
	rootNode: DiveNode
	virtualItems: VirtualItem[]
	flatNodes: DiveNode[]
}) {
	const { rootNode, virtualItems, flatNodes } = args

	return useMemo(() => {
		const result: NodeDisplayMap = new Map([
			// Root should always be included, even if VirtualItems is empty
			// (as can happen before the container is measured.)
			[rootNode, { type: "invisible" }],
		])

		// Ensure that ancestors are in the DisplayMap so that they can render
		// their children.
		for (const virtualItem of virtualItems) {
			for (const node of flatNodes[virtualItem.index].getAncestorsAndSelf()) {
				result.set(node, {
					type: "invisible",
				})
			}
		}

		// Add shown nodes to the display map.
		for (const virtualItem of virtualItems) {
			const node = flatNodes[virtualItem.index]
			result.set(node, {
				type: "shown",
				yOffset: virtualItem.start,
			})
		}

		return result
	}, [flatNodes, rootNode, virtualItems])
}
