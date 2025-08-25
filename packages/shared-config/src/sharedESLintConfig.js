import reactHooks from "eslint-plugin-react-hooks"
import stylex from "@stylexjs/eslint-plugin"

/**
 * Create an inclusive range.
 *
 * @param {number} from
 * @param {number} to
 * @returns {Array<number>}
 */
function range(from, to) {
	const result = []
	for (let i = from; i <= to; i++) {
		result.push(i)
	}
	return result
}

/**
 *
 * @param {Array<string>} arr1
 * @param {Array<string>} arr2
 * @returns {Array<string>}
 */
function cartesian(arr1, arr2) {
	const result = []
	for (const x of arr1) {
		for (const y of arr2) {
			result.push([x, y])
		}
	}
	return result
}

/**
 * @param {string} s
 * @returns {Array<string>}
 */
function extractCssIdentifiersFromString(s) {
	return [...s.matchAll(/(--)?json-dive-[a-zA-Z\-_0-9]+/g)].map(m => m[0])
}

/**
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function editDistance(a, b) {
	// Levenshtein algorithm.
	const m = a.length
	const n = b.length

	const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

	for (let i = 0; i <= m; i++) dp[i][0] = i
	for (let j = 0; j <= n; j++) dp[0][j] = j

	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			if (a[i - 1] === b[j - 1]) {
				dp[i][j] = dp[i - 1][j - 1]
			} else {
				dp[i][j] = Math.min(
					dp[i - 1][j] + 1,
					dp[i][j - 1] + 1,
					dp[i - 1][j - 1] + 1
				)
			}
		}
	}

	return dp[m][n]
}

function minBy(list, fn) {
	let minElem
	let minValue = Infinity
	for (const elem of list) {
		const value = fn(elem)
		if (value < minValue) {
			minValue = value
			minElem = elem
		}
	}
	return minElem
}

/**
 * @param {string} prefix
 * @param {Array<string>} sizes
 * @returns {Array<string>}
 */
function identifiersWithSizes(prefix, sizes) {
	return sizes.map(size => `${prefix}-${size}`)
}

/**
 * **Keep in sync with theme.css and font.css.**
 *
 * @type {Set<string>}
 */
const validJsonDiveCssIdentifiers = new Set([
	// Spacing.
	...range(0, 32).map(i => `--json-dive-spacing-${i}`),
	`--json-dive-spacing-0_5`,
	`--json-dive-spacing-1_5`,
	`--json-dive-spacing-2_5`,
	`--json-dive-spacing-3_5`,
	// Radius.
	"--json-dive-radius-xs",
	"--json-dive-radius-sm",
	"--json-dive-radius-md",
	"--json-dive-radius-lg",
	"--json-dive-radius-xl",
	"--json-dive-radius-2xl",
	"--json-dive-radius-3xl",
	"--json-dive-radius-4xl",
	// BEGIN: Colors.
	"--json-dive-color-black",
	"--json-dive-color-white",
	"--json-dive-color-light-border",
	"--json-dive-color-medium-border",
	"--json-dive-color-light-label",
	"--json-dive-color-light-text",
	"--json-dive-color-light-background",
	"--json-dive-color-link-foreground",
	"--json-dive-color-edit-tab-active-textarea-border",
	"--json-dive-color-interactive-preview-label-text",
	"--json-dive-color-interactive-preview-label-background",
	"--json-dive-color-badge-background",
	"--json-dive-color-badge-color",
	"--json-dive-color-button-primary",
	"--json-dive-color-button-primary-hovered",
	"--json-dive-color-button-secondary",
	"--json-dive-color-button-secondary-hovered",
	"--json-dive-color-button-outline-border",
	"--json-dive-color-button-outline-hovered",
	"--json-dive-color-button-green",
	"--json-dive-color-button-green-hovered",
	"--json-dive-color-toast-background",
	"--json-dive-color-toast-close-hover",
	"--json-dive-color-tooltip-background",
	"--json-dive-color-input-outline",
	"--json-dive-color-input-outline-active",
	"--json-dive-color-value-string",
	"--json-dive-color-value-number",
	"--json-dive-color-value-boolean",
	"--json-dive-color-value-null",
	"--json-dive-color-row-hover",
	"--json-dive-color-row-focus",
	"--json-dive-color-find-match-background",
	"--json-dive-color-find-match-background-active",
	"--json-dive-color-current-find-match-background",
	"--json-dive-color-current-find-match-background-active",
	"--json-dive-color-row-array-number-index",
	"--json-dive-color-context-menu-description",
	"--json-dive-color-error-icon",
	"--json-dive-color-error-message",
	"--json-dive-color-success-message",
	"--json-dive-color-rich-preview-warning",
	"--json-dive-color-xml-tag-name",
	"--json-dive-color-xml-attribute-name",
	"--json-dive-color-xml-attribute-value",
	"--json-dive-color-status-bar-background",
	"--json-dive-color-keyboard-shortcut-background",
	// END: Colors.
	// Shadow.
	"--json-dive-shadow-sm",
	"--json-dive-shadow-md",
	// Fonts.
	...identifiersWithSizes(`json-dive-font-size`, [
		"sm",
		"base",
		"lg",
		"xl",
		"2xl",
	]),
	// Other/custom classes.
	"json-dive-css-reset",
	"json-dive-no-scrollbar",
	"json-dive-temp-force-focus-state",
	"json-dive-viewer-instance",
	// Tutorial.
	"json-dive-tutorial-target-expand-icon",
	"json-dive-tutorial-target-view-tab",
	"json-dive-tutorial-target-edit-tab",
	"json-dive-tutorial-target-type-icon",
])

/**
 * @param {string} s
 * @returns {boolean}
 */
function isValidJsonDiveCssIdentifier(s) {
	return validJsonDiveCssIdentifiers.has(s)
}

function reportInvalidIdentifiers(value, node, context) {
	const identifiers = extractCssIdentifiersFromString(value)
	for (const identifier of identifiers) {
		if (!isValidJsonDiveCssIdentifier(identifier)) {
			const closestCandidate = minBy([...validJsonDiveCssIdentifiers], id =>
				editDistance(id, identifier)
			)

			context.report({
				node,
				message: `${identifier} is not a valid JSON Dive CSS variable or class name. Did you mean ${closestCandidate}?`,
			})
		}
	}
}

/**
 * @type {import("eslint").ESLint.Plugin>}
 */
const jsonDiveCssIdentifiersPlugin = {
	name: "json-dive-css-identifiers",
	rules: {
		"valid-json-dive-css-identifiers": {
			create(context) {
				return {
					Literal(node) {
						if (typeof node.value === "string") {
							reportInvalidIdentifiers(node.value, node, context)
						}
					},
					TemplateLiteral(node) {
						if (node.expressions.length === 0) {
							const rawValue = node.quasis.at(0)?.value.raw
							if (rawValue) {
								reportInvalidIdentifiers(rawValue, node, context)
							}
						}
					},
				}
			},
		},
	},
}

/**
 * @param {{withStyleX: boolean}} options
 * @returns {Array<import("eslint").Linter.Config>}
 */
export const sharedESLintConfig = ({ withStyleX } = {}) => [
	{
		rules: {
			"react/react-in-jsx-scope": "off",
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{ argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
			],
			"@typescript-eslint/no-explicit-any": "off",
			"react/prop-types": "off",
			"@typescript-eslint/no-this-alias": "off",
			"no-console": ["warn", { allow: ["warn", "error"] }],
		},
	},
	reactHooks.configs["recommended-latest"],
	...(withStyleX
		? [
				{
					files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
					plugins: { "@stylexjs": stylex },
					rules: {
						"@stylexjs/valid-styles": "error",
						"@stylexjs/no-unused": "warn",
						"@stylexjs/valid-shorthands": "warn",
						"@stylexjs/sort-keys": "off",
					},
				},
			]
		: []),
	{
		files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		plugins: {
			"json-dive-css-identifiers": jsonDiveCssIdentifiersPlugin,
		},
		rules: {
			"json-dive-css-identifiers/valid-json-dive-css-identifiers": "error",
		},
	},
]
