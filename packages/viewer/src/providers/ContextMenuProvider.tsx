import {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react"
import { createPortal } from "react-dom"
import * as stylex from "@stylexjs/stylex"
import {
	useFindHTMLElementForNode,
	useFocusedNode,
	useFocusNode,
	useNodeRegistryRef,
	useSetFocusedNodeOverride,
} from "../state"
import { DiveNode } from "../model/DiveNode"
import { addClassName, isDefined } from "@jsondive/library"
import { setTemporaryFocusState } from "../lib/temporaryFocus"

// TODO: rename this to action icon size; move to actions module?
export const CONTEXT_MENU_ICON_SIZE = 15
export interface ContextMenuItem {
	name: string
	action: () => void
	icon?: ReactNode
	disabled?: boolean
	subtleDescription?: string
}

export type ContextMenuState =
	| {
			open: true
			itemGroups: ContextMenuItem[][]
			position: [number, number]
			startFocusedNode: DiveNode | undefined
	  }
	| { open: false }

type ContextMenuContextValue = {
	state: ContextMenuState
	setState(newState: ContextMenuState): void
}

const ContextMenuContext = createContext<ContextMenuContextValue | undefined>(
	undefined
)

export function ContextMenuProvider(props: { children: ReactNode }) {
	const { children } = props

	const [state, setState] = useState<ContextMenuState>({ open: false })

	const contextValue = useMemo(
		(): ContextMenuContextValue => ({
			state,
			setState,
		}),
		[state]
	)

	return (
		<ContextMenuContext.Provider value={contextValue}>
			{children}
			{state.open &&
				createPortal(
					<ContextMenuWithClose state={state} setState={setState} />,
					document.body
				)}
		</ContextMenuContext.Provider>
	)
}

const styles = stylex.create({
	contextMenuWrap: (x: number, y: number) => ({
		position: "absolute",
		left: x,
		top: y,
		display: "flex",
		backgroundColor: "var(--json-dive-color-white)",
		userSelect: "none",
		flexDirection: "column",
		// Same as SessionButton.
		boxShadow: `
			0 10px 15px -3px var(--json-dive-color-gray-200),
			0 4px 6px -4px var(--json-dive-color-gray-200)
		`,
		outline: "0",
	}),

	overlay: {
		position: "fixed",
		inset: 0,
	},

	group: {
		display: "flex",
		flexDirection: "column",
		padding: "var(--json-dive-spacing-1)",
	},

	notLastGroup: {
		borderBottomStyle: "solid",
		borderBottomWidth: 1,
		borderBottomColor: "var(--json-dive-color-gray-200)",
	},

	lastGroup: {},

	item: {
		display: "flex",
		userSelect: "none",
		paddingInline: "var(--json-dive-spacing-2)",
		paddingBlock: "var(--json-dive-spacing-1)",
		borderRadius: "var(--json-dive-radius-sm)",
		outline: "0",
		alignItems: "center",
		justifyContent: "space-between",
	},

	nameAndIcon: {
		display: "flex",
		alignItems: "center",
		gap: 4,
	},

	interactibleEnabledItem: {
		backgroundColor: {
			":hover": "var(--json-dive-color-gray-200)",
			":active": "var(--json-dive-color-gray-200)",
		},
		cursor: "pointer",
	},

	disabledItem: {
		cursor: "default",
		color: "var(--json-dive-color-gray-600)",
	},

	subtleDescription: {
		color: "var(--json-dive-color-gray-300)",
		display: "flex",
		alignItems: "center",
		// Hokey way to get them all to be the same width.
		// Better would be to use CSS grid.
		minWidth: 36,
		justifyContent: "flex-end",
	},
})

function ContextMenuWithClose(
	props: Omit<ContextMenuProps, "onClose"> & {
		setState: ContextMenuContextValue["setState"]
	}
) {
	const { setState, ...restProps } = props
	const {
		state: { startFocusedNode },
	} = restProps

	const nodeRegistryRef = useNodeRegistryRef()
	const focusNode = useFocusNode()
	const setFocusedNodeOverride = useSetFocusedNodeOverride()

	const handleClose = useCallback(() => {
		if (startFocusedNode) {
			// Remove the temporary focus override.
			setFocusedNodeOverride(undefined)
			const registryEntry =
				nodeRegistryRef.current.findEntryByNode(startFocusedNode)
			if (registryEntry) {
				setTemporaryFocusState(registryEntry.element, false)
			}
			// Restore focus.
			focusNode(startFocusedNode)
		}
		setState({ open: false })
	}, [
		focusNode,
		nodeRegistryRef,
		setFocusedNodeOverride,
		setState,
		startFocusedNode,
	])

	return <ContextMenu {...restProps} onClose={handleClose} />
}

type ContextMenuProps = {
	state: Extract<ContextMenuState, { open: true }>
	onClose: () => void
}

function ContextMenu(props: ContextMenuProps) {
	const {
		state: {
			itemGroups,
			position: [positionX, positionY],
		},
		onClose,
	} = props

	useCloseOnEscape(onClose)

	return (
		<Overlay onClickOutside={onClose}>
			<div
				tabIndex={0}
				{...addClassName(
					stylex.props(styles.contextMenuWrap(positionX, positionY)),
					"json-dive-css-reset"
				)}
				ref={el => el?.focus()}
			>
				{itemGroups.map((group, i) => (
					<Group
						key={i}
						group={group}
						onItemClicked={onClose}
						isLast={i === itemGroups.length - 1}
					/>
				))}
			</div>
		</Overlay>
	)
}

function useCloseOnEscape(onClose: () => void) {
	useEffect(() => {
		function listener(e: KeyboardEvent) {
			if (e.key === "Escape") {
				onClose()
			}
		}
		window.addEventListener("keydown", listener)
		return () => window.removeEventListener("keydown", listener)
	}, [onClose])
}

function Overlay(props: { children: ReactNode; onClickOutside: () => void }) {
	const { children, onClickOutside } = props
	return (
		<div
			{...stylex.props(styles.overlay)}
			onClick={onClickOutside}
			onContextMenu={e => {
				e.preventDefault()
				e.stopPropagation()
			}}
		>
			{children}
		</div>
	)
}

function Group(props: {
	group: ContextMenuItem[]
	onItemClicked: () => void
	isLast: boolean
}) {
	const { group, onItemClicked, isLast } = props
	return (
		<div
			{...stylex.props(
				styles.group,
				isLast ? styles.lastGroup : styles.notLastGroup
			)}
		>
			{group.map((item, i) => (
				<RenderContextMenuItem key={i} item={item} onClick={onItemClicked} />
			))}
		</div>
	)
}

export function RenderContextMenuItem(props: {
	item: ContextMenuItem
	onClick: (() => void) | undefined
}) {
	const { item, onClick } = props

	return (
		<div
			tabIndex={0}
			{...stylex.props(
				styles.item,
				item.disabled && styles.disabledItem,
				!item.disabled && isDefined(onClick) && styles.interactibleEnabledItem
			)}
			onClick={e => {
				e.preventDefault()
				e.stopPropagation()

				if (!item.disabled) {
					item.action()
					onClick?.()
				}
			}}
		>
			<div {...stylex.props(styles.nameAndIcon)}>
				{item.icon}
				<div>{item.name}</div>
			</div>
			{item.subtleDescription && (
				<div {...stylex.props(styles.subtleDescription)}>
					{item.subtleDescription}
				</div>
			)}
		</div>
	)
}

export function useOpenContextMenu() {
	const contextValue = useContext(ContextMenuContext)
	const focusedNode = useFocusedNode()
	const setFocusedNodeOverride = useSetFocusedNodeOverride()
	const findHTMLElementForNode = useFindHTMLElementForNode()

	return useCallback(
		(args: { itemGroups: ContextMenuItem[][]; position: [number, number] }) => {
			if (focusedNode) {
				// In order to prevent a flicker when the menu closes (during which focus
				// actually does change), we add a temporary class to the node such that
				// it *looks* highlighted. We do in fact restore focus (and remove this class)
				// in handleClose.
				setFocusedNodeOverride(focusedNode)
				const focusedElement = findHTMLElementForNode(focusedNode)
				if (focusedElement) {
					setTemporaryFocusState(focusedElement, true)
				}
			}

			contextValue?.setState({
				open: true,
				startFocusedNode: focusedNode,
				...args,
			})
		},
		[contextValue, findHTMLElementForNode, focusedNode, setFocusedNodeOverride]
	)
}
