import { defineConfig } from "tsup"
import babel from "esbuild-plugin-babel"

export default defineConfig(options => {
	return {
		entry: ["src/index.tsx"],
		dts: true,
		// Using babel with tsup.
		// https://github.com/egoist/tsup/discussions/605#discussioncomment-2557198
		esbuildPlugins: [babel()],
		watch: options.watch,
		sourcemap: true,
		format: ["esm"],
		external: ["react", "react-dom"],
		esbuildOptions(options) {
			options.external = ["react", "react-dom"]
		},
		// https://github.com/egoist/tsup/issues/927#issuecomment-2354939322
		// banner: ({ format }) => {
		// 	return format === "esm"
		// 		? {
		// 				js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
		// 			}
		// 		: {}
		// },
	}
})
