import { addClassName, PortalProvider, Result } from "@jsondive/library"
import React, {
	ReactNode,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
} from "react"
import { AppContextProvider, useSetNodesExpanded } from "./state"
import { DivePlugin } from "./plugins"
import { DocumentViewer } from "./view/DocumentViewer/DocumentViewer"
import { parseIntoNode } from "./lib/parse"
import { DocumentInput } from "./model/DocumentInput"
import * as stylex from "@stylexjs/stylex"
import { DiveNode } from "./model/DiveNode"
import {
	JSONDiveController,
	JSONDiveControllerImpl,
} from "./JSONDiveController"
import { JSONDiveProviders } from "./providers"
import { defaultPlugins } from "./plugins/defaultPlugins"
import { JSONDiveOptions } from "./model/JSONDiveOptions"
import { builtinAttribute } from "./model/builtinAttributes"
import { DefaultErrorComponent } from "./view/DefaultErrorComponent"

export type JSONDiveProps = {
	plugins?: DivePlugin[]
	ref?: React.RefObject<JSONDiveController | null>
	options?: JSONDiveOptions
	errorComponent?: (error: Error) => ReactNode
} & (
	| {
			data: Record<string, unknown>
			input?: undefined
	  }
	| {
			data?: undefined
			input: DocumentInput
	  }
)

const styles = stylex.create({
	wrap: {
		color: "var(--json-dive-color-black)",
		backgroundColor: "var(--json-dive-color-white)",
		display: "flex",
		height: "100%",
		width: "100%",
	},
})

function ParseSuccess(props: {
	plugins: DivePlugin[]
	rootNode: DiveNode
	controller: JSONDiveControllerImpl
	options?: JSONDiveOptions
}) {
	const { plugins, rootNode, controller, options = {}, ...restProps } = props

	useEffect(() => {
		controller.setHasValidDocument(true)
		return () => {
			controller.setHasValidDocument(false)
		}
	}, [controller])

	return (
		<AppContextProvider
			plugins={plugins}
			controller={controller}
			options={options}
		>
			{({ ref, onKeyDown }) => (
				<JSONDiveProviders>
					<SetNodeExpansionStates rootNode={rootNode} />
					<DocumentViewer
						rootNode={rootNode}
						ref={ref}
						onKeyDown={onKeyDown}
						{...restProps}
					/>
				</JSONDiveProviders>
			)}
		</AppContextProvider>
	)
}

function SetNodeExpansionStates(props: { rootNode: DiveNode }) {
	const { rootNode } = props

	const setNodesExpanded = useSetNodesExpanded()

	useEffect(() => {
		const nodesToCollapse: DiveNode[] = []
		rootNode.visitAll(node => {
			if (node.getAttribute(builtinAttribute.defaultCollapsed)) {
				nodesToCollapse.push(node)
			}
		})
		setNodesExpanded(nodesToCollapse, false)
	}, [rootNode, setNodesExpanded])

	return null
}

export function JSONDive(props: JSONDiveProps) {
	const {
		plugins = defaultPlugins,
		ref,
		errorComponent,
		data: _ignoredData,
		input: _ignoredInput,
		...restProps
	} = props

	const parseResult = useMemo(
		() =>
			parseIntoNode(
				props.data ? DocumentInput.fromJson(props.data) : props.input,
				plugins
			),
		[plugins, props.data, props.input]
	)

	const outerContainerRef = useRef<HTMLDivElement>(null)

	const controller = useMemo(
		() =>
			new JSONDiveControllerImpl({
				outerContainerRef,
			}),
		[]
	)

	useImperativeHandle<JSONDiveController, JSONDiveController>(
		ref,
		() => controller,
		[controller]
	)

	return (
		<div
			{...addClassName(
				stylex.props(styles.wrap),
				"json-dive-css-reset json-dive-viewer-instance"
			)}
			ref={outerContainerRef}
		>
			<PortalProvider ref={outerContainerRef}>
				{Result.isSuccess(parseResult) ? (
					<ParseSuccess
						plugins={plugins}
						rootNode={parseResult.value}
						controller={controller}
						{...restProps}
					/>
				) : errorComponent ? (
					errorComponent(parseResult.error)
				) : (
					<DefaultErrorComponent error={parseResult.error} />
				)}
			</PortalProvider>
		</div>
	)
}
