<p align="center">
  <img src="assets/logo.svg" width="112" alt="koniwa logo: a bonsai tree in a small pot">
</p>

<h1 align="center">koniwa 小庭</h1>

<p align="center">A tiny JSX renderer that turns JSX straight into real DOM nodes.</p>

- **No virtual DOM diffing, no state, no hooks.** Components are plain functions that run once.
- **No dependencies.** About 100 lines of TypeScript.
- **Works with any JSX compiler** through the automatic runtime (`jsxImportSource`) or the
  classic `createVirtualNode` factory.

It is a good fit for mostly static pages (portfolios, landing pages, CVs) where you want to
write markup as components but don't need React. If you know React, you already know most of
koniwa (see [Coming from React](#coming-from-react)). React-style hooks are planned (see
[Roadmap](#roadmap)); until they land, use React or Preact if you need state or re-rendering.

## The name

_Koniwa_ (小庭) means "small garden": the little garden inside a traditional Japanese
house, the part guests actually see. A small garden is small but curated, and every stone,
plant and lantern has its place. That is the idea here: a handful of pages built from
components and laid out with care, for school projects, GitHub pages and personal sites of
about ten pages or fewer.

Koniwa is one part of a bigger house:

- [**watari**](https://github.com/dangttp97/watari) (渡り), from _watari-rōka_, the covered
  corridor that connects the rooms. It fetches data and carries it where it is needed.
- **jubako** (重箱), the stacked lunch boxes kept in the kitchen. It stores things in layers.
- **koniwa** (小庭), the garden. It puts everything on display.

_Jubako keeps things, watari carries them, koniwa shows them._

## Install

Not on npm yet, so install it from GitHub:

```bash
yarn add koniwa@github:dangttp97/koniwa
# or
npm install github:dangttp97/koniwa
```

The package builds itself on install (`prepack`).

## Setup

### TypeScript

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "koniwa",
  },
}
```

### Vite

```ts
// vite.config.ts
import { defineConfig } from "vite";

export default defineConfig({
  oxc: {
    jsx: { runtime: "automatic", importSource: "koniwa" },
  },
});
```

With the automatic runtime the compiler imports what it needs, so components never import
`createVirtualNode` themselves.

## Usage

```tsx
import { render } from "koniwa";

const Greeting = ({ name }: { name: string }) => <h1>Hello, {name}!</h1>;

const App = () => (
  <>
    <Greeting name="Ken Musashi" />
    <button onClick={() => alert("Hi")}>Say hi</button>
  </>
);

render(<App />, document.getElementById("root")!);
```

## Coming from React

The parts you write every day work the same way:

| React                                        | koniwa                                       |
| -------------------------------------------- | -------------------------------------------- |
| Function components with `props`, `children` | Same                                         |
| `<>...</>` / `Fragment`                      | Same                                         |
| `className`, `htmlFor`, `style={{ ... }}`    | Same                                         |
| `onClick`, `onInput`, `onSubmit`, …          | Same names, attached with `addEventListener` |
| `"jsxImportSource": "react"`                 | `"jsxImportSource": "koniwa"`                |
| `React.createElement(type, props, ...kids)`  | `createVirtualNode(type, props, ...kids)`    |
| `createRoot(root).render(<App />)`           | `mount(<App />, root)`                       |

What is different:

- **Components run once.** Nothing re-renders; to update the page, call `mount` again or change
  the DOM in an event handler.
- **Events are native DOM events**, not React's synthetic events. `onChange` fires on the
  browser's `change` event (when an input loses focus); use `onInput` for every keystroke.
- **Numbers in `style` get no unit.** Write `{ width: "10px" }`, not `{ width: 10 }`.
- **Every prop is an attribute.** `value` and `checked` set the initial HTML attribute, and
  `dangerouslySetInnerHTML` is not supported.
- **No class components**, no `key`-based reordering (`key` is ignored), no hooks yet.

## API

| Export                                        | Description                                                                                                                                                    |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `render(child, container)`                    | Builds DOM from `child` and **appends** it to `container`. Accepts a VirtualNode, a string or number, an array, or a component function (`render(App, root)`). |
| `mount(child, container)`                     | Clears `container`, then renders into it.                                                                                                                      |
| `createVirtualNode(type, props, ...children)` | Classic JSX factory. Returns a VirtualNode `{ type, props, children }`.                                                                                        |
| `Fragment`                                    | `<>...</>`: renders children without a wrapper element.                                                                                                        |
| `koniwa/jsx-runtime`                          | Automatic runtime (`jsx`, `jsxs`, `Fragment`) used by the compiler.                                                                                            |

Types: `Child`, `Component`, `Props`, `VirtualNode`, `JSX`.

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
- **No state, effects, context or refs** yet (see [Roadmap](#roadmap)).
- **Loose attribute types.** Intrinsic elements accept any attribute; there is no per-element
  type checking like `@types/react` provides.
- **Custom CSS properties in `style` objects** (`{ "--size": "10px" }`) are not applied; set
  them with CSS classes instead.

## Roadmap

The next step is React-style hooks, with the same names and call signatures as React, so
code and habits carry over:

| Hook                  | What it is for                                              |
| --------------------- | ----------------------------------------------------------- |
| `useState`            | Local state; changing it re-renders the component           |
| `useEffect`           | Run code after render, with cleanup                         |
| `useRef`              | Hold a DOM element or a value across renders                |
| `useMemo`             | Cache a computed value until its dependencies change        |
| `useCallback`         | Keep the same function between renders                      |
| `useContext`          | Read a value from a `createContext` provider up the tree    |
| `useImperativeHandle` | Expose methods from a component to its parent through `ref` |

These are **planned, not available yet**; details may change while they are built.

Out of scope, on purpose: server-side rendering, client-side routing (SPA), server
components, Suspense and concurrent rendering. koniwa stays a small tool for static sites of
about ten pages-ish.

## Development

```bash
yarn install
yarn test        # Vitest + happy-dom
yarn typecheck
yarn build       # emits dist/
```

## License

[MIT](LICENSE)
