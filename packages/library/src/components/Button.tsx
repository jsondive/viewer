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
		transition: "background-color .2s",
		fontFamily: "inherit",
	},

	primary: {
		color: "var(--json-dive-color-white)",
		backgroundColor: {
			default: "var(--json-dive-color-button-primary)",
			":hover": "var(--json-dive-color-button-primary-hovered)",
			":active": "var(--json-dive-color-button-primary)",
		},
	},

	hero: {
		borderWidth: 2,
		borderStyle: "solid",
		borderColor: "var(--json-dive-color-button-hero-border)",
	},

	secondary: {
		color: "var(--json-dive-color-black)",
		backgroundColor: {
			default: "var(--json-dive-color-button-secondary)",
			":hover": "var(--json-dive-color-button-secondary-hovered)",
			":active": "var(--json-dive-color-button-secondary)",
		},
	},

	outline: {
		color: "var(--json-dive-color-black)",
		borderStyle: "solid",
		borderWidth: 1,
		borderColor: "var(--json-dive-color-button-outline-border)",
		backgroundColor: {
			default: "transparent",
			":hover": "var(--json-dive-color-button-outline-hovered)",
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
			default: "var(--json-dive-color-button-green)",
			":hover": "var(--json-dive-color-button-green-hovered)",
			":active": "var(--json-dive-color-button-green)",
		},
	},
})

export type ButtonProps = {
	children: ReactNode
	style?: stylex.StyleXStyles
	size?: "sm" | "base" | "lg" | "xl" | "hero"
	variant?: "primary" | "secondary" | "outline" | "green" | "hero"
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
						variant === "hero" && styles.primary, // Hero is a variant on primary.
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
