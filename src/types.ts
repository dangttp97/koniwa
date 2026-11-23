export type Child =
  VirtualNode | string | number | boolean | null | undefined | Child[];

export type Props = Record<string, unknown>;

export type Component<P = any> = (props: P) => Child;

export interface VirtualNode {
  type: string | Component;
  props: Props;
  children: Child[];
}

export type SetStateAction<S> = S | ((previous: S) => S);

export type Dispatch<A> = (action: A) => void;

export type DependencyList = readonly unknown[];

export type EffectCallback = () => void | (() => void);

export interface RefObject<T> {
  current: T;
}

export type RefCallback<T> = (instance: T | null) => void;

export type Ref<T> = RefObject<T | null> | RefCallback<T> | null | undefined;

export interface Context<T> {
  Provider: Component<{ value: T; children?: Child }>;
  defaultValue: T;
}
