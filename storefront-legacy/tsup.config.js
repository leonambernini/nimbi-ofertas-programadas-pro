import { defineConfig } from "tsup";

function resolveApiBase() {
  const fromEnv =
    process.env.OFERTAS_API_BASE ||
    process.env.APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  return fromEnv.replace(/\/$/, "") || "http://localhost:3000";
}

const apiBase = resolveApiBase();

export default defineConfig({
  entry: ["src/main.ts"],
  format: ["iife"],
  globalName: "OfertasProLegacy",
  target: "es2019",
  clean: true,
  minify: true,
  bundle: true,
  sourcemap: false,
  splitting: false,
  define: {
    __OFERTAS_API_BASE__: JSON.stringify(apiBase),
  },
  outExtension: () => ({ js: ".min.js" }),
});
