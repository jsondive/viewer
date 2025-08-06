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
		format: ["cjs", "esm"],
		external: ["react"],
	}
})
