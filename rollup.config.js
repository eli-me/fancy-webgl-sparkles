import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

export default {
	input: "lib/index.ts",
	output: [
		{
			file: "dist/fancy-webgl-sparkles.esm.prod.js",
			format: "esm",
			name: "fancy-webgl-sparkles",
			sourcemap: false
		},
		{
			file: "dist/fancy-webgl-sparkles.esm.js",
			format: "esm",
			name: "fancy-webgl-sparkles",
			sourcemap: true
		},
	],
	plugins: [
		typescript({tsconfig: "./tsconfig.json"}),
		terser()
	]
}
