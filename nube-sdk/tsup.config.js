import { defineConfig } from "tsup";

const apiBase =
  process.env.OFERTAS_API_BASE?.replace(/\/$/, "") || "http://localhost:3000";

export default defineConfig({
  entry: ["src/main.tsx"],
  format: ["esm"],
  target: "esnext",
  clean: true,
  minify: true,
  bundle: true,
  sourcemap: false,
  splitting: false,
  skipNodeModulesBundle: false,
  define: {
    __OFERTAS_API_BASE__: JSON.stringify(apiBase),
  },
  esbuildOptions(options) {
    options.alias = {
      "@tiendanube/nube-sdk-jsx/dist/jsx-runtime":
        "@tiendanube/nube-sdk-jsx/jsx-runtime",
    };
  },
  outExtension: ({ options }) => ({
    js: options.minify ? ".min.js" : ".js",
  }),
});
