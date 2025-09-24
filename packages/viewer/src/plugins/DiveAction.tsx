import { JSONDiveController } from "../JSONDiveController"
import { DiveNode } from "../model/DiveNode"
import { IconComponent, KeyboardBinding } from "@jsondive/library"

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
	| {
			/**
			 * Is this action available to be executed in any context?
			 */
			available: false
			/**
			 * Should this action be shown in the context menu, if it is available?
			 */
			shownInContextMenu?: undefined
	  }
	| {
			available: true
			shownInContextMenu: boolean
	  }

export const availableAndShown: ActionAvailabilityStatus = {
	available: true,
	shownInContextMenu: true,
}

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
	node?.isContainerAndHasChildren ? availableAndShown : { available: false }

export const shownIfHasFocusedNode = ({
	node,
}: ActionAvailabilityContext): ActionAvailabilityStatus =>
	node ? availableAndShown : { available: false }

export const shownIfHasNonRootNode = ({
	node,
}: ActionAvailabilityContext): ActionAvailabilityStatus =>
	node && !node.isRoot ? availableAndShown : { available: false }
