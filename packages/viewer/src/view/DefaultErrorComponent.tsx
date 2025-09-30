import { InfoTypeComponent, libraryIcons } from "@jsondive/library"
import { ReactNode } from "react"

export function DefaultErrorComponent(props: {
	error: Error
	children?: ReactNode
}) {
	const { error, children } = props

	return (
		<InfoTypeComponent
			isError
			message="There was an error parsing your input."
			subMessage={error.message}
			icon={libraryIcons.CircleAlert}
		>
			{children}
		</InfoTypeComponent>
	)
}
