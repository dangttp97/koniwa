import type { Child, Component, VirtualNode } from "../types.js";
import type { Instance } from "./instance.js";

let current: { instance: Instance; hookIndex: number } | null = null;

export const callComponent = (instance: Instance): Child => {
  const { type, props, children } = instance.item as VirtualNode;
  const previous = current;
  current = { instance, hookIndex: 0 };
  try {
    return (type as Component)({ ...props, children });
  } finally {
    current = previous;
  }
};

export const currentInstance = (): Instance => requireCurrent().instance;

export const useHookSlot = <T>(
  create: () => T,
): { hook: T; instance: Instance } => {
  const slot = requireCurrent();
  const { instance } = slot;
  const index = slot.hookIndex++;
  instance.hooks[index] ??= create();
  return { hook: instance.hooks[index] as T, instance };
};

const requireCurrent = () => {
  if (!current) {
    throw new Error("Hooks can only be called inside a component.");
  }
  return current;
};
