import _ from "lodash"
import { DivePlugin } from "."
import * as lucideReact from "lucide-react"
import {
	DiveAction,
	shownIfHasChildren,
	shownIfHasFocusedNode,
	shownIfHasNonRootNode,
} from "./DiveAction"
import { CONTEXT_MENU_ICON_SIZE } from "../providers/ContextMenuProvider"
import { tryWriteClipboard, ArrowLeft, ArrowRight } from "@jsondive/library"

export type DefaultActionId =
	| "default.expand"
	| "default.expandAll"
	| "default.expandFirstLevel"
	| "default.collapse"
	| "default.collapseAll"
	| "default.copyValueToClipboard"
	| "default.copyMinifiedValueToClipboard"
	| "default.copyKeyToClipboard"
	| "default.copyPathToClipboard"
	| "default.openFind"

type RemovePrefix<T extends string> = T extends `default.${infer U}` ? U : never

const defaultActionGroups = {
	default: "default.defaultGroup",
	expand: "default.expandGroup",
	collapse: "default.collapseGroup",
	copy: "default.copyGroup",
	find: "default.find",
}

const defaultActionMap: {
	[K in RemovePrefix<DefaultActionId>]: DiveAction<`default.${K}`>
} = {
	expand: {
		id: "default.expand",
		name: "Expand",
		group: defaultActionGroups.expand,
		async perform({ controller, node, invokedFrom }) {
			if (node) {
				controller.expandNode(node, {
					focusFirstChildIfAlreadyExpanded: invokedFrom === "keyboard",
				})
			}
		},
		availabilityStatus: shownIfHasChildren,
		icon: <lucideReact.ArrowRight size={CONTEXT_MENU_ICON_SIZE} />,
		keybinds: [ArrowRight, "l"],
	},

	expandAll: {
		id: "default.expandAll",
		name: "Expand all",
		group: defaultActionGroups.expand,
		async perform({ controller, node }) {
			if (node) {
				controller.expandNode(node, { recursively: true })
			}
		},
		availabilityStatus: shownIfHasChildren,
		icon: <lucideReact.ArrowRightFromLine size={CONTEXT_MENU_ICON_SIZE} />,
		keybinds: [["l", { shift: true }]],
	},

	expandFirstLevel: {
		id: "default.expandFirstLevel",
		name: "Expand first level",
		group: defaultActionGroups.expand,
		async perform({ controller, node }) {
			if (node) {
				controller.expandNode(node)
				for (const child of node.getChildren()) {
					controller.expandNode(child)
				}
			}
		},
		availabilityStatus: shownIfHasChildren,
		icon: <lucideReact.ArrowRightFromLine size={CONTEXT_MENU_ICON_SIZE} />,
	},

	collapse: {
		id: "default.collapse",
		name: "Collapse",
		group: defaultActionGroups.collapse,
		async perform({ controller, node, invokedFrom }) {
			if (node) {
				controller.collapseNode(node, {
					focusParentIfNotCollapsible: invokedFrom === "keyboard",
				})
			}
		},
		availabilityStatus: shownIfHasChildren,
		icon: <lucideReact.ArrowLeft size={CONTEXT_MENU_ICON_SIZE} />,
		keybinds: [ArrowLeft, "h"],
	},

	collapseAll: {
		id: "default.collapseAll",
		name: "Collapse all",
		group: defaultActionGroups.collapse,
		async perform({ controller, node }) {
			if (node) {
				controller.collapseNode(node, { recursively: true })
			}
		},
		availabilityStatus: shownIfHasChildren,
		icon: <lucideReact.ArrowLeftFromLine size={CONTEXT_MENU_ICON_SIZE} />,
		keybinds: [["h", { shift: true }]],
	},

	copyValueToClipboard: {
		id: "default.copyValueToClipboard",
		name: "Copy to clipboard",
		group: defaultActionGroups.copy,
		async perform({ node }) {
			if (node) {
				await tryWriteClipboard(node.getCopyToClipboardValue({ minify: false }))
			}
		},
		availabilityStatus: shownIfHasFocusedNode,
		icon: <lucideReact.Clipboard size={CONTEXT_MENU_ICON_SIZE} />,
		keybinds: [["c", { command: true }]],
	},

	copyMinifiedValueToClipboard: {
		id: "default.copyMinifiedValueToClipboard",
		name: "Copy to clipboard (minified)",
		group: defaultActionGroups.copy,
		async perform({ node }) {
			if (node) {
				await tryWriteClipboard(node.getCopyToClipboardValue({ minify: true }))
			}
		},
		availabilityStatus: shownIfHasFocusedNode,
		icon: <lucideReact.Clipboard size={CONTEXT_MENU_ICON_SIZE} />,
	},

	copyKeyToClipboard: {
		id: "default.copyKeyToClipboard",
		name: "Copy key to clipboard",
		group: defaultActionGroups.copy,
		async perform({ node }) {
			if (node) {
				await tryWriteClipboard(node.nameString)
			}
		},
		availabilityStatus: shownIfHasNonRootNode,
		icon: <lucideReact.Clipboard size={CONTEXT_MENU_ICON_SIZE} />,
	},

	copyPathToClipboard: {
		id: "default.copyPathToClipboard",
		name: "Copy JSON path to clipboard",
		group: defaultActionGroups.copy,
		async perform({ node }) {
			if (node) {
				await tryWriteClipboard(node.pathString)
			}
		},
		availabilityStatus: shownIfHasNonRootNode,
		icon: <lucideReact.Clipboard size={CONTEXT_MENU_ICON_SIZE} />,
		keybinds: [["p", { command: true }]],
	},

	openFind: {
		id: "default.openFind",
		name: "Find",
		group: defaultActionGroups.find,
		async perform({ controller }) {
			controller.openFind()
		},
		availabilityStatus: () => ({ type: "hidden" }),
		keybinds: ["/", ["f", { command: true }]],
		icon: <lucideReact.Search size={CONTEXT_MENU_ICON_SIZE} />,
	},
}

type DefaultActionsPluginOptions = {
	enabledActions?: Array<DefaultActionId>
}

const defaultEnabledActions: DefaultActionId[] = [
	"default.collapse",
	"default.collapseAll",
	"default.copyValueToClipboard",
	"default.expand",
	"default.expandAll",
]

const defaultActionsFn = _.memoize(
	(
		options: DefaultActionsPluginOptions = {
			enabledActions: defaultEnabledActions,
		}
	): DivePlugin<DefaultActionId> => ({
		getActions(context) {
			return Object.values(defaultActionMap).filter(
				action =>
					context !== "contextMenu" ||
					!options.enabledActions ||
					options.enabledActions.includes(action.id)
			)
		},
	}),
	options => JSON.stringify(options)
)

/**
 * Construct the plugin by calling this: `defaultActions()`.
 *
 * Access actions by invoking them as members. Example: `defaultActions.copyPathToClipboard`.
 */
export const defaultActions = (() => {
	const result = defaultActionsFn as typeof defaultActionsFn &
		typeof defaultActionMap
	Object.assign(result, defaultActionMap)
	return result
})()
