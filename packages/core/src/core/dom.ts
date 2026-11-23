import type { Props } from "../types.js";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

// Set as DOM properties, after the other props, so `type` and <option>s exist first.
const DOM_PROPERTIES = ["value", "checked", "selected"];

const IGNORED_PROPS = ["key", "children", "ref"];

export const createDomElement = (tag: string, isSvg: boolean): Element =>
  isSvg
    ? document.createElementNS(SVG_NAMESPACE, tag)
    : document.createElement(tag);

export const updateProps = (
  element: Element,
  oldProps: Props,
  newProps: Props,
): void => {
  const names = new Set([...Object.keys(oldProps), ...Object.keys(newProps)]);

  for (const name of names) {
    if (!DOM_PROPERTIES.includes(name)) {
      setProp(element, name, oldProps[name], newProps[name]);
    }
  }
  for (const name of DOM_PROPERTIES) {
    if (names.has(name)) setDomProperty(element, name, newProps[name]);
  }
};

const setProp = (
  element: Element,
  name: string,
  oldValue: unknown,
  value: unknown,
): void => {
  if (IGNORED_PROPS.includes(name) || oldValue === value) return;

  const isEvent =
    name.startsWith("on") &&
    (typeof value === "function" || typeof oldValue === "function");

  if (isEvent) {
    const eventName = name.slice(2).toLowerCase();
    if (typeof oldValue === "function") {
      element.removeEventListener(eventName, oldValue as EventListener);
    }
    if (typeof value === "function") {
      element.addEventListener(eventName, value as EventListener);
    }
  } else if (name === "style" && typeof value === "object" && value) {
    updateStyle(element as HTMLElement, oldValue, value);
  } else {
    setAttribute(element, toAttributeName(name), value);
  }
};

const updateStyle = (
  element: HTMLElement,
  oldValue: unknown,
  value: object,
): void => {
  if (typeof oldValue === "object" && oldValue) {
    for (const key of Object.keys(oldValue)) {
      if (!(key in value)) element.style.setProperty(toCssName(key), "");
    }
  }
  Object.assign(element.style, value);
};

const setDomProperty = (element: Element, name: string, value: unknown) => {
  if (!(name in element)) {
    setAttribute(element, name, value);
    return;
  }
  const target = element as unknown as Record<string, unknown>;
  const next = value ?? (name === "value" ? "" : false);
  if (target[name] !== next) target[name] = next;
};

const setAttribute = (element: Element, name: string, value: unknown) => {
  if (value == null || value === false) {
    element.removeAttribute(name);
  } else {
    element.setAttribute(name, value === true ? "" : String(value));
  }
};

const toAttributeName = (propName: string): string => {
  if (propName === "className") return "class";
  if (propName === "htmlFor") return "for";
  return propName;
};

const toCssName = (key: string): string =>
  key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
