import { ReactNode } from "react"
import { isDefined } from "../utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip"
import * as stylex from "@stylexjs/stylex"
import { addClassName } from "../lib/addClassName"
import clsx from "clsx"

const styles = stylex.create({
	body: {
		backgroundColor: "var(--json-dive-color-badge-background)",
		paddingInline: "var(--json-dive-spacing-1)",
		paddingBlock: "var(--json-dive-spacing-0_5)",
		borderRadius: "var(--json-dive-radius-sm)",
		color: "var(--json-dive-color-badge-color)",
		cursor: "default",
	},

	clickableBody: {
		cursor: "pointer",
	},
})

type BadgeProps = {
	children: ReactNode
	tooltip?: ReactNode
	onClick?: () => void
	className?: string
}

export function Badge(props: BadgeProps) {
	const { children, tooltip, onClick, className } = props

	let body = (
		<div
			{...addClassName(
				stylex.props(styles.body, onClick && styles.clickableBody),
				clsx("json-dive-font-size-sm json-dive-badge-container", className)
			)}
			onClick={onClick}
		>
			{children}
		</div>
	)

	if (isDefined(tooltip)) {
		body = (
			<Tooltip placement="right">
				<TooltipTrigger asChild>{body}</TooltipTrigger>
				<TooltipContent>{tooltip}</TooltipContent>
			</Tooltip>
		)
	}

	return body
}
