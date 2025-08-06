import { Ref, RefCallback, useCallback } from "react"

export function useMergeRefs<T>(
	...refs: Array<Ref<T> | undefined>
): RefCallback<T> {
	return useCallback(
		(value: T) => {
			for (const ref of refs) {
				if (typeof ref === "function") {
					ref(value)
				} else if (ref !== null && ref !== undefined) {
					ref.current = value
				}
			}
		},
		[refs]
	)
}
