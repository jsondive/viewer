import { useReducer } from "react"
import { DiveNode } from "../../model/DiveNode"
import { negativeWrappingModulo, unreachable } from "@jsondive/library"
import * as stylex from "@stylexjs/stylex"

const styles = stylex.create({
	autocompleteResults: (left: number) => ({
		position: "absolute",
		left,
		backgroundColor: "var(--json-dive-color-white)",
		zIndex: 100,
		marginTop: "var(--json-dive-spacing-2)",
		padding: "var(--json-dive-spacing-1_5)",
		borderStyle: "solid",
		borderWidth: 1,
		borderColor: "var(--json-dive-color-black)",
		display: "flex",
		flexDirection: "column",
	}),
})

export type AutocompleteResult = {
	name: string
	fullPath: string
}

function getAutocompleteResults(args: {
	query: string
	rootNode: DiveNode
}): AutocompleteResult[] {
	const { query, rootNode } = args

	if (!query.startsWith("$")) {
		return []
	}

	const pathParts = query.split(".").slice(1)
	if (pathParts.length === 0) {
		return []
	}

	const currentPath = pathParts.slice(0, -1)
	const currentNode = rootNode.getChildByPath(currentPath)

	if (!currentNode) {
		return []
	}

	const pathQuery = pathParts.at(-1)!.toLowerCase()

	return [...currentNode.getChildren()]
		.map(child => child.nameString)
		.filter(name => name.toLowerCase().includes(pathQuery))
		.map(name => ({
			name,
			fullPath: "$." + [...currentPath, name].join("."),
		}))
}

export type AutocompleteState = {
	lastQuery: string
	currentQuery: string
} & (
	| {
			type: "hidden"
	  }
	| {
			type: "shown"
			activeIndex: number
			results: AutocompleteResult[]
	  }
)

export type AutocompleteAction =
	| {
			type: "dismiss"
	  }
	| {
			type: "moveSelection"
			direction: 1 | -1
	  }
	| {
			type: "updateQuery"
			newQuery: string
	  }

export function useAutocompleteReducer(rootNode: DiveNode) {
	return useReducer(
		(
			state: AutocompleteState,
			action: AutocompleteAction
		): AutocompleteState => {
			if (action.type === "dismiss") {
				return {
					lastQuery: state.lastQuery,
					currentQuery: state.currentQuery,
					type: "hidden",
				}
			} else if (action.type === "moveSelection") {
				if (state.type === "hidden") {
					return state
				}

				return {
					...state,
					activeIndex: negativeWrappingModulo(
						state.activeIndex + action.direction,
						state.results.length
					),
				}
			} else if (action.type === "updateQuery") {
				const queryUpdates = {
					lastQuery: state.currentQuery,
					currentQuery: action.newQuery,
				}

				if (
					state.type === "hidden" &&
					!(
						// Trigger autocomplete after typing a period.
						(!state.currentQuery.endsWith(".") && action.newQuery.endsWith("."))
					)
				) {
					// Stay hidden.
					return {
						type: "hidden",
						...queryUpdates,
					}
				}

				const newResults = getAutocompleteResults({
					query: action.newQuery,
					rootNode,
				})

				if (newResults.length === 0) {
					// Hide.
					return {
						type: "hidden",
						...queryUpdates,
					}
				}

				return {
					type: "shown",
					...queryUpdates,
					results: newResults,
					// Ensure activeIndex is still within bounds.
					activeIndex:
						state.type === "shown"
							? Math.min(state.activeIndex, newResults.length)
							: 0,
				}
			} else {
				unreachable(action)
			}
		},
		{ type: "hidden", lastQuery: "", currentQuery: "" }
	)
}

export function AutocompleteResults(props: {
	state: Extract<AutocompleteState, { type: "shown" }>
	leftOffset: number
}) {
	const { state, leftOffset } = props

	return (
		<div {...stylex.props(styles.autocompleteResults(leftOffset))}>
			{state.results.map((result, i) => (
				<div key={i}>{result.name}</div>
			))}
		</div>
	)
}
