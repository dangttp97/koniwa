export type ReactNode =
  ReactElement | string | number | boolean | null | undefined | ReactNode[];

export type Props = Record<string, unknown>;

export type FunctionComponent<P = {}> = (props: P) => ReactNode;

export type FC<P = {}> = FunctionComponent<P>;

export interface ReactElement {
  type: string | FunctionComponent<any>;
  props: Props;
  children: ReactNode[];
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
  Provider: FunctionComponent<{ value: T; children?: ReactNode }>;
  defaultValue: T;
}
