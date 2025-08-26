import { Result } from "@jsondive/library"
import { DocumentInput } from "../model/DocumentInput"
import { ReactNode } from "react"
import { DiveNode } from "../model/DiveNode"
import { DiveAction } from "./DiveAction"
import { IconPack } from "../model/JSONDiveOptions"

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

export type PluginActionsContext = "contextMenu" | "keyboardShortcut"

export type NodeDecorationContext = {
	icons?: IconPack
}

export type DivePlugin<ActionId = string> = {
	getFileTypes?: () => FileType[]
	getDecorationsForNode?: (
		node: DiveNode,
		context: NodeDecorationContext
	) => NodeDecoration[]
	getActions?: (context: PluginActionsContext) => DiveAction<ActionId>[]
}
