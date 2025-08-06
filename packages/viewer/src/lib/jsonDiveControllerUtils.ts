import { useEffect, useRef, useState } from "react"
import {
	JSONDiveController,
	JSONDiveControllerImpl,
} from "../JSONDiveController"
import { AppEvent, AppEvents } from "../state"
import {
	ActionContextWithoutController,
	DiveAction,
} from "../plugins/DiveAction"

type ControllerRef =
	| React.RefObject<JSONDiveController | null>
	| (() => JSONDiveController | null | undefined)

function resolveControllerRef(
	ref: ControllerRef
): JSONDiveController | undefined {
	return (typeof ref === "function" ? ref() : ref.current) ?? undefined
}

function useControllerEventListener<E extends AppEvent>(
	controllerRef: ControllerRef,
	eventName: E,
	listener: AppEvents[E]
) {
	const listenerRef = useRef<AppEvents[E]>(listener)

	useEffect(() => {
		const controller = resolveControllerRef(controllerRef)
		if (!controller) {
			return
		}

		function listenerUsingRef(...args: any[]) {
			// eslint-disable-next-line prefer-spread
			;(listenerRef.current as (...args: any[]) => void).apply(
				null,
				args as any
			)
		}

		const { controllerEventBus } = JSONDiveControllerImpl.of(controller)
		controllerEventBus.addListener(eventName, listenerUsingRef)
		return () => {
			controllerEventBus.removeListener(eventName, listenerUsingRef)
		}
	}, [controllerRef, eventName])

	useEffect(() => {
		listenerRef.current = listener
	}, [listener])
}

export function useOnActionPerformed(
	controllerRef: ControllerRef,
	listener: (
		action: DiveAction,
		context: ActionContextWithoutController
	) => void
) {
	useControllerEventListener(controllerRef, "actionPerformed", listener)
}

/**
 * @returns Whether the JSON Dive component is currently rendering a valid
 * document (otherwise it's in an error or empty state.)
 */
export function useHasValidDocument(controllerRef: ControllerRef) {
	const [value, setValue] = useState(false)

	useEffect(() => {
		const controller = resolveControllerRef(controllerRef)
		if (!controller) {
			return
		}

		const controllerImpl = JSONDiveControllerImpl.of(controller)
		setValue(controllerImpl.hasValidDocument)
		function listener(newValue: boolean) {
			setValue(newValue)
		}
		controllerImpl.hasValidDocumentChanged.addListener("change", listener)
		return () => {
			controllerImpl.hasValidDocumentChanged.removeListener("change", listener)
		}
	}, [controllerRef])

	return value
}
