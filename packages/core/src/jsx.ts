import type { Component, VirtualNode } from "./types.js";

export namespace JSX {
  export type Element = VirtualNode;
  export type ElementType = string | Component;
  export interface IntrinsicElements {
    [elemName: string]: any;
  }
  export interface ElementChildrenAttribute {
    children: unknown;
  }
}
