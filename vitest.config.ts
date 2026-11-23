import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const src = (file: string) =>
  fileURLToPath(new URL(`./src/${file}`, import.meta.url));

export default defineConfig({
  // Tests compile JSX with the package's own automatic runtime, straight from src/.
  oxc: { jsx: { runtime: "automatic", importSource: "koniwa" } },
  resolve: {
    alias: [
      {
        find: "koniwa/jsx-runtime",
        replacement: src("jsx-runtime.ts"),
      },
      {
        find: "koniwa/jsx-dev-runtime",
        replacement: src("jsx-dev-runtime.ts"),
      },
      { find: /^koniwa$/, replacement: src("index.ts") },
    ],
  },
  test: { environment: "happy-dom" },
});
