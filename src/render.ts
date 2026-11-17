import { h } from "./h.js";
import type { Child, Component } from "./types.js";

const SVG_NS = "http://www.w3.org/2000/svg";

const setProp = (el: Element, key: string, value: unknown) => {
  if (key === "key" || key === "children" || value == null || value === false) {
    return;
  }

  if (key.startsWith("on") && typeof value === "function") {
    el.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
  } else if (key === "style" && typeof value === "object") {
    Object.assign((el as HTMLElement).style, value);
  } else if (key === "className" || key === "class") {
    el.setAttribute("class", String(value));
  } else if (key === "htmlFor") {
    el.setAttribute("for", String(value));
  } else if (value === true) {
    el.setAttribute(key, "");
  } else {
    el.setAttribute(key, String(value));
  }
};

/**
 * Turns a VNode tree into real DOM nodes and appends them to `container`.
 * There is no diffing: calling it again appends a second copy (use `mount` to replace).
 */
export const render = (
  child: Child | Component,
  container: Node,
  isSvg = false,
): void => {
  if (typeof child === "function") {
    render(h(child, null), container, isSvg);
    return;
  }
  if (child == null || typeof child === "boolean") return;

  if (Array.isArray(child)) {
    child.forEach((c) => render(c, container, isSvg));
    return;
  }

  if (typeof child === "string" || typeof child === "number") {
    container.appendChild(document.createTextNode(String(child)));
    return;
  }

  if (typeof child.type === "function") {
    render(
      child.type({ ...child.props, children: child.children }),
      container,
      isSvg,
    );
    return;
  }

  const svg = isSvg || child.type === "svg";
  const el = svg
    ? document.createElementNS(SVG_NS, child.type)
    : document.createElement(child.type);

  for (const [key, value] of Object.entries(child.props)) {
    setProp(el, key, value);
  }

  // Children of <foreignObject> are HTML again, not SVG.
  child.children.forEach((c) =>
    render(c, el, svg && child.type !== "foreignObject"),
  );

  container.appendChild(el);
};

/** Clears `container` and renders `child` into it. */
export const mount = (child: Child | Component, container: Element): void => {
  container.replaceChildren();
  render(child, container);
};
