import {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react"
import { createPortal } from "react-dom"
import * as stylex from "@stylexjs/stylex"
import {
	useFindHTMLElementForNode,
	useFocusNode,
	useGetFocusedNode,
	useNodeRegistryRef,
	useSetFocusedNodeOverride,
} from "../state"
import { DiveNode } from "../model/DiveNode"
import {
	addClassName,
	IconComponent,
	isDefined,
	usePortalContext,
} from "@jsondive/library"
import { setTemporaryFocusState } from "../lib/temporaryFocus"

export const CONTEXT_MENU_ICON_SIZE = 15
const CONTEXT_MENU_MIN_WIDTH_FOR_POSITIONING = 260

export interface ContextMenuItem {
	name: string
	action: () => void
	icon?: IconComponent
	disabled?: boolean
	/**
	 * Shown to the right of the context menu item. Currently used to convey keyboard
	 * shortcuts.
	 */
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

	const portalRef = usePortalContext()

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
					portalRef?.current ?? document.body
				)}
		</ContextMenuContext.Provider>
	)
}

const styles = stylex.create({
	dialog: (x: number, y: number) => ({
		position: "absolute",
		left: x,
		top: y,
		margin: 0,
		padding: 0,
		boxSizing: "border-box",
		outline: "none",
		backgroundColor: "var(--json-dive-color-white)",
		// Same as SessionButton.
		boxShadow: `
			0 10px 15px -3px var(--json-dive-color-light-border),
			0 4px 6px -4px var(--json-dive-color-light-border)
		`,
		borderStyle: "solid",
		borderWidth: 1,
		borderColor: "var(--json-dive-color-light-border)",
		"::backdrop": {
			backgroundColor: "transparent",
		},
	}),

	contextMenuWrap: {
		display: "flex",
		userSelect: "none",
		flexDirection: "column",
	},

	group: {
		display: "flex",
		flexDirection: "column",
		padding: "var(--json-dive-spacing-1)",
	},

	notLastGroup: {
		borderBottomStyle: "solid",
		borderBottomWidth: 1,
		borderBottomColor: "var(--json-dive-color-light-border)",
	},

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

	icon: {
		flexShrink: "0",
	},

	interactibleEnabledItem: {
		backgroundColor: {
			":hover": "var(--json-dive-color-light-border)",
			":active": "var(--json-dive-color-light-border)",
		},
		cursor: "pointer",
	},

	disabledItem: {
		cursor: "default",
		color: "var(--json-dive-color-light-label)",
	},

	subtleDescription: {
		color: "var(--json-dive-color-context-menu-description)",
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
		onClose: onCloseListener,
	} = props

	const dialogRef = useRef<HTMLDialogElement>(null)

	useEffect(() => {
		if (!dialogRef.current) {
			return
		}

		dialogRef.current.showModal()
		// Make it so the dialog can get closed via <esc>. This doesn't work
		// in Safari, but whatever.
		// https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/closedBy
		;(dialogRef.current as any).closedBy = "any"
	}, [])

	const performClose = useCallback(() => {
		dialogRef.current?.close()
	}, [])

	return (
		<dialog
			{...stylex.props(styles.dialog(positionX, positionY))}
			ref={dialogRef}
			onClose={onCloseListener}
			onContextMenu={e => {
				e.preventDefault()
			}}
		>
			<div
				{...addClassName(
					stylex.props(styles.contextMenuWrap),
					"json-dive-css-reset"
				)}
				ref={el => el?.focus()}
			>
				{itemGroups.map((group, i) => (
					<Group
						key={i}
						group={group}
						onItemClicked={performClose}
						isLast={i === itemGroups.length - 1}
					/>
				))}
			</div>
		</dialog>
	)
}

function Group(props: {
	group: ContextMenuItem[]
	onItemClicked: () => void
	isLast: boolean
}) {
	const { group, onItemClicked, isLast } = props
	return (
		<div {...stylex.props(styles.group, !isLast && styles.notLastGroup)}>
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

	const Icon = item.icon

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
				{Icon && (
					<Icon size={CONTEXT_MENU_ICON_SIZE} {...stylex.props(styles.icon)} />
				)}
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
	const getFocusedNode = useGetFocusedNode()
	const setFocusedNodeOverride = useSetFocusedNodeOverride()
	const findHTMLElementForNode = useFindHTMLElementForNode()

	return useCallback(
		(args: { itemGroups: ContextMenuItem[][]; position: [number, number] }) => {
			const focusedNode = getFocusedNode()
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
				itemGroups: args.itemGroups,
				position: args.position,
			})
		},
		[
			contextValue,
			findHTMLElementForNode,
			getFocusedNode,
			setFocusedNodeOverride,
		]
	)
}
