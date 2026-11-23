import type { Child, Component, Props, VirtualNode } from "./types.js";

export const createVirtualNode = (
  type: string | Component,
  props: Props | null,
  ...children: Child[]
): VirtualNode => ({
  type,
  props: props ?? {},
  children: (children as unknown[]).flat(Infinity) as Child[],
});

export const Fragment = (props: { children?: Child[] }): Child =>
  props.children ?? [];
