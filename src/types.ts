export type Child =
  VirtualNode | string | number | boolean | null | undefined | Child[];

export type Props = Record<string, unknown>;

export type Component<P = any> = (props: P) => Child;

export interface VirtualNode {
  type: string | Component;
  props: Props;
  children: Child[];
}
