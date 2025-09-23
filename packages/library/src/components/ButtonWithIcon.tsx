import { IconComponent } from "../lib/IconComponent"
import { Button, ButtonProps } from "./Button"
import * as stylex from "@stylexjs/stylex"

const SMALL_MEDIA = "@media (max-width: 768px)"

const styles = stylex.create({
	icon: {
		marginRight: 4,
	},

	iconWithHiding: {
		marginRight: {
			[SMALL_MEDIA]: 0,
		},
	},

	label: {
		textWrap: "nowrap",
	},

	labelWithHiding: {
		display: {
			default: "block",
			[SMALL_MEDIA]: "none",
		},
	},
})

export type ButtonWithIconProps = ButtonProps & {
	icon: IconComponent
	hideLabelOnMobile?: boolean
}

export function ButtonWithIcon(props: ButtonWithIconProps) {
	const { icon: Icon, children, hideLabelOnMobile, ...restProps } = props

	return (
		<Button {...restProps}>
			<Icon
				size={14}
				{...stylex.props(
					styles.icon,
					hideLabelOnMobile && styles.iconWithHiding
				)}
			/>
			<div
				{...stylex.props(
					styles.label,
					hideLabelOnMobile && styles.labelWithHiding
				)}
			>
				{children}
			</div>
		</Button>
	)
}
