// Automatic JSX runtime: with `"jsxImportSource": "jsx-lite-renderer"` the compiler imports
// `jsx`/`jsxs` from here, so components never need to import `h` themselves.
import { Fragment, h } from "./h.js";
import type { Component, Props, VNode } from "./types.js";

export { Fragment };
export type { JSX } from "./jsx.js";

export const jsx = (
  type: string | Component,
  props: Props,
  _key?: unknown,
): VNode => {
  const { children, ...rest } = props;
  return children === undefined
    ? h(type, rest)
    : h(type, rest, children as never);
};

/** Same as `jsx`; the compiler uses it when there are several static children. */
export const jsxs = jsx;
