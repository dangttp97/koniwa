<p align="center">
  <img src="assets/logo.svg" width="112" alt="koniwa logo: a bonsai tree in a small pot">
</p>

<h1 align="center">koniwa 小庭</h1>

<p align="center">A tiny JSX renderer that turns JSX straight into real DOM nodes.</p>

- **React-style hooks.** `useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`,
  `useContext` and `useImperativeHandle`. When state changes, only that component
  re-renders, and the DOM is patched in place, so inputs keep their focus.
- **No dependencies.** About 600 lines of TypeScript.
- **Works with any JSX compiler** through the automatic runtime (`jsxImportSource`) or the
  classic `createVirtualNode` factory.

It is a good fit for mostly static pages (portfolios, landing pages, CVs) where you want to
write markup as components, with a bit of interactivity, but don't need React. If you know
React, you already know most of koniwa (see [Coming from React](#coming-from-react)).

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

```bash
npm install @koniwa/core
# or
yarn add @koniwa/core
```

## Setup

### TypeScript

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@koniwa/core",
  },
}
```

### Vite

```ts
// vite.config.ts
import { defineConfig } from "vite";

export default defineConfig({
  oxc: {
    jsx: { runtime: "automatic", importSource: "@koniwa/core" },
  },
});
```

With the automatic runtime the compiler imports what it needs, so components never import
`createVirtualNode` themselves.

## Usage

```tsx
import { mount, useEffect, useState } from "@koniwa/core";

const Greeting = ({ name }: { name: string }) => <h1>Hello, {name}!</h1>;

const Counter = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `Clicked ${count} times`;
  }, [count]);

  return (
    <button onClick={() => setCount((c) => c + 1)}>
      Clicked {count} times
    </button>
  );
};

const App = () => (
  <>
    <Greeting name="Ken Musashi" />
    <Counter />
  </>
);

mount(<App />, document.getElementById("root")!);
```

## Coming from React

The parts you write every day work the same way:

| React                                             | koniwa                                         |
| ------------------------------------------------- | ---------------------------------------------- |
| Function components with `props`, `children`      | Same                                           |
| `<>...</>` / `Fragment`                           | Same                                           |
| `className`, `htmlFor`, `style={{ ... }}`         | Same                                           |
| `onClick`, `onInput`, `onSubmit`, …               | Same names, attached with `addEventListener`   |
| `"jsxImportSource": "react"`                      | `"jsxImportSource": "@koniwa/core"`            |
| `React.createElement(type, props, ...kids)`       | `createVirtualNode(type, props, ...kids)`      |
| `createRoot(root).render(<App />)`                | `mount(<App />, root)`                         |
| `useState`, `useEffect`, `useMemo`, `useCallback` | Same names and signatures                      |
| `useRef`, `useImperativeHandle`                   | Same names and signatures                      |
| `createContext`, `<Ctx.Provider>`, `useContext`   | Same                                           |
| `ref` on elements (objects or callbacks)          | Same                                           |
| `ref` on components                               | A normal prop, like React 19 (no `forwardRef`) |
| `key` on list items                               | Same: keyed items are moved, not recreated     |
| Controlled inputs (`value`, `checked`)            | Same                                           |

What is different:

- **Events are native DOM events**, not React's synthetic events. `onChange` fires on the
  browser's `change` event (when an input loses focus); use `onInput` for every keystroke.
- **Effects run right after the DOM is updated**, before the browser paints (like React's
  `useLayoutEffect`), not later.
- **`mount` replaces, it does not patch.** Calling `mount` again throws away the old tree (and
  its state) and builds a new one. Use state to update parts of a page.
- **Numbers in `style` get no unit.** Write `{ width: "10px" }`, not `{ width: 10 }`.
- **No class components**, no `forwardRef`, `memo` or portals, and no `dangerouslySetInnerHTML`.
- **React libraries do not work.** There is no compatibility layer like `preact/compat`.

## API

| Export                                        | Description                                                                                                                                                    |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `render(child, container)`                    | Builds DOM from `child` and **appends** it to `container`. Accepts a VirtualNode, a string or number, an array, or a component function (`render(App, root)`). |
| `mount(child, container)`                     | Removes what was rendered in `container` before (running effect cleanups), clears it, then renders into it.                                                    |
| `useState(initial)`                           | `[value, setValue]`. `setValue(next)` or `setValue((prev) => next)`; updates in the same tick are batched into one render.                                     |
| `useEffect(effect, deps?)`                    | Runs `effect` after the DOM is updated, again when `deps` change (every render without `deps`). Return a function to clean up.                                 |
| `useMemo(factory, deps)`                      | Returns the cached result of `factory` until `deps` change.                                                                                                    |
| `useCallback(callback, deps)`                 | Returns the same function until `deps` change.                                                                                                                 |
| `useRef(initial)`                             | `{ current }` that stays the same across renders; changing it does not re-render. Pass it as `ref` to get a DOM element.                                       |
| `useImperativeHandle(ref, create, deps?)`     | Sets the parent's `ref` to `create()` (for example `{ focus }`), and back to `null` on unmount.                                                                |
| `createContext(defaultValue)`                 | Returns `{ Provider, defaultValue }`. Wrap a subtree in `<Ctx.Provider value={...}>`.                                                                          |
| `useContext(context)`                         | The `value` of the nearest `Provider` above, or `defaultValue` when there is none.                                                                             |
| `createVirtualNode(type, props, ...children)` | Classic JSX factory. Returns a VirtualNode `{ type, props, children }`.                                                                                        |
| `Fragment`                                    | `<>...</>`: renders children without a wrapper element.                                                                                                        |
| `@koniwa/core/jsx-runtime`                    | Automatic runtime (`jsx`, `jsxs`, `Fragment`) used by the compiler.                                                                                            |

Types: `Child`, `Component`, `Props`, `VirtualNode`, `JSX`, `Dispatch`, `SetStateAction`,
`DependencyList`, `EffectCallback`, `Ref`, `RefObject`, `RefCallback`, `Context`.

### How props are applied

| Prop                                | Result                              |
| ----------------------------------- | ----------------------------------- |
| `className` / `class`               | `class` attribute                   |
| `htmlFor`                           | `for` attribute                     |
| `onClick`, `onInput`, … (functions) | `addEventListener("click", …)`      |
| `style={{ color: "red" }}`          | assigned to `element.style`         |
| `value`, `checked`, `selected`      | set as DOM properties               |
| `true`                              | empty attribute (`hidden=""`)       |
| `false`, `null`, `undefined`        | attribute is not set (or removed)   |
| `key`                               | used to match list items            |
| `ref`                               | receives the element (not set)      |
| anything else                       | `setAttribute(name, String(value))` |

`<svg>` and its children are created in the SVG namespace; children of `<foreignObject>` go back
to HTML.

## Limitations

- **Simple diffing.** Children are matched by position, or by `key` when given. Without keys,
  inserting at the top of a list re-renders every item below it.
- **`render` appends.** Calling `render` again on the same container adds a second tree. Use
  `mount` to replace the content.
- **Loose attribute types.** Intrinsic elements accept any attribute; there is no per-element
  type checking like `@types/react` provides.
- **Custom CSS properties in `style` objects** (`{ "--size": "10px" }`) are not applied; set
  them with CSS classes instead.

## Roadmap

React-style hooks, with the same names and call signatures as React, so code and habits
carry over:

| Hook                  | What it is for                                              | Status    |
| --------------------- | ----------------------------------------------------------- | --------- |
| `useState`            | Local state; changing it re-renders the component           | Available |
| `useEffect`           | Run code after render, with cleanup                         | Available |
| `useMemo`             | Cache a computed value until its dependencies change        | Available |
| `useCallback`         | Keep the same function between renders                      | Available |
| `useRef`              | Hold a DOM element or a value across renders                | Available |
| `useContext`          | Read a value from a `createContext` provider up the tree    | Available |
| `useImperativeHandle` | Expose methods from a component to its parent through `ref` | Available |

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

On Windows, run the tests from a path with an uppercase drive letter (`C:\...`). VS Code
terminals can start in `c:\...`, which makes Vitest load itself twice and fail with
`Cannot read properties of undefined (reading 'config')`.

## License

[MIT](LICENSE)
