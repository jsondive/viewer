import { styleXBabelPlugin } from "@jsondive/shared-config"

/** @type {import("@babel/core").TransformOptions} */
export default {
	presets: [
		[
			"@babel/preset-react",
			// Lets us use JSX without importing React.
			{ runtime: "automatic" },
		],
		"@babel/preset-typescript",
	],
	plugins: [styleXBabelPlugin("library")],
}
