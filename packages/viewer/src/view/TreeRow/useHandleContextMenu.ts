import React, { useCallback } from "react"
import { DiveNode } from "../../model/DiveNode"
import _ from "lodash"
import { useAllActions, useDiveController } from "../../state"
import {
	ContextMenuItem,
	useOpenContextMenu,
} from "../../providers/ContextMenuProvider"
import {
	ActionAvailabilityContext,
	ActionAvailabilityStatus,
	DiveAction,
} from "../../plugins/DiveAction"
import { keyToDescription } from "@jsondive/library"

export function useHandleContextMenu(node: DiveNode) {
	const openContextMenu = useOpenContextMenu()
	const controller = useDiveController()
	const allActions = useAllActions("contextMenu")

	return useCallback(
		(e: React.MouseEvent) => {
			if (allActions.length === 0) {
				return
			}

			e.preventDefault()

			const actionGroupMap = _.groupBy(allActions, action => action.group)
			const availabilityContext: ActionAvailabilityContext = { node }
			const actionToAvailabilityStatus = new Map(
				allActions.map((action): [DiveAction, ActionAvailabilityStatus] => [
					action,
					action.availabilityStatus(availabilityContext),
				])
			)

			const groups: ContextMenuItem[][] = Object.values(actionGroupMap)
				.map(actionGroup =>
					actionGroup
						.filter(
							action =>
								actionToAvailabilityStatus.get(action)?.shownInContextMenu
						)
						.map(
							(action): ContextMenuItem => ({
								name: action.name,
								icon: action.icon,
								action: () => {
									controller.invoke(action, {
										node,
										invokedFrom: "contextMenu",
									})
								},
								subtleDescription: action.keybinds
									? action.keybinds.map(keyToDescription).join(", ")
									: "",
							})
						)
				)
				.filter(group => group.length > 0)

			openContextMenu({
				position: [e.clientX, e.clientY],
				itemGroups: groups,
			})
		},
		[allActions, controller, node, openContextMenu]
	)
}
