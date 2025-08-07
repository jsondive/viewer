import { Badge } from "@jsondive/library"
import * as lucideReact from "lucide-react"
import { INLINE_DECORATION_ICON_SIZE } from "../../plugins"
import { useState } from "react"
import { DiveNode } from "../../model/DiveNode"
import { builtinAttribute } from "../../model/builtinAttributes"
import * as stylex from "@stylexjs/stylex"

const styles = stylex.create({
	pre: {
		margin: 0,
	},
})

export function MagnifyButton(props: { node: DiveNode }) {
	const { node } = props

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
					setDialogOpen(true)
				}}
			>
				<lucideReact.Search size={INLINE_DECORATION_ICON_SIZE} />
			</Badge>
			{/* <Dialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				title="Value"
			>
				<pre {...stylex.props(styles.pre)}>{stringValue}</pre>
			</Dialog> */}
		</>
	)
}
