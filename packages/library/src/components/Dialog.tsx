import { Dialog as BaseDialog } from "@base-ui-components/react"
import { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { addClassName } from "../lib/addClassName"
import * as lucideReact from "lucide-react"

const EDGE_PADDING = "var(--json-dive-spacing-4)"

const styles = stylex.create({
	backdrop: {
		position: "fixed",
		inset: 0,
		backgroundColor: "black",
		opacity: 0.2,
	},

	popupOuter: {
		position: "fixed",
		top: "30%",
		left: "50%",
		transform: "translate(-50%, -30%)",
		outlineStyle: "solid",
		outlineWidth: "1px",
		outlineColor: "var(--json-dive-color-gray-200)",
		backgroundColor: "var(--json-dive-color-white)",
		maxWidth: `calc(100vw - ${EDGE_PADDING} * 2)`,
		maxHeight: `calc(100vh - ${EDGE_PADDING} * 2)`,
		minWidth: `min(500px, calc(100vw - ${EDGE_PADDING} * 2))`,
		display: "flex",
		flexDirection: "column",
		boxShadow: "var(--json-dive-shadow-md)",
	},

	titleBar: {
		display: "flex",
		justifyContent: "space-between",
		paddingInline: "var(--json-dive-spacing-6)",
		paddingTop: "var(--json-dive-spacing-6)",
		paddingBottom: "var(--json-dive-spacing-4)",
		alignItems: "center",
		borderBottomStyle: "solid",
		borderBottomWidth: 2,
		borderBottomColor: "var(--json-dive-color-gray-200)",
		fontWeight: 600,
	},

	content: {
		display: "flex",
		flexDirection: "column",
		paddingInline: "var(--json-dive-spacing-6)",
		paddingTop: "var(--json-dive-spacing-4)",
		paddingBottom: "var(--json-dive-spacing-6)",
		overflow: "scroll",
	},

	closeButton: {
		cursor: "pointer",
		padding: "var(--json-dive-spacing-1)",
	},
})

export function Dialog(props: {
	open: boolean
	children: ReactNode
	onClose: () => void
	title?: string
}) {
	const { open, children, onClose, title } = props

	return (
		<BaseDialog.Root
			open={open}
			onOpenChange={newOpen => {
				if (!newOpen) {
					onClose()
				}
			}}
		>
			<BaseDialog.Portal>
				<BaseDialog.Backdrop {...stylex.props(styles.backdrop)} />
				<BaseDialog.Popup
					{...addClassName(
						stylex.props(styles.popupOuter),
						"json-dive-css-reset"
					)}
				>
					<div {...stylex.props(styles.titleBar)}>
						<div className="json-dive-font-size-xl">{title}</div>
						<div {...stylex.props(styles.closeButton)} onClick={onClose}>
							<lucideReact.X size={15} />
						</div>
					</div>
					<div {...stylex.props(styles.content)}>{children}</div>
				</BaseDialog.Popup>
			</BaseDialog.Portal>
		</BaseDialog.Root>
	)
}
