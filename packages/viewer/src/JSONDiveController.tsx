import EventEmitter from "eventemitter3"
import { allAppEvents, AppEventBus, AppEvents } from "./state"
import { DiveNode } from "./model/DiveNode"
import {
	ActionContextWithoutController,
	DiveAction,
} from "./plugins/DiveAction"
import { ScrollToOptions } from "@tanstack/react-virtual"

const IsJSONDiveController = Symbol("IsJSONDiveController")

/**
 * PUBLIC INTERFACE to JSONDiveController.
 *
 * Only add methods here if it's meant to be exposed outside of the viewer package.
 * Within the viewer package you can use JSONDiveControllerImpl directly.
 */
export interface JSONDiveController {
	[IsJSONDiveController]: true

	/**
	 * Non reactive reference to the outer container div.
	 *
	 * This is equivalent to calling <some ref>.current.
	 */
	outerContainer: HTMLDivElement | null

	focusRootNode(): void

	focusNode(node: DiveNode): void

	expandNode(
		node: DiveNode,
		options?: {
			recursively?: boolean
			focusFirstChildIfAlreadyExpanded?: boolean
		}
	): void

	collapseNode(
		node: DiveNode,
		options?: {
			recursively?: boolean
			focusParentIfNotCollapsible?: boolean
		}
	): void

	openFind(): void

	invoke(
		action: DiveAction,
		context: ActionContextWithoutController
	): Promise<void>

	scrollToNode(node: DiveNode, options?: ScrollToOptions): void
}

/**
 * Interface between the controller and performing mutative actions on the App context.
 */
export type JSONDiveContextManipulator = Pick<
	JSONDiveController,
	"expandNode" | "collapseNode" | "openFind" | "focusNode" | "focusRootNode"
>

export type JSONDiveViewerManipulator = Pick<JSONDiveController, "scrollToNode">

export class JSONDiveControllerImpl implements JSONDiveController {
	[IsJSONDiveController] = true as const

	outerContainerRef: React.RefObject<HTMLDivElement | null>

	constructor(args: {
		outerContainerRef: React.RefObject<HTMLDivElement | null>
	}) {
		this.outerContainerRef = args.outerContainerRef
	}

	get outerContainer() {
		return this.outerContainerRef.current
	}

	contextManipulator: JSONDiveContextManipulator | undefined
	viewerManipulator: JSONDiveViewerManipulator | undefined

	/**
	 * Always safe to subscribe to this and it remains stable. As we get
	 * app event bus(es), we proxy events to this.
	 */
	readonly controllerEventBus: AppEventBus = new EventEmitter<AppEvents>()

	appEventBus: AppEventBus | undefined

	unsubscribeFromPreviousEventBus: (() => void) | undefined

	setContextManipulator(manipulator: JSONDiveContextManipulator | undefined) {
		this.contextManipulator = manipulator
	}

	setViewerManipulator(manipulator: JSONDiveViewerManipulator | undefined) {
		this.viewerManipulator = manipulator
	}

	expandNode: JSONDiveController["expandNode"] = (...args) =>
		this.contextManipulator?.expandNode(...args)

	collapseNode: JSONDiveController["collapseNode"] = (...args) =>
		this.contextManipulator?.collapseNode(...args)

	openFind: JSONDiveController["openFind"] = () =>
		this.contextManipulator?.openFind()

	scrollToNode: JSONDiveController["scrollToNode"] = (...args) =>
		this.viewerManipulator?.scrollToNode(...args)

	focusRootNode() {
		this.contextManipulator?.focusRootNode()
	}

	focusNode(node: DiveNode) {
		this.contextManipulator?.focusNode(node)
	}

	async invoke(action: DiveAction, context: ActionContextWithoutController) {
		await action.perform({
			controller: this,
			...context,
		})
		this.appEventBus?.emit("actionPerformed", action, context)
	}

	setAppEventBus(bus: AppEventBus | undefined) {
		// Consume unsubscription.
		this.unsubscribeFromPreviousEventBus?.()
		this.unsubscribeFromPreviousEventBus = undefined

		this.appEventBus = bus

		if (!bus) {
			// No need to proxy.
			return
		}

		// Proxy between buses.
		const unsubscribeFns: Array<() => void> = []
		for (const eventName of allAppEvents) {
			const listener = (...args: any[]) => {
				// eslint-disable-next-line prefer-spread
				this.controllerEventBus.emit.apply(this.controllerEventBus, [
					eventName,
					...args,
				] as any)
			}
			bus.on(eventName, listener)
			unsubscribeFns.push(() => {
				bus.off(eventName, listener)
			})
		}

		const unsubscribeAll: () => void = () => {
			for (const unsubscribeFn of unsubscribeFns) {
				unsubscribeFn()
			}
		}

		this.unsubscribeFromPreviousEventBus = unsubscribeAll
	}

	readonly hasValidDocumentChanged = new EventEmitter<{
		change(newValue: boolean): void
	}>()
	hasValidDocument = false
	setHasValidDocument(newValue: boolean) {
		this.hasValidDocument = newValue
		this.hasValidDocumentChanged.emit("change", newValue)
	}

	static of(controller: JSONDiveController): JSONDiveControllerImpl {
		return controller as JSONDiveControllerImpl
	}
}
