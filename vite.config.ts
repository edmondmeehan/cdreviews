// Vite config for cdreviews — TanStack Start (SSR) deployed to Vercel via Nitro.
// Replaces the Lovable-managed config (@lovable.dev/vite-tanstack-config), which
// targeted Cloudflare Workers.
import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

export default defineConfig(({ command, mode }) => {
  // Bake VITE_* vars into the client bundle (Supabase URL + publishable key).
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const define = Object.fromEntries(
    Object.entries(env).map(([k, v]) => [`import.meta.env.${k}`, JSON.stringify(v)]),
  );

  return {
    define,
    resolve: {
      alias: { "@": `${process.cwd()}/src` },
      dedupe: ["react", "react-dom", "@tanstack/react-query", "@tanstack/query-core"],
    },
    plugins: [
      tailwindcss(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tanstackStart({
        // SSR error wrapper lives in src/server.ts
        server: { entry: "server" },
        importProtection: {
          behavior: "error",
          client: { files: ["**/server/**"], specifiers: ["server-only"] },
        },
      }),
      // Nitro produces .vercel/output when building for Vercel.
      ...(command === "build" ? [nitro({ preset: process.env.NITRO_PRESET ?? "vercel" })] : []),
      viteReact(),
    ],
  };
});
