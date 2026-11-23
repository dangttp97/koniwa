import { useHook } from "../core/current-component.js";
import { setRef } from "../core/refs.js";
import type { DependencyList, Ref, RefObject } from "../types.js";
import { useLayoutEffect } from "./use-effect.js";

export function useRef<T>(initialValue: T): RefObject<T>;
export function useRef<T>(initialValue: T | null): RefObject<T | null>;
export function useRef<T>(initialValue: T): RefObject<T> {
  return useHook(() => ({ current: initialValue }));
}

export const useImperativeHandle = <T>(
  ref: Ref<T>,
  createHandle: () => T,
  deps?: DependencyList,
): void => {
  const depsWithRef = deps === undefined ? undefined : [...deps, ref];

  useLayoutEffect(() => {
    setRef(ref, createHandle());
    return () => setRef(ref, null);
  }, depsWithRef);
};
