import { ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { addClassName } from "../lib/addClassName"
import React from "react"

// Some inspiration from: https://ui.shadcn.com/docs/components/button
const styles = stylex.create({
	wrap: {
		outline: "none",
		userSelect: "none",
		paddingInline: "var(--json-dive-spacing-4)",
		paddingBlock: "var(--json-dive-spacing-2)",
		borderRadius: "var(--json-dive-radius-md)",
		borderStyle: "none",
		cursor: "pointer",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		transition: "all .2s",
		fontFamily: "inherit",
	},
	primary: {
		color: "var(--json-dive-color-white)",
		backgroundColor: {
			default: "var(--json-dive-color-blue-600)",
			":hover": "var(--json-dive-color-blue-500)",
			":active": "var(--json-dive-color-blue-600)",
		},
	},
	secondary: {
		color: "var(--json-dive-color-black)",
		backgroundColor: {
			default: "var(--json-dive-color-gray-200)",
			":hover": "var(--json-dive-color-gray-300)",
			":active": "var(--json-dive-color-gray-200)",
		},
	},
	outline: {
		color: "var(--json-dive-color-black)",
		borderStyle: "solid",
		borderWidth: 1,
		borderColor: "var(--json-dive-color-slate-200)",
		backgroundColor: {
			default: "transparent",
			":hover": "var(--json-dive-color-gray-100)",
			":active": "transparent",
		},
		boxShadow: `0 1px 2px 0 rgb(0 0 0 / 0.05)`,
	},
	small: {
		paddingInline: "var(--json-dive-spacing-2)",
		paddingBlock: "var(--json-dive-spacing-1_5)",
	},
	green: {
		color: "var(--json-dive-color-white)",
		backgroundColor: {
			default: "var(--json-dive-color-emerald-500)",
			":hover": "var(--json-dive-color-emerald-600)",
			":active": "var(--json-dive-color-emerald-500)",
		},
	},
})

export type ButtonProps = {
	children: ReactNode
	style?: stylex.StyleXStyles
	size?: "sm" | "base" | "lg" | "xl"
	variant?: "primary" | "secondary" | "outline" | "green"
} & Omit<
	React.DetailedHTMLProps<
		React.ButtonHTMLAttributes<HTMLButtonElement>,
		HTMLButtonElement
	>,
	"style"
>

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	function Button(props, ref) {
		const { children, style, size, variant = "primary", ...restProps } = props

		return (
			<button
				ref={ref}
				tabIndex={0}
				{...restProps}
				{...addClassName(
					stylex.props(
						styles.wrap,
						styles[variant],
						size === "sm" && styles.small,
						style
					),
					`json-dive-font-size-${size ?? "base"}`
				)}
			>
				{children}
			</button>
		)
	}
)
