import {
	addClassName,
	Enter,
	Escape,
	Input,
	isDefined,
	keyMatch,
} from "@jsondive/library"
import * as stylex from "@stylexjs/stylex"
import {
	FindState,
	useAppEventListener,
	useDiveController,
	useFindHTMLElementForNode,
	useFindState,
	useFocusedNode,
	useFocusNode,
	useNodeStates,
	useNodeStatesRef,
	useSetFindState,
} from "../../state"
import * as lucideReact from "lucide-react"
import { DiveNode } from "../../model/DiveNode"
import {
	ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react"
import { executeSearch } from "../../lib/executeSearch"
import { setTemporaryFocusState } from "../../lib/temporaryFocus"
import _ from "lodash"
import {
	AutocompleteAction,
	AutocompleteResults,
	useAutocompleteReducer,
} from "./autocomplete"

const ICON_SIZE = 14

const styles = stylex.create({
	wrap: {
		flexShrink: 0,
		display: "flex",
		alignItems: "center",
		paddingInline: "var(--json-dive-spacing-4)",
		paddingBlock: "var(--json-dive-spacing-2)",
		backgroundColor: "var(--json-dive-color-gray-100)",
		borderTopStyle: "solid",
		borderTopWidth: 1,
		borderTopColor: "var(--json-dive-color-gray-200)",
		color: "var(--json-dive-color-gray-600)",
		cursor: "default",
		gap: "var(--json-dive-spacing-2)",
	},

	controls: {
		flexShrink: 0,
		display: "flex",
		alignItems: "center",
	},

	iconWrap: {
		padding: "var(--json-dive-spacing-0_5)",
	},

	iconButtonWrap: {
		cursor: "pointer",
		userSelect: "none",
	},

	inputWrap: {
		position: "relative",
		flexGrow: 1,
	},

	input: {
		width: "100%",
	},
})

type FindBarProps = { findState: FindState } & MaybeFindBarProps

const ENABLE_AUTOCOMPLETE: boolean = false

export function FindBar(props: FindBarProps) {
	const { findState, rootNode } = props

	const inputRef = useRef<HTMLInputElement>(null)

	const [autocompleteState, autocompleteDispatch] =
		useAutocompleteReducer(rootNode)

	const handleQueryChange = useHandleQueryChange(props, autocompleteDispatch)
	const incrementMatchIndex = useIncrementMatchIndex(props)
	const handleClose = useHandleClose(props)

	useScrollToMatch(props)

	useAppEventListener("focusFind", () => {
		inputRef.current?.select()
	})

	const inputTextWidth = useMemo(
		() => measureTextWidth(findState.query),
		[findState.query]
	)

	return (
		<div {...addClassName(stylex.props(styles.wrap), "json-dive-font-size-sm")}>
			<IconWrap>
				<lucideReact.Search size={ICON_SIZE} />
			</IconWrap>
			<div {...stylex.props(styles.inputWrap)}>
				<Input
					ref={inputRef}
					autoFocus
					style={styles.input}
					placeholder={
						ENABLE_AUTOCOMPLETE
							? "Enter search query or type '$.' to start a JSON path"
							: "Enter search query"
					}
					value={findState.query}
					onChange={handleQueryChange}
					onKeyDown={e => {
						if (keyMatch(e, Escape)) {
							handleClose()
						} else if (keyMatch(e, Enter)) {
							incrementMatchIndex(1)
						} else if (keyMatch(e, [Enter, { shift: true }])) {
							incrementMatchIndex(-1)
						} else if (keyMatch(e, ["f", { command: true }])) {
							e.preventDefault()
							inputRef.current?.select()
						}
					}}
				/>
				{ENABLE_AUTOCOMPLETE && autocompleteState.type === "shown" && (
					<AutocompleteResults
						state={autocompleteState}
						leftOffset={inputTextWidth}
					/>
				)}
			</div>
			<Controls
				onClose={() => handleClose()}
				onNext={() => incrementMatchIndex(1)}
				onPrevious={() => incrementMatchIndex(-1)}
			/>
		</div>
	)
}

const getMeasurementCanvas = _.memoize(() => {
	const canvas = document.createElement("canvas")
	canvas.width = 2000
	canvas.height = 100
	return canvas
})

function measureTextWidth(text: string) {
	const canvas = getMeasurementCanvas()
	const context = canvas.getContext("2d")
	if (!context) {
		console.warn(`measureTextWidth: Could not get canvas context`)
		return 0
	}

	// Keep in sync with font.css.
	context.font = `14px system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`
	return context.measureText(text).width
}

type MaybeFindBarProps = {
	rootNode: DiveNode
	flatNodes: DiveNode[]
}

export function MaybeFindBar(props: MaybeFindBarProps) {
	const findState = useFindState()
	return isDefined(findState) ? (
		<FindBar findState={findState} {...props} />
	) : undefined
}

function Controls(props: {
	onClose: () => void
	onNext: () => void
	onPrevious: () => void
}) {
	const { onClose, onNext, onPrevious } = props
	return (
		<div {...stylex.props(styles.controls)}>
			<IconWrap isButton>
				<lucideReact.ChevronUp size={ICON_SIZE} onClick={onPrevious} />
			</IconWrap>
			<IconWrap isButton>
				<lucideReact.ChevronDown size={ICON_SIZE} onClick={onNext} />
			</IconWrap>
			<IconWrap isButton>
				<lucideReact.CircleX size={ICON_SIZE} onClick={onClose} />
			</IconWrap>
		</div>
	)
}

function IconWrap(props: { children: ReactNode; isButton?: boolean }) {
	const { children, isButton } = props
	return (
		<div {...stylex.props(styles.iconWrap, isButton && styles.iconButtonWrap)}>
			{children}
		</div>
	)
}

function useHandleQueryChange(
	props: FindBarProps,
	autocompleteDispatch: React.ActionDispatch<[action: AutocompleteAction]>
) {
	const { findState, rootNode, flatNodes } = props
	const setFindState = useSetFindState()
	const nodeStates = useNodeStates()
	const restoreNode = useRestoreNode()

	return useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const query = e.currentTarget.value

			const foundNodes = executeSearch({
				query,
				rootNode,
			})

			const oldMatchIndex = findState.currentMatchIndex
			let currentMatchIndex: number | undefined
			if (foundNodes.size > 0) {
				if (isDefined(oldMatchIndex)) {
					// Attempt to preserve old match, otherwise reset to start.
					const oldMatchNode = [...findState.foundNodes][oldMatchIndex]
					const indexInNewMatches = [...foundNodes].indexOf(oldMatchNode)
					if (indexInNewMatches >= 0) {
						currentMatchIndex = indexInNewMatches
					}
				}

				if (!isDefined(currentMatchIndex)) {
					if (restoreNode) {
						// Find the first match that's after the focused node (or wrap around.)
						let foundFocusedNode = false
						for (const node of flatNodes) {
							if (node === restoreNode) {
								foundFocusedNode = true
							}
							if (foundFocusedNode && foundNodes.has(node)) {
								currentMatchIndex = [...foundNodes].indexOf(node)
								break
							}
						}
						currentMatchIndex ??= 0
					} else {
						// Set currentMatchIndex to the first node in the viewport
						let index = 0
						for (const node of foundNodes) {
							if (nodeStates.get(node).visible) {
								currentMatchIndex = index
								break
							}
							index++
						}
					}
				}

				// Fallback (no nodes are visible.)
				currentMatchIndex ??= 0
			}

			setFindState({
				query,
				currentMatchIndex,
				foundNodes,
			})

			autocompleteDispatch({
				type: "updateQuery",
				newQuery: query,
			})
		},
		[
			autocompleteDispatch,
			findState,
			flatNodes,
			nodeStates,
			restoreNode,
			rootNode,
			setFindState,
		]
	)
}

function useIncrementMatchIndex(props: FindBarProps) {
	const { findState } = props
	const setFindState = useSetFindState()

	return useCallback(
		(amount: number) => {
			const numFoundNodes = findState.foundNodes.size
			let newMatchIndex: number | undefined
			if (numFoundNodes === 0) {
				newMatchIndex = undefined
			} else {
				const oldMatchIndex = findState.currentMatchIndex
				if (!isDefined(oldMatchIndex)) {
					newMatchIndex = 0
				} else {
					newMatchIndex = oldMatchIndex + amount
					// Wrap around
					if (newMatchIndex < 0) {
						newMatchIndex += numFoundNodes
					} else {
						newMatchIndex = newMatchIndex % numFoundNodes
					}
				}
			}

			setFindState({
				...findState,
				currentMatchIndex: newMatchIndex,
			})
		},
		[findState, setFindState]
	)
}

function useHandleClose(props: FindBarProps) {
	const { findState } = props

	const focusNode = useFocusNode()
	const setFindState = useSetFindState()
	const findHTMLElementForNode = useFindHTMLElementForNode()
	const restoreNode = useRestoreNode()

	return useCallback(() => {
		setFindState(undefined)

		const currentMatchNode = isDefined(findState.currentMatchIndex)
			? [...findState.foundNodes].at(findState.currentMatchIndex)
			: undefined

		const nodeToFocus = currentMatchNode ?? restoreNode

		if (isDefined(nodeToFocus)) {
			const matchNodeElement = findHTMLElementForNode(nodeToFocus)
			if (isDefined(matchNodeElement)) {
				setTemporaryFocusState(matchNodeElement, true)
			}

			setTimeout(() => {
				focusNode(nodeToFocus)
				if (isDefined(matchNodeElement)) {
					setTimeout(() => {
						setTemporaryFocusState(matchNodeElement, false)
					}, 0)
				}
			}, 0)
		}
	}, [findHTMLElementForNode, findState, focusNode, restoreNode, setFindState])
}

function useScrollToMatch(props: FindBarProps) {
	const { findState } = props
	const nodeStatesRef = useNodeStatesRef()
	const controller = useDiveController()

	useEffect(() => {
		const { foundNodes, currentMatchIndex } = findState
		if (!isDefined(currentMatchIndex)) {
			return
		}

		const currentMatchNode = [...foundNodes][currentMatchIndex]
		const currentMatchVisible =
			nodeStatesRef.current.get(currentMatchNode).visible

		if (!currentMatchVisible) {
			controller.scrollToNode(currentMatchNode, {
				align: "center",
			})
		}
	}, [controller, findState, nodeStatesRef])
}

/**
 * @returns The latest node that the user has focused; we may
 * restore focus to this node when the search bar closes.
 */
function useRestoreNode() {
	const focusedNode = useFocusedNode()
	const [restoreNode, setRestoreNode] = useState(focusedNode)
	useEffect(() => {
		setRestoreNode(currentNode => focusedNode ?? currentNode)
	}, [focusedNode])
	return restoreNode
}
