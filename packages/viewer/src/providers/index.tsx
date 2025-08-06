import { ReactNode } from "react"
import { ContextMenuProvider } from "./ContextMenuProvider"

export function JSONDiveProviders(props: { children: ReactNode }) {
	const { children } = props

	return <ContextMenuProvider>{children}</ContextMenuProvider>
}
