import * as React from "react"
import {
	useFloating,
	autoUpdate,
	offset,
	flip,
	shift,
	useHover,
	useFocus,
	useDismiss,
	useRole,
	useInteractions,
	FloatingPortal,
	useMergeRefs,
} from "@floating-ui/react"
import type { Placement } from "@floating-ui/react"
import { useMemo, useState } from "react"
import * as stylex from "@stylexjs/stylex"
import clsx from "clsx"

// https://floating-ui.com/docs/tooltip#reusable-tooltip-component

const styles = stylex.create({
	tooltipContent: {
		color: "var(--json-dive-color-white)",
		backgroundColor: "var(--json-dive-color-tooltip-background)",
		borderRadius: "var(--json-dive-radius-sm)",
		width: "max-content",
		maxWidth: "calc(50vw)",
		padding: `var(--json-dive-spacing-1) var(--json-dive-spacing-2)`,
		zIndex: 100,
	},
})

interface TooltipOptions {
	initialOpen?: boolean
	placement?: Placement
	open?: boolean
	onOpenChange?: (open: boolean) => void
	originGap?: number
}

export function useTooltip({
	initialOpen = false,
	placement = "top",
	open: controlledOpen,
	onOpenChange: setControlledOpen,
	originGap,
}: TooltipOptions = {}) {
	const [uncontrolledOpen, setUncontrolledOpen] = useState(initialOpen)

	const open = controlledOpen ?? uncontrolledOpen
	const setOpen = setControlledOpen ?? setUncontrolledOpen

	const data = useFloating({
		placement,
		open,
		onOpenChange: setOpen,
		whileElementsMounted: autoUpdate,
		middleware: [
			offset(originGap ?? 5),
			flip({
				crossAxis: placement.includes("-"),
				fallbackAxisSideDirection: "start",
				padding: 5,
			}),
			shift({ padding: 5 }),
		],
	})

	const context = data.context

	const hover = useHover(context, {
		move: false,
		enabled: controlledOpen == null,
	})
	const focus = useFocus(context, {
		enabled: controlledOpen == null,
	})
	const dismiss = useDismiss(context)
	const role = useRole(context, { role: "tooltip" })

	const interactions = useInteractions([hover, focus, dismiss, role])

	return useMemo(
		() => ({
			open,
			setOpen,
			...interactions,
			...data,
		}),
		[open, setOpen, interactions, data]
	)
}

type ContextType = ReturnType<typeof useTooltip> | null

const TooltipContext = React.createContext<ContextType>(null)

export const useTooltipContext = () => {
	const context = React.useContext(TooltipContext)

	if (context == null) {
		throw new Error("Tooltip components must be wrapped in <Tooltip />")
	}

	return context
}

export function Tooltip({
	children,
	...options
}: { children: React.ReactNode } & TooltipOptions) {
	// This can accept any props as options, e.g. `placement`,
	// or other positioning options.
	const tooltip = useTooltip(options)
	return (
		<TooltipContext.Provider value={tooltip}>
			{children}
		</TooltipContext.Provider>
	)
}

export const TooltipTrigger = React.forwardRef<
	HTMLElement,
	React.HTMLProps<HTMLElement> & { asChild?: boolean }
>(function TooltipTrigger({ children, asChild = false, ...props }, propRef) {
	const context = useTooltipContext()
	const childrenRef = (children as any).ref
	const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef])

	// `asChild` allows the user to pass any element as the anchor
	if (asChild && React.isValidElement(children)) {
		return React.cloneElement(
			children,
			context.getReferenceProps({
				ref,
				...props,
				...(children.props as Record<string, unknown>),
				["data-state" as any]: context.open ? "open" : "closed",
			})
		)
	}

	return (
		<button
			ref={ref}
			// The user can style the trigger based on the state
			data-state={context.open ? "open" : "closed"}
			{...context.getReferenceProps(props)}
		>
			{children}
		</button>
	)
})

export const TooltipContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLProps<HTMLDivElement>
>(function TooltipContent({ style, children, ...props }, propRef) {
	const context = useTooltipContext()
	const ref = useMergeRefs([context.refs.setFloating, propRef])

	if (!context.open) return null

	const {
		className: stylexClassName,
		style: stylexStyle,
		...stylexRest
	} = stylex.props(styles.tooltipContent)

	return (
		<FloatingPortal>
			<div
				ref={ref}
				className={clsx("json-dive-css-reset", stylexClassName)}
				style={{
					...context.floatingStyles,
					...stylexStyle,
					...style,
				}}
				{...context.getFloatingProps(props)}
				{...stylexRest}
			>
				{children}
			</div>
		</FloatingPortal>
	)
})
