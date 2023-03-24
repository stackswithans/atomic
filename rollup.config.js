import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
    input: "src/main.ts",
    output: {
        file: "dist/bundle.js",
        format: "es",
    },
    plugins: [typescript(), nodeResolve()],
};
