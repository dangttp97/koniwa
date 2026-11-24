import type { DOMAttributes, HTMLAttributes } from "./dom-props.js";
import type {
  FunctionComponent,
  Props as ElementProps,
  ReactElement,
  ReactNode,
} from "./types.js";

/** @deprecated Use `ReactNode`. */
export type Child = ReactNode;

/** @deprecated Use `ReactElement`. */
export type VirtualNode = ReactElement;

/** @deprecated Use `FunctionComponent` or `FC`. */
export type Component<P = any> = FunctionComponent<P>;

/** @deprecated Use `ComponentProps<"div">` or `HTMLAttributes<T>` for element props. */
export type Props = ElementProps;

/** @deprecated Use `HTMLAttributes<T>`. */
export type HTMLProps<T extends HTMLElement> = HTMLAttributes<T>;

/** @deprecated Use `DOMAttributes<T>`. */
export type EventProps<T extends Element> = DOMAttributes<T>;
