import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";

const PROJECT_ROOT = import.meta.dirname;

/** SPA fallback for client-side routes in dev. */
function vitePluginSpaFallback(): Plugin {
  return {
    name: "spa-fallback",
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? "").split("?")[0];
        if (
          req.method !== "GET" ||
          url.startsWith("/@") ||
          url.startsWith("/api") ||
          url.startsWith("/src/") ||
          url.startsWith("/node_modules/") ||
          /\.\w+$/.test(url)
        ) {
          next();
          return;
        }
        req.url = "/index.html";
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), jsxLocPlugin(), vitePluginSpaFallback()],
  resolve: {
    alias: {
      "@": path.resolve(PROJECT_ROOT, "client", "src"),
      "@shared": path.resolve(PROJECT_ROOT, "shared"),
      "@assets": path.resolve(PROJECT_ROOT, "attached_assets"),
    },
  },
  envDir: PROJECT_ROOT,
  root: path.resolve(PROJECT_ROOT, "client"),
  publicDir: path.resolve(PROJECT_ROOT, "client", "public"),
  build: {
    outDir: path.resolve(PROJECT_ROOT, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: true,
    allowedHosts: ["localhost", "127.0.0.1"],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
