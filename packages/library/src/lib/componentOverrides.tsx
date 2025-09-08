import { createContext, ReactNode, useContext } from "react"
import { IconComponent } from "./IconComponent"

export type ComponentOverrides = {
	/**
	 * Badge is a generic component that (in the default implementation)
	 * renders some small text with a light grey rounded background.
	 *
	 * These are mostly placed next to nodes to display information
	 * (like a nested file type) or provide additional actions (like
	 * magnifying the value.)
	 */
	badge?: React.FC<{ children: ReactNode; onClick?: () => void }>

	/**
	 * Icon used when a value is collapsed for a button to expand the value.
	 */
	magnifyIcon?: IconComponent

	/**
	 * Icon used when an image URL is shown; user may hover over this icon
	 * to show a preview of the image.
	 *
	 * (Only if the richPreviews plugin is active.)
	 */
	imageIcon?: IconComponent
}

type PropsForComponentOverride<K extends keyof ComponentOverrides> =
	Required<ComponentOverrides>[K] extends React.FC<infer Props> ? Props : never

const emptyOverrides: ComponentOverrides = {}
const ComponentOverrideContext =
	createContext<ComponentOverrides>(emptyOverrides)

export function ComponentOverrideProvider(props: {
	overrides: ComponentOverrides | undefined
	children: ReactNode
}) {
	const { overrides, children } = props

	return (
		<ComponentOverrideContext.Provider value={overrides ?? emptyOverrides}>
			{children}
		</ComponentOverrideContext.Provider>
	)
}

export function OverridableComponent<K extends keyof ComponentOverrides>(
	props: {
		overrideKey: K
		overrideDefault: React.FC<PropsForComponentOverride<K>>
	} & PropsForComponentOverride<K>
) {
	const { overrideKey, overrideDefault, ...restProps } = props
	const overrides = useContext(ComponentOverrideContext)
	const Component = overrides[overrideKey] ?? overrideDefault
	return <Component {...(restProps as any)} />
}
