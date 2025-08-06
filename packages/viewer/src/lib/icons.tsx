// https://reactsvgicons.com/search
// https://yqnn.github.io/svg-path-editor/

export function IconPlusSquare(props: React.SVGProps<SVGSVGElement>) {
	const { children, ...restProps } = props
	return (
		<svg
			viewBox="0 0 1024 1024"
			fill="currentColor"
			height="1em"
			width="1em"
			{...restProps}
		>
			{children}
			<path d="M328 544h152v152c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V544h152c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H544V328c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v152H328c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8z" />
			<path d="M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-40 728H184V184h656v656z" />
		</svg>
	)
}

export function IconMinusSquare(props: React.SVGProps<SVGSVGElement>) {
	const { children, ...restProps } = props
	return (
		<svg
			viewBox="0 0 1024 1024"
			fill="currentColor"
			height="1em"
			width="1em"
			{...restProps}
		>
			{children}
			<path d="M328 544h368c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H328c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8z" />
			<path d="M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-40 728H184V184h656v656z" />
		</svg>
	)
}

export function IconBraces(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			viewBox="0 0 24 24"
			height="1em"
			width="1em"
			{...props}
		>
			<path stroke="none" d="M0 0h24v24H0z" />
			<path d="M7 4a2 2 0 00-2 2v3a2 3 0 01-2 3 2 3 0 012 3v3a2 2 0 002 2M17 4a2 2 0 012 2v3a2 3 0 002 3 2 3 0 00-2 3v3a2 2 0 01-2 2" />
		</svg>
	)
}

export function IconBracketsLine(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="currentColor"
			height="1em"
			width="1em"
			{...props}
		>
			<path fill="none" d="M0 0h24v24H0z" />
			<path d="M9 3v2H6v14h3v2H4V3h5zm6 0h5v18h-5v-2h3V5h-3V3z" />
		</svg>
	)
}

export function IconRoundedSquare(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 1024 1024"
			fill="currentColor"
			height="1em"
			width="1em"
			{...props}
		>
			<rect x="144" y="144" width="736" height="736" rx="15%" />
		</svg>
	)
}

export function IconMagnifyingGlass(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 512 512"
			fill="currentColor"
			height="1em"
			width="1em"
			{...props}
		>
			<path d="M416 208c0 45.9-14.9 88.3-40 122.7l126.6 126.7c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0s208 93.1 208 208zM208 352c79.5 0 144-64.5 144-144S287.5 64 208 64 64 128.5 64 208s64.5 144 144 144z" />
		</svg>
	)
}

/**
 * @deprecated TODO: replace with CloseCircleOutlined from ant design
 */
export function IconCloseCircle(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 1024 1024"
			fill="currentColor"
			height="1em"
			width="1em"
			{...props}
		>
			<path d="M685.4 354.8c0-4.4-3.6-8-8-8l-66 .3L512 465.6l-99.3-118.4-66.1-.3c-4.4 0-8 3.5-8 8 0 1.9.7 3.7 1.9 5.2l130.1 155L340.5 670a8.32 8.32 0 00-1.9 5.2c0 4.4 3.6 8 8 8l66.1-.3L512 564.4l99.3 118.4 66 .3c4.4 0 8-3.5 8-8 0-1.9-.7-3.7-1.9-5.2L553.5 515l130.1-155c1.2-1.4 1.8-3.3 1.8-5.2z" />
			<path d="M512 65C264.6 65 64 265.6 64 513s200.6 448 448 448 448-200.6 448-448S759.4 65 512 65zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" />
		</svg>
	)
}

export function IconUpload(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			viewBox="0 0 24 24"
			height="1em"
			width="1em"
			{...props}
		>
			<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
		</svg>
	)
}

export function IconDownload(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			viewBox="0 0 24 24"
			height="1em"
			width="1em"
			{...props}
		>
			<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
		</svg>
	)
}

export function IconSidebarCollapse(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 16 16"
			fill="currentColor"
			height="1em"
			width="1em"
			{...props}
		>
			<path
				fillRule="evenodd"
				d="M6.823 7.823L4.427 5.427A.25.25 0 004 5.604v4.792c0 .223.27.335.427.177l2.396-2.396a.25.25 0 000-.354z"
			/>
			<path
				fillRule="evenodd"
				d="M1.75 0A1.75 1.75 0 000 1.75v12.5C0 15.216.784 16 1.75 16h12.5A1.75 1.75 0 0016 14.25V1.75A1.75 1.75 0 0014.25 0H1.75zM1.5 1.75a.25.25 0 01.25-.25H9.5v13H1.75a.25.25 0 01-.25-.25V1.75zM11 14.5v-13h3.25a.25.25 0 01.25.25v12.5a.25.25 0 01-.25.25H11z"
			/>
		</svg>
	)
}

export function IconSidebarExpand(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 16 16"
			fill="currentColor"
			height="1em"
			width="1em"
			{...props}
		>
			<path
				fillRule="evenodd"
				d="M4.177 7.823l2.396-2.396A.25.25 0 017 5.604v4.792a.25.25 0 01-.427.177L4.177 8.177a.25.25 0 010-.354z"
			/>
			<path
				fillRule="evenodd"
				d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0114.25 16H1.75A1.75 1.75 0 010 14.25V1.75zm1.75-.25a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25H9.5v-13H1.75zm12.5 13H11v-13h3.25a.25.25 0 01.25.25v12.5a.25.25 0 01-.25.25z"
			/>
		</svg>
	)
}

export function IconCross(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" {...props}>
			<path
				fillRule="evenodd"
				d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
