import React, {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
} from "react"
import { DivePlugin, PluginActionsContext } from "../plugins"
import {
	legacy_createStore as createStore,
	Dispatch as ReduxDispatch,
} from "redux"
import { AnyKeyboardEvent, isDefined, objectKeys } from "@jsondive/library"
import { Record as ImmutableRecord, RecordOf } from "immutable"
import { NodeRegistry } from "./NodeRegistry"
import { DiveNode } from "../model/DiveNode"
import { Map as ImmutableMap } from "immutable"
import EventEmitter from "eventemitter3"
import _ from "lodash"
import { Provider, useDispatch, useSelector, useStore } from "react-redux"
import {
	JSONDiveControllerImpl,
	JSONDiveContextManipulator,
} from "../JSONDiveController"
import {
	ActionContextWithoutController,
	DiveAction,
} from "../plugins/DiveAction"
import { builtinAttribute } from "../model/builtinAttributes"
import { JSONDiveOptions } from "../model/JSONDiveOptions"

export type AppEvents = {
	keyDown: (e: AnyKeyboardEvent, motionAmount: number) => void
	actionPerformed: (
		action: DiveAction,
		context: ActionContextWithoutController
	) => void
	focusFind(): void
}

export type AppEvent = keyof AppEvents

const appEventMap: { [K in AppEvent]: true } = {
	keyDown: true,
	actionPerformed: true,
	focusFind: true,
}

export const allAppEvents = objectKeys(appEventMap)

export type AppEventBus = EventEmitter<AppEvents>

export type AppContextValue = {
	plugins: DivePlugin[]
	eventBus: AppEventBus
	controller: JSONDiveControllerImpl
	options: JSONDiveOptions
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

type AppContextProviderProps = {
	children: (args: {
		ref: React.Ref<HTMLDivElement>
		onKeyDown: (e: React.KeyboardEvent) => void
	}) => ReactNode
	plugins: DivePlugin[]
	controller: JSONDiveControllerImpl
	options: JSONDiveOptions
}

export function AppContextProvider(props: AppContextProviderProps) {
	const { plugins, children, controller, options } = props

	const store = useMemo(() => createStore(appReducer), [])

	const eventBus = useMemo((): AppEventBus => new EventEmitter(), [])

	const contextValue = useMemo(
		(): AppContextValue => ({
			plugins,
			eventBus,
			controller,
			options,
		}),
		[plugins, eventBus, controller, options]
	)

	useEffect(() => {
		controller.setAppEventBus(eventBus)
		return () => controller.setAppEventBus(undefined)
	}, [controller, eventBus])

	const childRef = useRef<HTMLDivElement>(null)
	const onKeyDown = useOnKeyDown(eventBus)

	return (
		<AppContext.Provider value={contextValue}>
			<Provider store={store}>
				<SetManipulator controller={controller} />
				<FocusListeners childRef={childRef} />
				{children({
					ref: childRef,
					onKeyDown,
				})}
			</Provider>
		</AppContext.Provider>
	)
}

function SetManipulator(props: { controller: JSONDiveControllerImpl }) {
	const { controller } = props

	const focusNode = useFocusNode()
	const nodeRegistry = useNodeRegistryRef()
	const setNodesExpanded = useSetNodesExpanded()
	const nodeStates = useNodeStates()
	const setFindState = useSetFindState()
	const appStore = useAppStore()
	const emitFocusFind = useEmitAppEvent("focusFind")

	const getNodeInfo = useCallback(
		(node: DiveNode) => {
			return {
				expandable: isDefined(
					node.getAttribute(builtinAttribute.containerType)
				),
				expanded: Boolean(nodeStates.get(node)?.expanded),
			}
		},
		[nodeStates]
	)

	const manipulator = useMemo(
		(): JSONDiveContextManipulator => ({
			focusRootNode() {
				if (nodeRegistry.current?.rootNode) {
					focusNode(nodeRegistry.current.rootNode)
				}
			},

			expandNode(node, options) {
				const { expandable, expanded } = getNodeInfo(node)
				if (
					options?.focusFirstChildIfAlreadyExpanded &&
					expandable &&
					expanded
				) {
					if (node.firstChild) {
						focusNode(node.firstChild)
					}
				} else {
					setNodesExpanded(
						options?.recursively ? [...node.getFlatChildrenAndSelf()] : [node],
						true
					)
				}
			},

			collapseNode(node, options) {
				const { expandable, expanded } = getNodeInfo(node)
				if (
					options?.focusParentIfNotCollapsible &&
					(!expandable || !expanded)
				) {
					const parent = node.parent
					if (parent) {
						focusNode(parent)
					}
				} else {
					setNodesExpanded(
						options?.recursively ? [...node.getFlatChildrenAndSelf()] : [node],
						false
					)
				}
			},

			openFind() {
				const findAlreadyOpen = isDefined(appStore.getState().findState)
				if (findAlreadyOpen) {
					emitFocusFind()
				} else {
					setFindState(initialFindState)
				}
			},
		}),
		[
			appStore,
			emitFocusFind,
			focusNode,
			getNodeInfo,
			nodeRegistry,
			setFindState,
			setNodesExpanded,
		]
	)

	useEffect(() => {
		controller.setContextManipulator(manipulator)
		return () => {
			controller.setContextManipulator(undefined)
		}
	}, [controller, manipulator])

	return null
}

function FocusListeners(props: {
	childRef: React.RefObject<HTMLElement | null>
}) {
	const { childRef } = props

	const nodeRegistryRef = useNodeRegistryRef()
	const dispatch = useAppDispatch()

	useEffect(() => {
		const element = childRef.current
		if (!element) {
			return
		}

		function focusListener(evt: FocusEvent) {
			if (evt.target instanceof HTMLElement) {
				const registryEntry = nodeRegistryRef.current.findEntryByElement(
					evt.target
				)
				if (registryEntry) {
					dispatch({
						type: "setFocusedNode",
						node: registryEntry.node,
					})
				}
			}
		}

		function blurListener() {
			dispatch({
				type: "setFocusedNode",
				node: undefined,
			})
		}

		element.addEventListener("focus", focusListener, {
			// https://hidde.blog/console-logging-the-focused-element-as-it-changes/
			capture: true,
		})
		element.addEventListener("blur", blurListener, {
			capture: true,
		})

		return () => {
			element.removeEventListener("focus", focusListener)
			element.removeEventListener("blur", blurListener)
		}
	}, [childRef, dispatch, nodeRegistryRef])

	// TODO: need to listen for when set of registered nodes changes?

	return null
}

const KEY_MULTIPLIER_DEBOUNCE_MS = 500

function useOnKeyDown(eventBus: AppEventBus) {
	const motionMultiplier = useRef<number | undefined>(undefined)
	const clearMotionMultiplierTimeoutRef = useRef<number>(0)

	return useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Escape") {
				// Escape clears focus.
				if (
					document.activeElement &&
					document.activeElement instanceof HTMLElement
				) {
					document.activeElement.blur()
				}
			}

			if (
				e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLTextAreaElement
			) {
				// Prevent keyboard shortcuts from firing when typing in an input.
				return
			}

			if (
				_.range(1, 10)
					.map(x => x.toString())
					.includes(e.key)
			) {
				// Numbers act as motion multipliers.
				const keyAsNumber = Number(e.key)
				motionMultiplier.current = keyAsNumber
				clearTimeout(clearMotionMultiplierTimeoutRef.current)
				clearMotionMultiplierTimeoutRef.current = window.setTimeout(() => {
					motionMultiplier.current = undefined
				}, KEY_MULTIPLIER_DEBOUNCE_MS)
			} else {
				eventBus.emit("keyDown", e, motionMultiplier.current ?? 1)
				motionMultiplier.current = undefined
			}
		},
		[eventBus]
	)
}

export function useAppEventListener<E extends AppEvent>(
	eventName: E,
	listener: AppEvents[E]
) {
	const listenerRef = useRef<AppEvents[E]>(listener)
	const eventBus = useAppContext().eventBus

	useEffect(() => {
		function listenerUsingRef(...args: any[]) {
			// eslint-disable-next-line prefer-spread
			;(listenerRef.current as (...args: any[]) => void).apply(
				null,
				args as any
			)
		}
		eventBus.addListener(eventName, listenerUsingRef)
		return () => {
			eventBus.removeListener(eventName, listenerUsingRef)
		}
	}, [eventBus, eventName])

	useEffect(() => {
		listenerRef.current = listener
	}, [listener])
}

export function useEmitAppEvent<E extends AppEvent>(
	eventName: E
): AppEvents[E] {
	const eventBus = useAppContext().eventBus

	return useCallback(
		(...args: any[]) => {
			// eslint-disable-next-line prefer-spread
			eventBus.emit.apply(eventBus, [eventName, ...args] as any)
		},
		[eventBus, eventName]
	) as AppEvents[E]
}

export function useNodeRegistryRef() {
	const nodeRegistry = useAppSelector(state => state.nodeRegistry)
	const ref = useRef<NodeRegistry>(nodeRegistry)

	useEffect(() => {
		ref.current = nodeRegistry
	}, [nodeRegistry])

	return ref
}

export function useFindHTMLElementForNode() {
	const nodeRegistry = useAppSelector(state => state.nodeRegistry)
	return useCallback(
		(node: DiveNode) => nodeRegistry.findEntryByNode(node)?.element,
		[nodeRegistry]
	)
}

export function useFocusNode() {
	const findHTMLElementForNode = useFindHTMLElementForNode()

	return useCallback(
		(node: DiveNode) => {
			const element = findHTMLElementForNode(node)
			element?.focus()
		},
		[findHTMLElementForNode]
	)
}

function useAppContext() {
	const contextValue = useContext(AppContext)
	if (!contextValue) {
		throw new Error("Must be called from within AppContextProvider")
	}
	return contextValue
}

export function useDiveController() {
	return useAppContext().controller
}

function useAppDispatch() {
	return useDispatch<ReduxDispatch<AppAction>>()
}

export function useAppSelector<T>(selector: (state: AppState) => T) {
	return useSelector(selector)
}

function useAppStore() {
	return useStore<AppState>()
}

export function usePlugins() {
	return useAppContext().plugins
}

export function useAllActions(context: PluginActionsContext) {
	const plugins = usePlugins()

	return useMemo(
		() => plugins.flatMap(plugin => plugin.getActions?.(context) ?? []),
		[context, plugins]
	)
}

type NodeStateProps = {
	expanded: boolean
	visible: boolean
}

const makeNodeState = ImmutableRecord<NodeStateProps>({
	expanded: true,
	visible: false,
})

type NodeState = RecordOf<NodeStateProps>

export type FindState = {
	query: string
	/** Will be undefined if the query is empty. */
	currentMatchIndex: number | undefined
	foundNodes: Set<DiveNode>
}

export const initialFindState: FindState = {
	query: "",
	currentMatchIndex: undefined,
	foundNodes: new Set(),
}

type AppStateProps = {
	nodeRegistry: NodeRegistry
	focusedNode: DiveNode | undefined
	/**
	 * Set by the context menu when real focus is temporarily lost.
	 */
	focusedNodeOverride: DiveNode | undefined
	nodeStates: ImmutableMap<DiveNode, NodeState>
	findState: FindState | undefined
}

const makeAppState = ImmutableRecord<AppStateProps>({
	nodeRegistry: NodeRegistry.empty(),
	focusedNode: undefined,
	focusedNodeOverride: undefined,
	nodeStates: ImmutableMap(),
	findState: undefined,
})

type AppState = RecordOf<AppStateProps>

export type NodeVisibilityUpdate = {
	node: DiveNode
	visible: boolean
}

type AppAction =
	| {
			type: "registerNode"
			node: DiveNode
			element: HTMLElement
	  }
	| {
			type: "unregisterNode"
			node: DiveNode
	  }
	| {
			type: "setFocusedNode"
			node: DiveNode | undefined
	  }
	| {
			type: "setFocusedNodeOverride"
			node: DiveNode | undefined
	  }
	| {
			type: "setNodesExpanded"
			nodes: DiveNode[]
			expanded: boolean
	  }
	| {
			type: "setFindState"
			findState: FindState | undefined
	  }
	| {
			type: "setNodeVisibility"
			updates: NodeVisibilityUpdate[]
	  }

function unreachableNoThrow(_x: never) {}

function appReducer(
	state: AppState = makeAppState(),
	action: AppAction
): AppState {
	if (action.type === "registerNode") {
		return state.set(
			"nodeRegistry",
			state.nodeRegistry.register({
				node: action.node,
				element: action.element,
			})
		)
	} else if (action.type === "unregisterNode") {
		return state.set(
			"nodeRegistry",
			state.nodeRegistry.unregisterNode(action.node)
		)
	} else if (action.type === "setFocusedNode") {
		return state.set("focusedNode", action.node)
	} else if (action.type === "setFocusedNodeOverride") {
		return state.set("focusedNodeOverride", action.node)
	} else if (action.type === "setNodesExpanded") {
		return state.set(
			"nodeStates",
			state.nodeStates.withMutations(mutableNodeStates => {
				for (const node of action.nodes) {
					mutableNodeStates.set(
						node,
						state.nodeStates
							.get(node, emptyNodeState)
							.set("expanded", action.expanded)
					)
				}
			})
		)
	} else if (action.type === "setFindState") {
		return state.set("findState", action.findState)
	} else if (action.type === "setNodeVisibility") {
		return state.set(
			"nodeStates",
			state.nodeStates.withMutations(map => {
				for (const { node, visible } of action.updates) {
					map.set(node, map.get(node, emptyNodeState).set("visible", visible))
				}
			})
		)
	} else {
		// Don't want to throw here because Redux actually secretly passes us
		// an initialization action that isn't captured in the types.
		// https://redux.js.org/usage/structuring-reducers/initializing-state
		unreachableNoThrow(action)
		return state
	}
}

export function useRegisterNode(
	node: DiveNode,
	ref: React.RefObject<HTMLElement | null>
) {
	const dispatch = useAppDispatch()

	useEffect(() => {
		const element = ref.current
		if (element) {
			dispatch({
				type: "registerNode",
				node,
				element,
			})
		}

		return () => {
			dispatch({
				type: "unregisterNode",
				node,
			})
		}
	}, [dispatch, node, ref])
}

export function useSetNodesExpanded() {
	const dispatch = useAppDispatch()

	return useCallback(
		(nodes: DiveNode[], expanded: boolean) => {
			dispatch({
				type: "setNodesExpanded",
				nodes,
				expanded,
			})
		},
		[dispatch]
	)
}

export function useSetNodeVisibility() {
	const dispatch = useAppDispatch()

	return useCallback(
		(updates: NodeVisibilityUpdate[]) => {
			dispatch({
				type: "setNodeVisibility",
				updates,
			})
		},
		[dispatch]
	)
}

export function useSetNodeVisibilityRef() {
	const setNodeVisibility = useSetNodeVisibility()
	const ref =
		useRef<(updates: NodeVisibilityUpdate[]) => void | undefined>(null)
	useEffect(() => {
		ref.current = setNodeVisibility
		return () => {
			ref.current = null
		}
	})
	return ref
}

const emptyNodeState = makeNodeState()

export function useNodeState(node: DiveNode): NodeState {
	return useAppSelector(state => state.nodeStates.get(node) ?? emptyNodeState)
}

export type NodeStatesInterface = {
	get(node: DiveNode): NodeState
}

export function useNodeStates(): NodeStatesInterface {
	const nodeStates = useAppSelector(state => state.nodeStates)

	return useMemo(
		(): NodeStatesInterface => ({
			get: node => nodeStates.get(node) ?? emptyNodeState,
		}),
		[nodeStates]
	)
}

export function useNodeStatesRef() {
	const nodeStates = useNodeStates()
	const ref = useRef<NodeStatesInterface>(nodeStates)
	useEffect(() => {
		ref.current = nodeStates
	}, [nodeStates])
	return ref
}

export function useFocusedNode() {
	return useAppSelector(state => state.focusedNodeOverride ?? state.focusedNode)
}

export function useSetFocusedNodeOverride() {
	const dispatch = useAppDispatch()

	return useCallback(
		(node: DiveNode | undefined) =>
			dispatch({
				type: "setFocusedNodeOverride",
				node,
			}),
		[dispatch]
	)
}

export function useFindState() {
	return useAppSelector(state => state.findState)
}

export function useNodeFindState(node: DiveNode) {
	const findState = useAppSelector(state => {
		return state.findState
	})

	const foundNodes = findState?.foundNodes
	const currentMatchIndex = findState?.currentMatchIndex

	return useMemo(
		() => ({
			match: Boolean(foundNodes?.has(node)),
			currentMatch: Boolean(
				foundNodes && [...foundNodes].indexOf(node) === currentMatchIndex
			),
		}),
		[currentMatchIndex, foundNodes, node]
	)
}

export function useSetFindState() {
	const dispatch = useAppDispatch()

	return useCallback(
		(findState: FindState | undefined) =>
			dispatch({
				type: "setFindState",
				findState,
			}),
		[dispatch]
	)
}

export function useDecorationsForNode(node: DiveNode) {
	const plugins = usePlugins()
	const options = useOptions()

	return useMemo(
		() =>
			plugins.flatMap(
				plugin =>
					plugin.getDecorationsForNode?.(node, {
						icons: options.icons,
					}) ?? []
			),
		[plugins, node, options.icons]
	)
}

export function useOptions() {
	return useAppContext().options
}
