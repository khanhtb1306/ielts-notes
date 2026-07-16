import path from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
// @ts-expect-error — local plugin, no types
import { assetsPlugin } from "./scripts/vite-plugin-assets.mjs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Configure base for GH Pages: <username>.github.io/ielts-foundation-notes/
// Set VITE_BASE=/ielts-foundation-notes/ in CI or export before build.
// Falls back to "./" for local dev + http-server preview.
const BASE = process.env.VITE_BASE || "./"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), assetsPlugin()],
  base: BASE,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
