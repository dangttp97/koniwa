import type { Instance } from "./core/instance.js";
import { createRoot, renderRoot, unmount } from "./core/reconcile.js";
import type { ReactNode, FunctionComponent } from "./types.js";
import { createVirtualNode } from "./virtual-node.js";

const rootsByContainer = new WeakMap<Node, Instance[]>();

export const render = (
  child: ReactNode | FunctionComponent<any>,
  container: Node,
): void => {
  const root = createRoot(container);
  const roots = rootsByContainer.get(container) ?? [];
  rootsByContainer.set(container, [...roots, root]);

  const node =
    typeof child === "function" ? createVirtualNode(child, null) : child;
  renderRoot(root, node);
};

export const mount = (
  child: ReactNode | FunctionComponent<any>,
  container: Element,
): void => {
  rootsByContainer.get(container)?.forEach(unmount);
  rootsByContainer.delete(container);
  container.replaceChildren();
  render(child, container);
};
