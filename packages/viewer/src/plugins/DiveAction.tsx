import { JSONDiveController } from "../JSONDiveController"
import { DiveNode } from "../model/DiveNode"
import { IconComponent, isDefined, KeyboardBinding } from "@jsondive/library"
import { builtinAttribute } from "../model/builtinAttributes"

export type ActionContext = {
	controller: JSONDiveController
	node: DiveNode | undefined
	invokedFrom: "keyboard" | "contextMenu" | "other"
}

export type ActionContextWithoutController = Omit<ActionContext, "controller">

export type ActionAvailabilityContext = {
	node: DiveNode | undefined
}

export type ActionAvailabilityStatus =
	// Available in context menu and command palette.
	| { type: "available" }
	// Shown as disabled.
	| { type: "disabled" }
	// Hidden from context menu and command palette.
	| { type: "hidden" }

export type DiveAction<ActionId = string> = {
	id: ActionId
	name: string
	/**
	 * @deprecated Do not call perform directly, use JSONDiveController.invoke!
	 */
	perform(context: ActionContext): Promise<void>
	icon?: IconComponent
	availabilityStatus(
		context: ActionAvailabilityContext
	): ActionAvailabilityStatus
	group: string
	keybinds?: Array<KeyboardBinding>
}

export const shownIfHasChildren = ({
	node,
}: ActionAvailabilityContext): ActionAvailabilityStatus =>
	node &&
	isDefined(node.getAttribute(builtinAttribute.containerType)) &&
	node.childCount > 0
		? { type: "available" }
		: { type: "hidden" }

export const shownIfHasFocusedNode = ({
	node,
}: ActionAvailabilityContext): ActionAvailabilityStatus =>
	node ? { type: "available" } : { type: "hidden" }

export const shownIfHasNonRootNode = ({
	node,
}: ActionAvailabilityContext): ActionAvailabilityStatus =>
	node && !node.isRoot ? { type: "available" } : { type: "hidden" }
