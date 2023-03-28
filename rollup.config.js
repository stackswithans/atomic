import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import serve from "rollup-plugin-serve";

export default [
    {
        input: "src/main.ts",
        output: {
            file: "dist/atomic.esm-browser.js",
            format: "es",
        },
        plugins: [
            typescript(),
            nodeResolve({
                browser: true,
            }),
            commonjs(),
            serve({
                open: true,

                // Multiple folders to serve from
                contentBase: ["dist", "examples"],
            }),
            livereload("dist"),
        ],
    },
    {
        input: "src/main.ts",
        output: {
            file: "dist/atomic.global.js",
            format: "iife",
        },
        plugins: [
            typescript(),
            nodeResolve({
                browser: true,
            }),
            commonjs(),
        ],
    },
];
