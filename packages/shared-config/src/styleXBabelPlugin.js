// https://stylexjs.com/docs/learn/installation/

/**
 * @param {string} moduleName
 */
export const styleXBabelPlugin = moduleName => [
	"@stylexjs/babel-plugin",
	{
		dev: false,
		test: false,
		runtimeInjection: false,
		treeshakeCompensation: true,
		unstable_moduleResolution: {
			type: "commonJS",
		},
		classNamePrefix: `json-dive-${moduleName}-x-`,
	},
]
