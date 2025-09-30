import * as stylex from "@stylexjs/stylex"
import { ReactNode } from "react"
import { addClassName } from "../lib/addClassName"

const styles = stylex.create({
	wrap: {
		display: "flex",
		flexGrow: 1,
		alignItems: "center",
		flexDirection: "column",
		gap: "var(--json-dive-spacing-4)",
		color: "var(--json-dive-color-black)",
	},

	iconWrap: {
		display: "flex",
		borderRadius: 1000,
		padding: "var(--json-dive-spacing-2)",
		backgroundColor: "var(--json-dive-color-light-border)",
	},

	errorIconWrap: {
		backgroundColor: "var(--json-dive-color-error-icon)",
	},

	errorSubMessage: {
		color: "var(--json-dive-color-error-message)",
		height: 28,
	},
})

/**
 * Displays a large icon with a message below it.
 *
 * This can be used to convey some information, or an error.
 *
 * Any children are embedded directly below the message.
 */
export function InfoTypeComponent(props: {
	isError?: boolean
	message: string
	subMessage?: string
	icon: React.FC<{ size: number; stroke?: string }>
	children?: ReactNode
}) {
	const { isError, message, subMessage, icon: Icon, children } = props

	return (
		<div {...stylex.props(styles.wrap)}>
			<div {...stylex.props(styles.iconWrap, isError && styles.errorIconWrap)}>
				<Icon
					stroke={
						isError
							? "var(--json-dive-color-error-message)"
							: "var(--json-dive-color-light-label)"
					}
					size={30}
				/>
			</div>
			<div className="json-dive-font-size-xl">{message}</div>
			<div
				{...addClassName(
					stylex.props(isError && styles.errorSubMessage),
					"json-dive-font-size-lg"
				)}
			>
				{subMessage}
			</div>
			{children}
		</div>
	)
}
