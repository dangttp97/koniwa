# How @koniwa/core works

A short tour of `packages/core/src`, in the order things happen. Paths below are relative
to that folder unless they start with `packages/`.

## 1. JSX becomes plain objects

The compiler turns `<p class="x">hi</p>` into a call to `jsx()` (`packages/core/src/jsx-runtime.ts`),
which calls `createVirtualNode()` (`packages/core/src/virtual-node.ts`). The result is a **virtual node**:

```ts
{ type: "p", props: { class: "x" }, children: ["hi"] }
```

`type` is a tag name (`"p"`) or a component function (`Card`). Nothing touches the DOM yet.

## 2. `render` builds a tree of instances

`render(<App />, container)` (`packages/core/src/render.ts`) creates a **root instance** and asks
`core/reconcile.ts` to render into it.

Every child that ends up on the page gets an **instance** (`core/instance.ts`). An instance
remembers what was rendered there last time:

| Field            | Meaning                                                          |
| ---------------- | ---------------------------------------------------------------- |
| `item`           | The virtual node (or text) rendered here last time               |
| `domNode`        | The real DOM node, for text and elements (`null` for components) |
| `children`       | Child instances                                                  |
| `hooks`          | Hook data, for components (one entry per hook call)              |
| `pendingEffects` | Effects to run after this render: `{ layout, normal }`           |

There are four kinds of instance, decided by `item`:

- **text**: `item` is a string, `domNode` is a `Text` node
- **element**: `item.type` is a tag, `domNode` is the element
- **component**: `item.type` is a function; it has no DOM node of its own, its children do
- **empty**: `item` is `null` (from `false`, `null` or `undefined` in JSX); keeps the slot
  so siblings stay in place

## 3. Reconcile: reuse what you can

`reconcileChildren` (`core/reconcile.ts`) compares the new children with the instances
from last time:

1. For each new child, find an old instance to reuse: the one with the same `key`, or else
   the one at the same position, as long as the type matches (`createMatcher`).
2. Reused instance: update it (`updateChild`): change text, patch props, or call the
   component again.
3. No match: create a new instance (`mountChild`).
4. Old instances nobody reused: remove their DOM nodes and run cleanups (`removeChild`).

Then `core/placement.ts` moves DOM nodes into the right order, touching only the ones that
are out of place, so an input that did not move keeps its focus.

`core/dom.ts` turns props into DOM changes: attributes, event listeners, `style`, and the
`value` / `checked` / `selected` properties.

## 4. Components and hooks

`callComponent` (`core/current-component.ts`) runs a component function and remembers
which instance is running. Hooks use that through `useHook(create)`:

- the first render calls `create(component)` and stores the result in `component.hooks`
- every later render returns the same stored object, matched by call order

That is why hooks must be called in the same order on every render. Each hook in
`packages/core/src/hooks/` is a small function on top of `useHook`.

## 5. State changes re-render one component

`setState` (`hooks/use-state.ts`) stores the new value and calls `scheduleRender`
(`core/scheduler.ts`). The scheduler waits for the current task to finish
(`queueMicrotask`), so several `setState` calls become one render, then re-renders the
waiting components, parents first. A child that was already re-rendered by its parent is
skipped (`needsRender`).

## 6. Effects run after the DOM is ready

`useEffect` and `useLayoutEffect` (`hooks/use-effect.ts`) do not run during render. They
add a function to the component's `pendingEffects`. After a component's children are
rendered, `core/effects.ts` moves those into a shared queue, so children's effects are
queued before their parent's. When the DOM is updated, `runQueuedEffects` runs every
layout effect, then every normal effect.

## File map

```
packages/core/src/
  index.ts            public exports
  render.ts           render(), mount()
  virtual-node.ts     createVirtualNode(), Fragment
  jsx-runtime.ts      jsx(), jsxs() for the compiler
  jsx.ts, types.ts    TypeScript types
  hooks/              one file per hook (useState + useReducer share a file)
  core/
    instance.ts       the Instance type and small helpers
    reconcile.ts      mount, update and remove instances
    placement.ts      put DOM nodes in the right order
    dom.ts            apply props to DOM elements
    current-component.ts  which component is rendering; useHook()
    scheduler.ts      batch setState into renders
    effects.ts        effect queues
    refs.ts           setRef() for object and callback refs
```
