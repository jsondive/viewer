// Lucide React icons that have been inlined to avoid a dependency.
// https://svg2jsx.com/
const DEFAULT_ICON_SIZE = 24

export function Image(
	props: React.SVGProps<SVGSVGElement> & { size?: number }
) {
	const { size = DEFAULT_ICON_SIZE } = props

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			className="lucide lucide-image-icon lucide-image"
			viewBox="0 0 24 24"
		>
			<rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
			<circle cx="9" cy="9" r="2"></circle>
			<path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
		</svg>
	)
}

export function ArrowRight(
	props: React.SVGProps<SVGSVGElement> & { size?: number }
) {
	const { size = DEFAULT_ICON_SIZE } = props

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			className="lucide lucide-arrow-right-icon lucide-arrow-right"
			viewBox="0 0 24 24"
		>
			<path d="M5 12h14M12 5l7 7-7 7"></path>
		</svg>
	)
}

export function ArrowRightFromLine(
	props: React.SVGProps<SVGSVGElement> & { size?: number }
) {
	const { size = DEFAULT_ICON_SIZE } = props

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			className="lucide lucide-arrow-right-from-line-icon lucide-arrow-right-from-line"
			viewBox="0 0 24 24"
		>
			<path d="M3 5v14M21 12H7M15 18l6-6-6-6"></path>
		</svg>
	)
}

export function ArrowLeft(
	props: React.SVGProps<SVGSVGElement> & { size?: number }
) {
	const { size = DEFAULT_ICON_SIZE } = props

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			className="lucide lucide-arrow-left-icon lucide-arrow-left"
			viewBox="0 0 24 24"
		>
			<path d="m12 19-7-7 7-7M19 12H5"></path>
		</svg>
	)
}

export function ArrowLeftFromLine(
	props: React.SVGProps<SVGSVGElement> & { size?: number }
) {
	const { size = DEFAULT_ICON_SIZE } = props

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			className="lucide lucide-arrow-left-from-line-icon lucide-arrow-left-from-line"
			viewBox="0 0 24 24"
		>
			<path d="m9 6-6 6 6 6M3 12h14M21 19V5"></path>
		</svg>
	)
}

export function Clipboard(
	props: React.SVGProps<SVGSVGElement> & { size?: number }
) {
	const { size = DEFAULT_ICON_SIZE } = props

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			className="lucide lucide-clipboard-icon lucide-clipboard"
			viewBox="0 0 24 24"
		>
			<rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
			<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
		</svg>
	)
}

export function Search(
	props: React.SVGProps<SVGSVGElement> & { size?: number }
) {
	const { size = DEFAULT_ICON_SIZE } = props

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			className="lucide lucide-search-icon lucide-search"
			viewBox="0 0 24 24"
		>
			<path d="m21 21-4.34-4.34"></path>
			<circle cx="11" cy="11" r="8"></circle>
		</svg>
	)
}

export function X(props: React.SVGProps<SVGSVGElement> & { size?: number }) {
	const { size = DEFAULT_ICON_SIZE } = props

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			className="lucide lucide-x-icon lucide-x"
			viewBox="0 0 24 24"
		>
			<path d="M18 6 6 18M6 6l12 12"></path>
		</svg>
	)
}

export function LoaderCircle(
	props: React.SVGProps<SVGSVGElement> & { size?: number }
) {
	const { size = DEFAULT_ICON_SIZE } = props

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			className="lucide lucide-loader-circle-icon lucide-loader-circle"
			viewBox="0 0 24 24"
		>
			<path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
		</svg>
	)
}

export function CircleAlert(
	props: React.SVGProps<SVGSVGElement> & { size?: number }
) {
	const { size = DEFAULT_ICON_SIZE } = props

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			className="lucide lucide-circle-alert-icon lucide-circle-alert"
			viewBox="0 0 24 24"
		>
			<circle cx="12" cy="12" r="10"></circle>
			<path d="M12 8v4M12 16h.01"></path>
		</svg>
	)
}

export function ChevronUp(
	props: React.SVGProps<SVGSVGElement> & { size?: number }
) {
	const { size = DEFAULT_ICON_SIZE } = props

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			className="lucide lucide-chevron-up-icon lucide-chevron-up"
			viewBox="0 0 24 24"
		>
			<path d="m18 15-6-6-6 6"></path>
		</svg>
	)
}

export function ChevronDown(
	props: React.SVGProps<SVGSVGElement> & { size?: number }
) {
	const { size = DEFAULT_ICON_SIZE } = props

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			className="lucide lucide-chevron-down-icon lucide-chevron-down"
			viewBox="0 0 24 24"
		>
			<path d="m6 9 6 6 6-6"></path>
		</svg>
	)
}

export function CircleX(
	props: React.SVGProps<SVGSVGElement> & { size?: number }
) {
	const { size = DEFAULT_ICON_SIZE } = props

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			className="lucide lucide-circle-x-icon lucide-circle-x"
			viewBox="0 0 24 24"
		>
			<circle cx="12" cy="12" r="10"></circle>
			<path d="m15 9-6 6M9 9l6 6"></path>
		</svg>
	)
}

export function ChevronRight(
	props: React.SVGProps<SVGSVGElement> & { size?: number }
) {
	const { size = DEFAULT_ICON_SIZE } = props

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			className="lucide lucide-chevron-right-icon lucide-chevron-right"
			viewBox="0 0 24 24"
		>
			<path d="m9 18 6-6-6-6"></path>
		</svg>
	)
}

export function Copy(props: React.SVGProps<SVGSVGElement> & { size?: number }) {
	const { size = DEFAULT_ICON_SIZE } = props

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			className="lucide lucide-copy-icon lucide-copy"
			viewBox="0 0 24 24"
		>
			<rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
			<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
		</svg>
	)
}
