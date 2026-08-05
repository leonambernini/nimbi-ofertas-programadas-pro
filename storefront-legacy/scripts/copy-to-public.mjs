import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "dist", "main.min.js");
const destDir = join(root, "..", "public", "storefront");
const dest = join(destDir, "ofertas-legacy.min.js");

if (!existsSync(src)) {
  console.error("[ofertas-legacy] missing build artifact:", src);
  process.exit(1);
}

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log("[ofertas-legacy] copied →", dest);
