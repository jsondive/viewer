import { useEffect, useState } from "react"

export function useIsOverflowing(ref: React.RefObject<HTMLElement | null>) {
	const [isOverflowing, setIsOverflowing] = useState(false)

	useEffect(() => {
		const el = ref.current

		if (!el) {
			return
		}

		const definedEl = el
		function updateIsOverflowing() {
			// https://stackoverflow.com/a/10017343
			setIsOverflowing(definedEl.offsetWidth < definedEl.scrollWidth)
		}

		const observer = new ResizeObserver(() => {
			updateIsOverflowing()
		})
		observer.observe(el)
		updateIsOverflowing()

		return () => observer.disconnect()
	}, [ref])

	return isOverflowing
}
