import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const src = (file: string) =>
  fileURLToPath(new URL(`./src/${file}`, import.meta.url));

export default defineConfig({
  // Tests compile JSX with the package's own automatic runtime, straight from src/.
  oxc: { jsx: { runtime: "automatic", importSource: "@koniwa/core" } },
  resolve: {
    alias: [
      {
        find: "@koniwa/core/jsx-runtime",
        replacement: src("jsx-runtime.ts"),
      },
      {
        find: "@koniwa/core/jsx-dev-runtime",
        replacement: src("jsx-dev-runtime.ts"),
      },
      { find: /^@koniwa\/core$/, replacement: src("index.ts") },
    ],
  },
  test: { environment: "happy-dom" },
});
