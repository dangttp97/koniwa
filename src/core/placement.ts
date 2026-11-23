import type { Instance } from "./instance.js";

export const domNodesOf = (instance: Instance): Node[] =>
  instance.domNode ? [instance.domNode] : instance.children.flatMap(domNodesOf);

export const placeDomNodes = (
  parentDom: Node,
  instances: Instance[],
  before: Node | null,
): void => {
  const nodes = instances.flatMap(domNodesOf);
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];
    if (node.parentNode !== parentDom || node.nextSibling !== before) {
      parentDom.insertBefore(node, before);
    }
    before = node;
  }
};

export const nextDomSibling = (instance: Instance): Node | null => {
  for (let child = instance; child.parent; child = child.parent) {
    const siblings = child.parent.children;
    for (const sibling of siblings.slice(siblings.indexOf(child) + 1)) {
      const [first] = domNodesOf(sibling);
      if (first) return first;
    }
    if (child.parent.domNode) return null;
  }
  return null;
};
