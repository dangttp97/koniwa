import type { Child, Component, Props, VNode } from "./types.js";

/** Classic JSX factory: `<div id="a">hi</div>` compiles to `h("div", { id: "a" }, "hi")`. */
export const h = (
  type: string | Component,
  props: Props | null,
  ...children: Child[]
): VNode => ({
  type,
  props: props ?? {},
  children: children.flat(Infinity as 1),
});

/** `<>...</>`: renders its children without a wrapper element. */
export const Fragment = (props: { children?: Child[] }): Child =>
  props.children ?? [];
