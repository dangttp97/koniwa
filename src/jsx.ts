import type { VirtualNode } from "./types.js";

export namespace JSX {
  export type Element = VirtualNode;
  export interface IntrinsicElements {
    [elemName: string]: any;
  }
  export interface ElementChildrenAttribute {
    children: unknown;
  }
}
