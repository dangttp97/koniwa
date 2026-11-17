/** Anything that can appear as a child in JSX. */
export type Child =
  VNode | string | number | boolean | null | undefined | Child[];

export type Props = Record<string, unknown>;

// Component props are type-checked by JSX at each call site, so `any` is intentional here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Component<P = any> = (props: P) => Child;

/** A plain object describing an element or a component call. */
export interface VNode {
  type: string | Component;
  props: Props;
  children: Child[];
}
