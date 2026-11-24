import type {
  ReactNode,
  FunctionComponent,
  Props,
  ReactElement,
} from "./types.js";
import { Fragment, createVirtualNode } from "./virtual-node.js";

export { Fragment };
export type { JSX } from "./jsx.js";

export const jsx = (
  type: string | FunctionComponent<any>,
  props: Props,
  key?: unknown,
): ReactElement => {
  const { children, ...rest } = props;
  if (key !== undefined) rest.key = key;
  return children === undefined
    ? createVirtualNode(type, rest)
    : createVirtualNode(type, rest, children as ReactNode);
};

export const jsxs = jsx;
