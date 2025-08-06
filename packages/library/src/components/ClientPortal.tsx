import { useEffect, useState, ReactNode } from "react"
import { createPortal } from "react-dom"

/**
 * https://chatgpt.com/share/68681250-d770-8011-b85d-11207960dd2d
 */
export function ClientPortal(props: { children: ReactNode }) {
	const { children } = props

	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) {
		return null
	}

	return createPortal(children, document.body)
}
