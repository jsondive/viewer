import { ReactNode } from "react"
import { isDefined } from "../utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "./Tooltip"
import * as stylex from "@stylexjs/stylex"
import { addClassName } from "../lib/addClassName"
import { OverridableComponent } from "../lib/componentOverrides"

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
}

export function Badge(props: BadgeProps) {
	const { children, tooltip, onClick } = props

	let body = (
		<OverridableBadgeInner onClick={onClick}>{children}</OverridableBadgeInner>
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

function OverridableBadgeInner(props: Omit<BadgeProps, "tooltip">) {
	return (
		<OverridableComponent
			overrideKey="badge"
			overrideDefault={BadgeInner}
			{...props}
		/>
	)
}

function BadgeInner(
	props: Omit<BadgeProps, "tooltip"> & { ref?: React.RefObject<HTMLElement> }
) {
	const { children, onClick, ref } = props

	return (
		<div
			{...addClassName(
				stylex.props(styles.body, onClick && styles.clickableBody),
				"json-dive-font-size-sm"
			)}
			onClick={onClick}
			ref={ref as React.RefObject<HTMLDivElement>}
		>
			{children}
		</div>
	)
}
