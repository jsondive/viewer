import { Menu as BaseMenu } from "@base-ui-components/react"
import { JSX, ReactNode } from "react"
import * as stylex from "@stylexjs/stylex"
import { addClassName } from "../lib/addClassName"
import { LucideIcon } from "../lib/LucideIcon"

const styles = stylex.create({
	menuPositioner: {
		outline: "0",
	},

	menuPopup: {
		paddingBlock: "var(--json-dive-spacing-1)",
		backgroundColor: "canvas",
		color: "var(--json-dive-color-black)",
		transformOrigin: "var(--transform-origin)",
		transition: "transform 150ms, opacity 150ms",
		outlineStyle: "solid",
		outlineWidth: "1px",
		outlineColor: "var(--json-dive-color-light-border)",
		boxShadow: `
			0 10px 15px -3px var(--json-dive-color-light-border),
			0 4px 6px -4px var(--json-dive-color-light-border)
		`,

		// eslint-disable-next-line @stylexjs/valid-styles
		":is([data-starting-style])": {
			opacity: 0,
			transform: "scale(0.9)",
		},

		// eslint-disable-next-line @stylexjs/valid-styles
		":is([data-ending-style])": {
			opacity: 0,
			transform: "scale(0.9)",
		},
	},

	arrow: {
		display: "flex",
		top: -8,
	},

	arrowFill: {
		fill: "canvas",
	},

	arrowOuterStroke: {
		fill: "var(--json-dive-color-light-border)",
	},

	arrowInnerStroke: {},

	menuItem: {
		outline: "0",
		cursor: "pointer",
		userSelect: "none",

		// eslint-disable-next-line @stylexjs/valid-styles
		":is([data-highlighted])": {
			zIndex: 0,
			position: "relative",
		},

		// eslint-disable-next-line @stylexjs/valid-styles
		":is([data-highlighted])::before": {
			content: "''",
			zIndex: -1,
			position: "absolute",
			insetBlock: 0,
			insetInline: "0.25rem",
			borderRadius: "0.25rem",
			backgroundColor: "var(--json-dive-color-light-border)",
		},
	},

	menuItemBase: {
		display: "flex",
		paddingInline: "var(--json-dive-spacing-2)",
		paddingBlock: "var(--json-dive-spacing-1)",
		gap: 4,
		alignItems: "center",
	},

	menuGroupLabel: {
		cursor: "default",
		userSelect: "none",
		color: "var(--json-dive-color-light-label)",
	},

	menuGroup: {
		display: "flex",
		flexDirection: "column",
	},
})

const ICON_SIZE = 15

export type MenuItem = {
	icon: LucideIcon
	label: ReactNode
	action: () => void
}

export type MenuItemGroup = {
	icon?: LucideIcon
	label?: ReactNode
	items: MenuItem[]
}

export function Menu(props: { trigger: JSX.Element; groups: MenuItemGroup[] }) {
	const { trigger, groups } = props

	return (
		<BaseMenu.Root openOnHover>
			<BaseMenu.Trigger nativeButton={false} render={trigger} />
			<BaseMenu.Portal>
				<BaseMenu.Positioner
					{...stylex.props(styles.menuPositioner)}
					sideOffset={8}
				>
					<BaseMenu.Popup
						{...addClassName(
							stylex.props(styles.menuPopup),
							"json-dive-css-reset"
						)}
					>
						<BaseMenu.Arrow {...stylex.props(styles.arrow)}>
							<ArrowSvg />
						</BaseMenu.Arrow>
						{groups.map((group, i) => (
							<RenderGroup key={i} group={group} />
						))}
					</BaseMenu.Popup>
				</BaseMenu.Positioner>
			</BaseMenu.Portal>
		</BaseMenu.Root>
	)
}

function RenderGroup(props: { group: MenuItemGroup }) {
	const {
		group: { items, label, icon: Icon },
	} = props

	return (
		<BaseMenu.Group {...stylex.props(styles.menuGroup)}>
			{label && (
				<BaseMenu.GroupLabel
					{...stylex.props(styles.menuGroupLabel, styles.menuItemBase)}
				>
					{Icon && <Icon size={ICON_SIZE} />}
					{label}
				</BaseMenu.GroupLabel>
			)}

			{items.map((item, i) => (
				<RenderItem key={i} item={item} />
			))}
		</BaseMenu.Group>
	)
}

function RenderItem(props: { item: MenuItem }) {
	const {
		item: { label, action, icon: Icon },
	} = props

	return (
		<BaseMenu.Item
			{...stylex.props(styles.menuItem, styles.menuItemBase)}
			onClick={() => {
				action()
			}}
		>
			<Icon size={ICON_SIZE} />
			{label}
		</BaseMenu.Item>
	)
}

function ArrowSvg(props: React.ComponentProps<"svg">) {
	return (
		<svg width="20" height="10" viewBox="0 0 20 10" fill="none" {...props}>
			<path
				d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
				{...stylex.props(styles.arrowFill)}
			/>
			<path
				d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
				{...stylex.props(styles.arrowOuterStroke)}
			/>
			<path
				d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
				{...stylex.props(styles.arrowInnerStroke)}
			/>
		</svg>
	)
}
