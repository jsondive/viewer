import clsx from "clsx"

/** Add a className to a StyleX result. */
export function addClassName<T extends { className?: string }>(
	stylexResult: T,
	className: string
) {
	const { className: stylexClassName, ...stylexRest } = stylexResult
	return {
		...stylexRest,
		className: clsx(stylexClassName, className),
	}
}
