import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const src = (file: string) =>
  fileURLToPath(new URL(`./src/${file}`, import.meta.url));

export default defineConfig({
  // Tests compile JSX with the package's own automatic runtime, straight from src/.
  oxc: { jsx: { runtime: "automatic", importSource: "jsx-lite-renderer" } },
  resolve: {
    alias: [
      {
        find: "jsx-lite-renderer/jsx-runtime",
        replacement: src("jsx-runtime.ts"),
      },
      {
        find: "jsx-lite-renderer/jsx-dev-runtime",
        replacement: src("jsx-dev-runtime.ts"),
      },
      { find: /^jsx-lite-renderer$/, replacement: src("index.ts") },
    ],
  },
  test: { environment: "happy-dom" },
});
