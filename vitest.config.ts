import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const source = (file: string) =>
  fileURLToPath(new URL(`./packages/${file}`, import.meta.url));

export default defineConfig({
  // Tests compile JSX with koniwa's own automatic runtime, straight from source.
  oxc: { jsx: { runtime: "automatic", importSource: "@koniwa/core" } },
  resolve: {
    alias: [
      {
        find: "@koniwa/core/jsx-runtime",
        replacement: source("core/src/jsx-runtime.ts"),
      },
      {
        find: "@koniwa/core/jsx-dev-runtime",
        replacement: source("core/src/jsx-dev-runtime.ts"),
      },
      { find: /^@koniwa\/core$/, replacement: source("core/src/index.ts") },
      { find: /^@koniwa\/router$/, replacement: source("router/src/index.ts") },
    ],
  },
  test: { environment: "happy-dom" },
});
