import * as React from "react"

export const PortalContext = React.createContext<
	React.RefObject<HTMLDivElement | null> | undefined
>(undefined)

/**
 * Can be used to override the Portal into which tooltips are placed.
 */
export function PortalProvider(props: {
	ref: React.RefObject<HTMLDivElement | null>
	children: React.ReactNode
}) {
	const { ref, children } = props
	return <PortalContext.Provider value={ref}>{children}</PortalContext.Provider>
}
