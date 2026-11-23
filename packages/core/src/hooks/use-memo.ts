import { useHook } from "../core/current-component.js";
import type { DependencyList } from "../types.js";
import { depsChanged } from "./deps.js";

interface MemoHook<T> {
  value?: T;
  deps?: DependencyList;
}

export const useMemo = <T>(factory: () => T, deps: DependencyList): T => {
  const hook = useHook<MemoHook<T>>(() => ({}));
  if (depsChanged(hook.deps, deps)) {
    hook.value = factory();
    hook.deps = deps;
  }
  return hook.value as T;
};

export const useCallback = <T extends (...args: any[]) => unknown>(
  callback: T,
  deps: DependencyList,
): T => useMemo(() => callback, deps);
