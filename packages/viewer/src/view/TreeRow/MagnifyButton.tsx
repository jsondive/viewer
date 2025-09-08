import {
	Badge,
	Dialog,
	libraryIcons,
	OverridableComponent,
} from "@jsondive/library"
import { INLINE_DECORATION_ICON_SIZE } from "../../plugins"
import { useState } from "react"
import { DiveNode } from "../../model/DiveNode"
import { builtinAttribute } from "../../model/builtinAttributes"
import * as stylex from "@stylexjs/stylex"
import { useOptions } from "../../state"

const styles = stylex.create({
	pre: {
		margin: 0,
	},
})

export function MagnifyButton(props: { node: DiveNode }) {
	const { node } = props

	const { onValueMagnified } = useOptions()

	const [dialogOpen, setDialogOpen] = useState(false)

	const primitiveValue = node.getAttribute(builtinAttribute.primitiveValue)
	if (primitiveValue?.type !== "string") {
		return null
	}
	const stringValue = primitiveValue.value

	return (
		<>
			<Badge
				tooltip={`View full value`}
				onClick={() => {
					if (onValueMagnified) {
						onValueMagnified({
							value: stringValue,
						})
					} else {
						setDialogOpen(true)
					}
				}}
			>
				<OverridableComponent
					overrideKey="magnifyIcon"
					overrideDefault={libraryIcons.Search}
					size={INLINE_DECORATION_ICON_SIZE}
				/>
			</Badge>
			{!onValueMagnified && (
				<Dialog
					open={dialogOpen}
					onClose={() => setDialogOpen(false)}
					title="Value"
				>
					<pre {...stylex.props(styles.pre)}>{stringValue}</pre>
				</Dialog>
			)}
		</>
	)
}
