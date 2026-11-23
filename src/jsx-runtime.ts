import { Fragment, createVirtualNode } from "./virtual-node.js";
import type { Child, Component, Props, VirtualNode } from "./types.js";

export { Fragment };
export type { JSX } from "./jsx.js";

export const jsx = (
  type: string | Component,
  props: Props,
  _key?: unknown,
): VirtualNode => {
  const { children, ...rest } = props;
  return children === undefined
    ? createVirtualNode(type, rest)
    : createVirtualNode(type, rest, children as Child);
};

export const jsxs = jsx;
