import * as stylex from "@stylexjs/stylex"
import { addClassName } from "../lib/addClassName"
import clsx from "clsx"
import { isDefined } from "../utils"

const styles = stylex.create({
	wrap: {
		// Input CSS reset: https://stackoverflow.com/a/33477611
		backgroundImage: "none",
		backgroundColor: "transparent",
		borderStyle: "none",
		boxShadow: {
			default:
				"rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, var(--json-dive-color-input-outline) 0px 0px 0px 2px, rgba(0, 0, 0, 0) 0px 0px 0px 0px",
			":focus":
				"rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, var(--json-dive-color-input-outline-active) 0px 0px 0px 2px, rgba(0, 0, 0, 0) 0px 0px 0px 0px",
		},
		paddingBlock: "var(--json-dive-spacing-1)",
		paddingInline: "var(--json-dive-spacing-2)",
		borderRadius: "var(--json-dive-radius-md)",
		outline: "none",
		transition: "box-shadow .2s",
		fontFamily: "unset",
	},

	fontSizeReset: {
		fontSize: "unset",
	},
})

export function Input(
	props: { style?: stylex.StyleXStyles; fontSize?: "base" | "lg" } & Omit<
		React.DetailedHTMLProps<
			React.InputHTMLAttributes<HTMLInputElement>,
			HTMLInputElement
		>,
		"style"
	>
) {
	const { style, fontSize, ...restProps } = props
	return (
		<input
			{...restProps}
			{...addClassName(
				stylex.props(
					styles.wrap,
					!isDefined(fontSize) && styles.fontSizeReset,
					style
				),
				clsx(isDefined(fontSize) && `json-dive-font-size-${fontSize}`)
			)}
		/>
	)
}

export function Textarea(
	props: {
		style?: stylex.StyleXStyles
	} & Omit<
		React.DetailedHTMLProps<
			React.TextareaHTMLAttributes<HTMLTextAreaElement>,
			HTMLTextAreaElement
		>,
		"style"
	>
) {
	const { style, ...restProps } = props

	return (
		<textarea
			{...restProps}
			{...stylex.props(styles.wrap, styles.fontSizeReset, style)}
		/>
	)
}
