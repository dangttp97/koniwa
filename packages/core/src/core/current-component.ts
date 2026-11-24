import type { ReactNode, FunctionComponent, ReactElement } from "../types.js";
import type { Instance } from "./instance.js";

let current: { component: Instance; nextHookIndex: number } | null = null;

export const callComponent = (component: Instance): ReactNode => {
  const { type, props, children } = component.item as ReactElement;
  const previous = current;
  current = { component, nextHookIndex: 0 };
  try {
    return (type as FunctionComponent<any>)({ ...props, children });
  } finally {
    current = previous;
  }
};

export const currentComponent = (): Instance => requireCurrent().component;

export const useHook = <T>(create: (component: Instance) => T): T => {
  const frame = requireCurrent();
  const { component } = frame;
  const index = frame.nextHookIndex++;

  if (index >= component.hooks.length) {
    component.hooks.push(create(component));
  }
  return component.hooks[index] as T;
};

const requireCurrent = () => {
  if (!current) {
    throw new Error("Hooks can only be called inside a component.");
  }
  return current;
};
