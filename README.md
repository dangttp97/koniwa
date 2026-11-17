# jsx-lite-renderer

A tiny JSX renderer that turns JSX straight into real DOM nodes.

- **No virtual DOM diffing, no state, no hooks.** Components are plain functions that run once.
- **No dependencies.** About 100 lines of TypeScript.
- **Works with any JSX compiler** through the automatic runtime (`jsxImportSource`) or the
  classic `h` factory.

It is a good fit for mostly static pages (portfolios, landing pages, CVs) where you want to
write markup as components but don't need React. If you need state or re-rendering, use
React or Preact instead.

## Install

Not on npm yet, so install it from GitHub:

```bash
yarn add jsx-lite-renderer@github:dangttp97/jsx-lite-renderer
# or
npm install github:dangttp97/jsx-lite-renderer
```

The package builds itself on install (`prepack`).

## Setup

### TypeScript

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "jsx-lite-renderer",
  },
}
```

### Vite

```ts
// vite.config.ts
import { defineConfig } from "vite";

export default defineConfig({
  oxc: {
    jsx: { runtime: "automatic", importSource: "jsx-lite-renderer" },
  },
});
```

With the automatic runtime the compiler imports what it needs, so components never import
`h` themselves.

## Usage

```tsx
import { render } from "jsx-lite-renderer";

const Greeting = ({ name }: { name: string }) => <h1>Hello, {name}!</h1>;

const App = () => (
  <>
    <Greeting name="Đăng" />
    <button onClick={() => alert("Hi")}>Say hi</button>
  </>
);

render(<App />, document.getElementById("root")!);
```

## API

| Export                          | Description                                                                                                                                              |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `render(child, container)`      | Builds DOM from `child` and **appends** it to `container`. Accepts a VNode, a string or number, an array, or a component function (`render(App, root)`). |
| `mount(child, container)`       | Clears `container`, then renders into it.                                                                                                                |
| `h(type, props, ...children)`   | Classic JSX factory. Returns a VNode `{ type, props, children }`.                                                                                        |
| `Fragment`                      | `<>...</>`: renders children without a wrapper element.                                                                                                  |
| `jsx-lite-renderer/jsx-runtime` | Automatic runtime (`jsx`, `jsxs`, `Fragment`) used by the compiler.                                                                                      |

Types: `Child`, `Component`, `Props`, `VNode`, `JSX`.

### How props are applied

| Prop                                | Result                              |
| ----------------------------------- | ----------------------------------- |
| `className` / `class`               | `class` attribute                   |
| `htmlFor`                           | `for` attribute                     |
| `onClick`, `onInput`, … (functions) | `addEventListener("click", …)`      |
| `style={{ color: "red" }}`          | assigned to `element.style`         |
| `true`                              | empty attribute (`hidden=""`)       |
| `false`, `null`, `undefined`        | attribute is not set                |
| `key`                               | ignored                             |
| anything else                       | `setAttribute(name, String(value))` |

`<svg>` and its children are created in the SVG namespace; children of `<foreignObject>` go back
to HTML.

## Limitations

- **Render once.** There is no diffing: calling `render` again appends a second copy. Use
  `mount` to replace the content, or update the DOM directly (for example through `data-*`
  attributes that your CSS reacts to).
- **No state, effects, context or refs.**
- **Loose attribute types.** Intrinsic elements accept any attribute; there is no per-element
  type checking like `@types/react` provides.
- **Custom CSS properties in `style` objects** (`{ "--size": "10px" }`) are not applied; set
  them with CSS classes instead.

## Development

```bash
yarn install
yarn test        # Vitest + happy-dom
yarn typecheck
yarn build       # emits dist/
```

## License

[MIT](LICENSE)
