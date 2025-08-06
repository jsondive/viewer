import { styleXPostCSSPlugins } from "@jsondive/shared-config"
import postcssImport from "postcss-import"

export default {
	plugins: {
		...styleXPostCSSPlugins,
		"postcss-import": postcssImport,
	},
}
