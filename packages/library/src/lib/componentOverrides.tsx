import { createContext, ReactNode, useContext } from "react"
import { IconComponent } from "./IconComponent"

export type ComponentOverrides = {
	badge?: React.FC<{ children: ReactNode; onClick?: () => void }>

	magnifyIcon?: IconComponent

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
