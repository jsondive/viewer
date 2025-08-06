import { Button, ButtonProps } from "./Button"
import { LucideIcon } from "lucide-react"
import * as stylex from "@stylexjs/stylex"

const styles = stylex.create({
	icon: {
		marginRight: 4,
	},
})

export type ButtonWithIconProps = ButtonProps & {
	icon: LucideIcon
}

export function ButtonWithIcon(props: ButtonWithIconProps) {
	const { icon: Icon, children, ...restProps } = props

	return (
		<Button {...restProps}>
			<Icon size={14} {...stylex.props(styles.icon)} />
			{children}
		</Button>
	)
}
