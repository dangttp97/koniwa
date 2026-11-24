import type {
  ReactNode,
  FunctionComponent,
  Props,
  ReactElement,
} from "./types.js";

export const createVirtualNode = (
  type: string | FunctionComponent<any>,
  props: Props | null,
  ...children: ReactNode[]
): ReactElement => ({
  type,
  props: props ?? {},
  children: (children as unknown[]).flat(Infinity) as ReactNode[],
});

export const Fragment = (props: { children?: ReactNode[] }): ReactNode =>
  props.children ?? [];
