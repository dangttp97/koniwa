import type { HTMLAttributes, SVGProps } from "./dom-props.js";
import type { FunctionComponent, ReactElement } from "./types.js";

type HTMLElements = {
  [Tag in keyof HTMLElementTagNameMap]: HTMLAttributes<
    HTMLElementTagNameMap[Tag]
  >;
};

type SVGElements = {
  [
    Tag in Exclude<keyof SVGElementTagNameMap, keyof HTMLElementTagNameMap>
  ]: SVGProps<SVGElementTagNameMap[Tag]>;
};

export namespace JSX {
  export type Element = ReactElement;
  export type ElementType = string | FunctionComponent<any>;
  export interface IntrinsicElements extends HTMLElements, SVGElements {
    [customElement: `${string}-${string}`]: Record<string, unknown>;
  }
  export interface ElementChildrenAttribute {
    children: unknown;
  }
}
