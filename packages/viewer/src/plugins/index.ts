import { Result } from "@jsondive/library"
import { DocumentInput } from "../model/DocumentInput"
import { ReactNode } from "react"
import { DiveNode } from "../model/DiveNode"
import { JSONDiveController } from "../JSONDiveController"
import { DiveAction } from "./DiveAction"

export const CannotHandleInput = Symbol("CannotHandleInput")
export type CannotHandleInput = typeof CannotHandleInput

export type NodeParseResult = Result<DiveNode, Error | CannotHandleInput>

export type NodeDecoration =
	| {
			type: "inline"
			render: () => ReactNode
	  }
	| {
			type: "linkify"
			href: string
	  }

/** For lucide icons used in inline decorations. */
export const INLINE_DECORATION_ICON_SIZE = 15

export type FileType = {
	name: string
	parseIntoNode(input: DocumentInput): NodeParseResult
}

export type PluginContextMenuItem = {
	name: string

	/**
	 * A lucide-react icon. It should be of size CONTEXT_MENU_ICON_SIZE.
	 */
	icon?: ReactNode

	action: (controller: JSONDiveController, node: DiveNode) => void

	/**
	 * String used to group items. You should namespace this with your plugin,
	 * like "myPlugin.foo".
	 *
	 * If not provided, item will be grouped at the top.
	 */
	group?: string

	/**
	 * If not provided, the menu item is always enabled.
	 */
	isEnabled?: (node: DiveNode) => boolean
}

export type DivePluginActionContext = "contextMenu" | "keyboardShortcut"

export type DivePlugin<ActionId = string> = {
	getFileTypes?: () => FileType[]
	getDecorationsForNode?: (node: DiveNode) => NodeDecoration[]
	getActions?: (context: DivePluginActionContext) => DiveAction<ActionId>[]
}
