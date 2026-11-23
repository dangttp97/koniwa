import { useHookSlot } from "./core/current-component.js";
import { setRef } from "./core/refs.js";
import { scheduleRender } from "./core/scheduler.js";
import type {
  DependencyList,
  Dispatch,
  EffectCallback,
  Ref,
  RefObject,
  SetStateAction,
} from "./types.js";

export const useState = <S>(
  initialState: S | (() => S),
): [S, Dispatch<SetStateAction<S>>] => {
  const { hook, instance } = useHookSlot<{
    value: S;
    setValue?: Dispatch<SetStateAction<S>>;
  }>(() => ({
    value:
      typeof initialState === "function"
        ? (initialState as () => S)()
        : initialState,
  }));

  const setValue = (hook.setValue ??= (action) => {
    const next =
      typeof action === "function"
        ? (action as (previous: S) => S)(hook.value)
        : action;
    if (Object.is(next, hook.value)) return;
    hook.value = next;
    scheduleRender(instance);
  });

  return [hook.value, setValue];
};

export const useEffect = (
  effect: EffectCallback,
  deps?: DependencyList,
): void => {
  const { hook, instance } = useHookSlot<{
    deps?: DependencyList;
    cleanup?: () => void;
  }>(() => ({}));

  if (!depsChanged(hook.deps, deps)) return;
  hook.deps = deps;

  instance.pendingEffects.push(() => {
    if (instance.unmounted) return;
    hook.cleanup?.();
    const cleanup = effect();
    hook.cleanup = typeof cleanup === "function" ? cleanup : undefined;
  });
};

export const useMemo = <T>(factory: () => T, deps: DependencyList): T => {
  const { hook } = useHookSlot<{ value?: T; deps?: DependencyList }>(
    () => ({}),
  );

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

export function useRef<T>(initialValue: T): RefObject<T>;
export function useRef<T>(initialValue: T | null): RefObject<T | null>;
export function useRef<T>(initialValue: T): RefObject<T> {
  return useHookSlot(() => ({ current: initialValue })).hook;
}

export const useImperativeHandle = <T>(
  ref: Ref<T>,
  createHandle: () => T,
  deps?: DependencyList,
): void => {
  useEffect(
    () => {
      setRef(ref, createHandle());
      return () => setRef(ref, null);
    },
    deps && [...deps, ref],
  );
};

const depsChanged = (
  previous: DependencyList | undefined,
  next: DependencyList | undefined,
): boolean =>
  !previous ||
  !next ||
  previous.length !== next.length ||
  previous.some((dep, i) => !Object.is(dep, next[i]));
