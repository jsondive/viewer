import {
	intersperseArray,
	isDefined,
	unreachable,
	useIsOverflowing,
} from "@jsondive/library"
import { CannotHandleInput, FileType, DivePlugin } from "."
import { NodeName, RootNodeName } from "../model/DiveNode"
import { Attribute } from "../model/Attribute"
import _ from "lodash"
import { builtinAttribute } from "../model/builtinAttributes"
import {
	parse,
	HTMLElement,
	NodeType,
	Node as ParsedNode,
} from "node-html-parser"
import React, { useRef } from "react"
import * as stylex from "@stylexjs/stylex"
import { NodeBuilder } from "../model/NodeBuilder"
import { Tooltip, TooltipContent, TooltipTrigger } from "@jsondive/library"
import { useMergeRefs } from "../lib/useMergeRefs"
import { MimeType } from "../model/MimeType"

const styles = stylex.create({
	nodeInfoWrap: {
		color: "var(--json-dive-color-light-text)",
		fontFamily: "monospace",
		whiteSpace: "nowrap",
		textOverflow: "ellipsis",
		overflow: "hidden",
	},

	xmlTagName: {
		color: "var(--json-dive-color-xml-tag-name)",
		fontWeight: "normal",
	},

	xmlAttributeName: {
		color: "var(--json-dive-color-xml-attribute-name)",
	},

	xmlAttributeValue: {
		color: "var(--json-dive-color-xml-attribute-value)",
		"::before": {
			content: `'"'`,
		},
		"::after": {
			content: `'"'`,
		},
	},

	tooltipContent: {
		fontFamily: "monospace",
	},
})

type XMLNodeInfo = {
	tagName: string
	attributes: Record<string, string>
}

function xmlNodeInfoToString(xmlNodeInfo: XMLNodeInfo) {
	const { tagName, attributes } = xmlNodeInfo
	let attributesString = ""
	if (Object.keys(attributes).length > 0) {
		attributesString += " "
		attributesString += Object.entries(attributes)
			.map(([k, v]) => `${k}=${v}`)
			.join(" ")
	}
	return `<${tagName}${attributesString}>`
}

export const xmlAttribute = {
	xmlNodeInfo: new Attribute<XMLNodeInfo>("xml.nodeInfo"),
}

export const xml = _.memoize(
	(): DivePlugin => ({
		getFileTypes(): FileType[] {
			return [
				{
					name: "xml",
					parseIntoNode(input) {
						if (input.contentType !== MimeType.Xml) {
							return { error: CannotHandleInput }
						}

						const text = input.asText()
						if (!isDefined(text)) {
							return { error: CannotHandleInput }
						}

						const element = parse(text)

						const nodeBuilder = NodeBuilder.startEmpty()
						buildNodesFromXml(element, RootNodeName, nodeBuilder)
						return {
							value: nodeBuilder.build(),
						}
					},
				},
			]
		},
		getDecorationsForNode(node) {
			const xmlNodeInfo = node.getAttribute(xmlAttribute.xmlNodeInfo)
			if (!xmlNodeInfo) {
				return []
			}

			return [
				{
					type: "inline",
					render: () => <RenderNodeInfo xmlNodeInfo={xmlNodeInfo} />,
				},
			]
		},
	})
)

function RenderNodeInfo(props: { xmlNodeInfo: XMLNodeInfo }) {
	const { xmlNodeInfo } = props

	const nodeInfoRef = useRef<HTMLDivElement>(null)
	const isOverflowing = useIsOverflowing(nodeInfoRef)

	return (
		<Tooltip placement="bottom" {...(!isOverflowing ? { open: false } : {})}>
			<TooltipTrigger asChild>
				{/* HACK: Passing a regular ref messes with the Tooltip since Tooltip's merge
					refs doesn't seem to actually work. Hence this weird extraRef approach. */}
				<NodeInfoInner {...props} extraRef={nodeInfoRef} />
			</TooltipTrigger>
			<TooltipContent>
				<div {...stylex.props(styles.tooltipContent)}>
					{xmlNodeInfoToString(xmlNodeInfo)}
				</div>
			</TooltipContent>
		</Tooltip>
	)
}

function NodeInfoInner(props: {
	xmlNodeInfo: XMLNodeInfo
	ref?: React.RefObject<HTMLDivElement | null>
	extraRef?: React.RefObject<HTMLDivElement | null>
}) {
	const { xmlNodeInfo, ref: propsRef, extraRef } = props
	const attributeEntries = Object.entries(xmlNodeInfo.attributes)

	const mergedRef = useMergeRefs(propsRef, extraRef)

	return (
		<div {...stylex.props(styles.nodeInfoWrap)} ref={mergedRef}>
			&lt;
			<span {...stylex.props(styles.xmlTagName)}>{xmlNodeInfo.tagName}</span>
			{attributeEntries.length > 0 && (
				<>
					{" "}
					{intersperseArray(
						attributeEntries.map(([key, value], i) => (
							<React.Fragment key={i}>
								<span {...stylex.props(styles.xmlAttributeName)}>{key}</span>=
								<span {...stylex.props(styles.xmlAttributeValue)}>{value}</span>
							</React.Fragment>
						)),
						i => (
							<React.Fragment key={i}> </React.Fragment>
						)
					)}
				</>
			)}
			&gt;
		</div>
	)
}

function buildNodesFromXml(
	node: ParsedNode,
	currentName: NodeName,
	parent: NodeBuilder
) {
	const builder = parent.createChild(currentName)

	if (node.nodeType === NodeType.ELEMENT_NODE) {
		const htmlElement = node as HTMLElement
		builder.setAttribute(builtinAttribute.containerType, "object")
		if (htmlElement.tagName) {
			builder.setAttribute(xmlAttribute.xmlNodeInfo, {
				tagName: htmlElement.tagName.toLowerCase(),
				attributes: htmlElement.attributes,
			})
		}

		for (const [i, child] of node.childNodes.entries()) {
			buildNodesFromXml(child, i, builder)
		}
	} else if (node.nodeType === NodeType.TEXT_NODE) {
		builder.setAttribute(builtinAttribute.primitiveValue, {
			type: "string",
			value: node.textContent,
		})
	} else if (node.nodeType === NodeType.COMMENT_NODE) {
		// TODO: comment node
	} else {
		unreachable(node.nodeType)
	}
}
