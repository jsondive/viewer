import { styleXBabelPlugin } from "@jsondive/shared-config"

// Jest stuff: https://jestjs.io/docs/getting-started#using-babel

/** @returns {import("@babel/core").TransformOptions} */
export default api => ({
	presets: [
		...(api.env("test")
			? [["@babel/preset-env", { targets: { node: "current" } }]]
			: []),
		[
			"@babel/preset-react",
			// Lets us use JSX without importing React.
			{ runtime: "automatic" },
		],
		"@babel/preset-typescript",
	],
	plugins: [styleXBabelPlugin("viewer")],
})
