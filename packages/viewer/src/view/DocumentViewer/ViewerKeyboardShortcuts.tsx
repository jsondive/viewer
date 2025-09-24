import { DiveNode } from "../../model/DiveNode"
import {
	useAllActions,
	useAppEventListener,
	useDiveController,
	useFocusedNode,
	useFocusNode,
} from "../../state"
import { ArrowDown, ArrowUp, isDefined, keyMatch } from "@jsondive/library"

export function ViewerKeyboardShortcuts(props: { flatNodes: DiveNode[] }) {
	useViewerKeyboardShortcuts(props.flatNodes)
	return null
}

function useViewerKeyboardShortcuts(flatNodes: DiveNode[]) {
	const focusedNode = useFocusedNode()
	const focusNode = useFocusNode()
	const controller = useDiveController()
	const allActions = useAllActions("keyboardShortcut")

	useAppEventListener("keyDown", (e, motionAmount) => {
		const isUp = keyMatch(e, "k") || keyMatch(e, ArrowUp)
		const isDown = keyMatch(e, "j") || keyMatch(e, ArrowDown)

		if (isUp || isDown) {
			e.preventDefault()

			// Up/down movement.
			if (!focusedNode) {
				return
			}

			const focusedNodeIndex = flatNodes.indexOf(focusedNode)
			if (focusedNodeIndex < 0) {
				return
			}

			const nextFocus =
				flatNodes[
					isDown
						? Math.min(focusedNodeIndex + motionAmount, flatNodes.length - 1)
						: Math.max(focusedNodeIndex - motionAmount, 0)
				]
			focusNode(nextFocus)
		} else {
			for (const action of allActions) {
				if (
					action.availabilityStatus({
						node: focusedNode,
					}).available &&
					isDefined(action.keybinds) &&
					action.keybinds.some(keybind => keyMatch(e, keybind))
				) {
					e.preventDefault()
					void controller.invoke(action, {
						node: focusedNode,
						invokedFrom: "keyboard",
					})
					break
				}
			}
		}
	})
}
