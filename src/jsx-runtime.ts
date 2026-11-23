import type { Child, Component, Props, VirtualNode } from "./types.js";
import { Fragment, createVirtualNode } from "./virtual-node.js";

export { Fragment };
export type { JSX } from "./jsx.js";

export const jsx = (
  type: string | Component,
  props: Props,
  key?: unknown,
): VirtualNode => {
  const { children, ...rest } = props;
  if (key !== undefined) rest.key = key;
  return children === undefined
    ? createVirtualNode(type, rest)
    : createVirtualNode(type, rest, children as Child);
};

export const jsxs = jsx;
