<p align="center">
  <img src="https://raw.githubusercontent.com/dangttp97/koniwa/main/assets/logo.svg" width="96" alt="koniwa logo: a bonsai tree in a small pot">
</p>

<h1 align="center">@koniwa/core</h1>

<p align="center">The core of <a href="https://github.com/dangttp97/koniwa">koniwa 小庭</a>: a tiny JSX renderer that turns JSX straight into real DOM nodes.</p>

- **React-style hooks.** `useState`, `useReducer`, `useEffect`, `useLayoutEffect`,
  `useMemo`, `useCallback`, `useRef`, `useContext`, `useImperativeHandle`, `useId` and
  `useSyncExternalStore`. When state changes, only that component re-renders, and the DOM
  is patched in place, so inputs keep their focus.
- **No dependencies.** About 650 lines of TypeScript.
- **Works with any JSX compiler** through the automatic runtime (`jsxImportSource`) or the
  classic `createVirtualNode` factory.

It is a good fit for mostly static pages (portfolios, landing pages, CVs) where you want to
write markup as components, with a bit of interactivity, but don't need React. If you know
React, you already know most of koniwa (see [Coming from React](#coming-from-react)).

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
| `useReducer`, `useLayoutEffect`, `useId`          | Same names and signatures                      |
| `useSyncExternalStore`                            | Same (`getServerSnapshot` is ignored: no SSR)  |
| `createContext`, `<Ctx.Provider>`, `useContext`   | Same                                           |
| `ref` on elements (objects or callbacks)          | Same                                           |
| `ref` on components                               | A normal prop, like React 19 (no `forwardRef`) |
| `key` on list items                               | Same: keyed items are moved, not recreated     |
| Controlled inputs (`value`, `checked`)            | Same                                           |

What is different:

- **Events are native DOM events**, not React's synthetic events. `onChange` fires on the
  browser's `change` event (when an input loses focus); use `onInput` for every keystroke.
- **`useEffect` runs right after the DOM is updated**, before the browser paints, not later.
  The order is the same as React: every `useLayoutEffect` in the tree first, then every
  `useEffect`, children before parents.
- **`mount` replaces, it does not patch.** Calling `mount` again throws away the old tree (and
  its state) and builds a new one. Use state to update parts of a page.
- **Numbers in `style` get no unit.** Write `{ width: "10px" }`, not `{ width: 10 }`.
- **No class components**, no `forwardRef`, `memo` or portals, and no `dangerouslySetInnerHTML`.
- **React libraries do not work.** There is no compatibility layer like `preact/compat`.

## API

| Export                                         | Description                                                                                                                                                    |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `render(child, container)`                     | Builds DOM from `child` and **appends** it to `container`. Accepts a VirtualNode, a string or number, an array, or a component function (`render(App, root)`). |
| `mount(child, container)`                      | Removes what was rendered in `container` before (running effect cleanups), clears it, then renders into it.                                                    |
| `useState(initial)`                            | `[value, setValue]`. `setValue(next)` or `setValue((prev) => next)`; updates in the same tick are batched into one render.                                     |
| `useEffect(effect, deps?)`                     | Runs `effect` after the DOM is updated, again when `deps` change (every render without `deps`). Return a function to clean up.                                 |
| `useMemo(factory, deps)`                       | Returns the cached result of `factory` until `deps` change.                                                                                                    |
| `useCallback(callback, deps)`                  | Returns the same function until `deps` change.                                                                                                                 |
| `useRef(initial)`                              | `{ current }` that stays the same across renders; changing it does not re-render. Pass it as `ref` to get a DOM element.                                       |
| `useImperativeHandle(ref, create, deps?)`      | Sets the parent's `ref` to `create()` (for example `{ focus }`), and back to `null` on unmount.                                                                |
| `createContext(defaultValue)`                  | Returns `{ Provider, defaultValue }`. Wrap a subtree in `<Ctx.Provider value={...}>`.                                                                          |
| `useContext(context)`                          | The `value` of the nearest `Provider` above, or `defaultValue` when there is none.                                                                             |
| `useReducer(reducer, initialArg, init?)`       | `[state, dispatch]`. `dispatch(action)` sets the state to `reducer(state, action)`; `dispatch` never changes.                                                  |
| `useLayoutEffect(effect, deps?)`               | Like `useEffect`, but all layout effects run before any `useEffect`. Use it to measure the DOM.                                                                |
| `useId()`                                      | A unique id that stays the same for the life of the component, for `id` / `htmlFor` pairs.                                                                     |
| `useSyncExternalStore(subscribe, getSnapshot)` | Reads a value from an outside store and re-renders when `getSnapshot()` returns something new.                                                                 |
| `createVirtualNode(type, props, ...children)`  | Classic JSX factory. Returns a VirtualNode `{ type, props, children }`.                                                                                        |
| `Fragment`                                     | `<>...</>`: renders children without a wrapper element.                                                                                                        |
| `@koniwa/core/jsx-runtime`                     | Automatic runtime (`jsx`, `jsxs`, `Fragment`) used by the compiler.                                                                                            |

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

| Hook                   | What it is for                                              | Status    |
| ---------------------- | ----------------------------------------------------------- | --------- |
| `useState`             | Local state; changing it re-renders the component           | Available |
| `useEffect`            | Run code after render, with cleanup                         | Available |
| `useMemo`              | Cache a computed value until its dependencies change        | Available |
| `useCallback`          | Keep the same function between renders                      | Available |
| `useRef`               | Hold a DOM element or a value across renders                | Available |
| `useContext`           | Read a value from a `createContext` provider up the tree    | Available |
| `useImperativeHandle`  | Expose methods from a component to its parent through `ref` | Available |
| `useReducer`           | State updated through a reducer and actions                 | Available |
| `useLayoutEffect`      | Run code after the DOM changes, before other effects        | Available |
| `useId`                | Stable unique ids for labels and ARIA attributes            | Available |
| `useSyncExternalStore` | Read from an outside store and stay in sync with it         | Available |

Routing between pages lives in a separate package,
[`@koniwa/router`](https://github.com/dangttp97/koniwa/tree/main/packages/router): a small
router, not a full SPA framework.

Out of scope, on purpose: server-side rendering, server components, Suspense and concurrent
rendering. koniwa stays a small tool for static sites of about ten pages-ish.

## Contributing

See the [repository README](https://github.com/dangttp97/koniwa#development) and
[how koniwa works](https://github.com/dangttp97/koniwa/blob/main/docs/architecture.md).

## License

[MIT](LICENSE)
