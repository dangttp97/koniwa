import { createVirtualNode } from "./virtual-node.js";
import type { Child, Component, Props, VirtualNode } from "./types.js";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

export const render = (child: Child | Component, container: Node): void => {
  const node =
    typeof child === "function" ? createVirtualNode(child, null) : child;
  appendChild(container, node, false);
};

export const mount = (child: Child | Component, container: Element): void => {
  container.replaceChildren();
  render(child, container);
};

const appendChild = (parent: Node, child: Child, insideSvg: boolean): void => {
  if (child == null || typeof child === "boolean") return;

  if (Array.isArray(child)) {
    for (const item of child) appendChild(parent, item, insideSvg);
  } else if (typeof child === "string" || typeof child === "number") {
    parent.appendChild(document.createTextNode(String(child)));
  } else if (typeof child.type === "function") {
    appendChild(parent, callComponent(child.type, child), insideSvg);
  } else {
    parent.appendChild(createDomElement(child.type, child, insideSvg));
  }
};

const callComponent = (component: Component, node: VirtualNode): Child =>
  component({ ...node.props, children: node.children });

const createDomElement = (
  tag: string,
  node: VirtualNode,
  insideSvg: boolean,
): Element => {
  const isSvg = insideSvg || tag === "svg";
  const element = isSvg
    ? document.createElementNS(SVG_NAMESPACE, tag)
    : document.createElement(tag);

  setProps(element, node.props);

  // Children of <foreignObject> are HTML again.
  const childrenInsideSvg = isSvg && tag !== "foreignObject";
  for (const child of node.children)
    appendChild(element, child, childrenInsideSvg);

  return element;
};

const setProps = (element: Element, props: Props): void => {
  for (const [name, value] of Object.entries(props)) {
    if (name === "key" || name === "children") continue;
    if (value == null || value === false) continue;

    if (name.startsWith("on") && typeof value === "function") {
      const eventName = name.slice(2).toLowerCase();
      element.addEventListener(eventName, value as EventListener);
    } else if (name === "style" && typeof value === "object") {
      Object.assign((element as HTMLElement).style, value);
    } else {
      element.setAttribute(
        toAttributeName(name),
        value === true ? "" : String(value),
      );
    }
  }
};

const toAttributeName = (propName: string): string => {
  if (propName === "className") return "class";
  if (propName === "htmlFor") return "for";
  return propName;
};
