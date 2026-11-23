import { useHook } from "../core/current-component.js";

let idCount = 0;

export const useId = (): string => useHook(() => `_k${idCount++}_`);
