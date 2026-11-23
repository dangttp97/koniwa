import type { Ref } from "../types.js";

export const setRef = <T>(ref: Ref<T>, value: T | null): void => {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
};
