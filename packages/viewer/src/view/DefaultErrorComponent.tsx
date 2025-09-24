import { addClassName, libraryIcons } from "@jsondive/library"
import { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"

const styles = stylex.create({
	errorWrap: {
		display: "flex",
		flexGrow: 1,
		alignItems: "center",
		paddingTop: "var(--json-dive-spacing-20)",
		flexDirection: "column",
		gap: "var(--json-dive-spacing-4)",
	},

	errorIconWrap: {
		display: "flex",
		borderRadius: 1000,
		padding: "var(--json-dive-spacing-2)",
		backgroundColor: "var(--json-dive-color-error-icon)",
	},

	errorMessage: {
		color: "var(--json-dive-color-error-message)",
	},
})

export function DefaultErrorComponent(props: {
	error: Error
	children?: ReactNode
}) {
	const { error, children } = props

	return (
		<div {...stylex.props(styles.errorWrap)}>
			<div {...stylex.props(styles.errorIconWrap)}>
				<libraryIcons.CircleAlert
					stroke="var(--json-dive-color-error-message)"
					size={30}
				/>
			</div>
			<div className="json-dive-font-size-xl">
				There was an error parsing your input.
			</div>
			<div
				{...addClassName(
					stylex.props(styles.errorMessage),
					"json-dive-font-size-lg"
				)}
			>
				{error.message}
			</div>
			{children}
		</div>
	)
}
