/**
 * Temporary focus state is used to avoid flicker when switching focus in
 * certain cases.
 */
export function setTemporaryFocusState(element: HTMLElement, state: boolean) {
	if (state) {
		element.classList.add("json-dive-temp-force-focus-state")
	} else {
		element.classList.remove("json-dive-temp-force-focus-state")
	}
}
