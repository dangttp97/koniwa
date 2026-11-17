import type { VNode } from "./types.js";

/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/no-explicit-any --
   TypeScript looks JSX types up in a namespace; attributes are intentionally loose. */
export namespace JSX {
  export type Element = VNode;
  export interface IntrinsicElements {
    [elemName: string]: any;
  }
  export interface ElementChildrenAttribute {
    children: unknown;
  }
}
