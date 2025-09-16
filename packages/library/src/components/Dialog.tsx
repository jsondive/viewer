import { Dialog as BaseDialog } from "@base-ui-components/react"
import { ReactNode, useContext } from "react"
import * as stylex from "@stylexjs/stylex"
import { addClassName } from "../lib/addClassName"
import * as libraryIcons from "../lib/icons"
import { PortalContext } from "./PortalProvider"

const EDGE_PADDING = "var(--json-dive-spacing-4)"

const styles = stylex.create({
	backdrop: {
		position: "fixed",
		inset: 0,
		backgroundColor: "black",
		opacity: 0.2,
		zIndex: 50,
	},

	popupOuter: {
		position: "fixed",
		top: "30%",
		left: "50%",
		transform: "translate(-50%, -30%)",
		outlineStyle: "solid",
		outlineWidth: "1px",
		outlineColor: "var(--json-dive-color-light-border)",
		backgroundColor: "var(--json-dive-color-white)",
		color: "var(--json-dive-color-black)",
		maxWidth: `calc(100vw - ${EDGE_PADDING} * 2)`,
		maxHeight: `calc(100vh - ${EDGE_PADDING} * 2)`,
		minWidth: `min(500px, calc(100vw - ${EDGE_PADDING} * 2))`,
		display: "flex",
		flexDirection: "column",
		boxShadow: "var(--json-dive-shadow-md)",
		borderRadius: "var(--json-dive-radius-sm)",
		zIndex: 100,
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
		borderBottomColor: "var(--json-dive-color-light-border)",
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
		backgroundColor: {
			":hover": "var(--json-dive-color-light-border)",
		},
		borderRadius: 1000,
	},
})

export function Dialog(props: {
	open: boolean
	children: ReactNode
	onClose: () => void
	title?: string
}) {
	const { open, children, onClose, title } = props

	const portalRef = useContext(PortalContext)

	return (
		<BaseDialog.Root
			open={open}
			onOpenChange={newOpen => {
				if (!newOpen) {
					onClose()
				}
			}}
		>
			<BaseDialog.Portal container={portalRef}>
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
							<libraryIcons.X size={15} />
						</div>
					</div>
					<div {...stylex.props(styles.content)}>{children}</div>
				</BaseDialog.Popup>
			</BaseDialog.Portal>
		</BaseDialog.Root>
	)
}
