import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import cesium from "vite-plugin-cesium";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

export default defineConfig({
  plugins: [react(), cesium(), {
    name: "bairro-vivo-pwa",
    apply: "build",
    generateBundle(_options, bundle) {
      const assets = Object.keys(bundle).filter(name => /\.(js|css)$/.test(name)).sort().map(name => `/${name}`);
      const template = readFileSync(new URL("./src/pwa/sw.js", import.meta.url), "utf8");
      const version = createHash("sha256").update(template + assets.join("|")).digest("hex").slice(0, 12);
      this.emitFile({ type: "asset", fileName: "sw.js", source: template
        .replace("__CACHE_NAME__", `bairro-vivo-shell-${version}`)
        .replace("__APP_ASSETS__", JSON.stringify([...assets, "/manifest.webmanifest", "/icons/bairro-vivo-192.png", "/icons/bairro-vivo-512.png", "/icons/bairro-vivo-180.png"])) });
    },
  }],
  cacheDir: ".vite",
  server: { port: 5173, strictPort: true },
});
