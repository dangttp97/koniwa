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

let nextId = 0;

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

export function useReducer<S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S,
): [S, Dispatch<A>];
export function useReducer<S, A, I>(
  reducer: (state: S, action: A) => S,
  initialArg: I,
  init: (arg: I) => S,
): [S, Dispatch<A>];
export function useReducer<S, A>(
  reducer: (state: S, action: A) => S,
  initialArg: unknown,
  init?: (arg: unknown) => S,
): [S, Dispatch<A>] {
  const [state, setState] = useState(() =>
    init ? init(initialArg) : (initialArg as S),
  );
  const latestReducer = useRef(reducer);
  latestReducer.current = reducer;

  const dispatch = useMemo(
    () => (action: A) =>
      setState((previous) => latestReducer.current(previous, action)),
    [],
  );
  return [state, dispatch];
}

export const useEffect = (
  effect: EffectCallback,
  deps?: DependencyList,
): void => {
  useEffectIn("pendingEffects", effect, deps);
};

export const useLayoutEffect = (
  effect: EffectCallback,
  deps?: DependencyList,
): void => {
  useEffectIn("pendingLayoutEffects", effect, deps);
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
  useLayoutEffect(
    () => {
      setRef(ref, createHandle());
      return () => setRef(ref, null);
    },
    deps && [...deps, ref],
  );
};

export const useId = (): string =>
  useHookSlot(() => ({ id: `_k${nextId++}_` })).hook.id;

export const useSyncExternalStore = <T>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => T,
  _getServerSnapshot?: () => T,
): T => {
  const value = getSnapshot();
  const { hook, instance } = useHookSlot(() => ({ value, getSnapshot }));
  hook.value = value;
  hook.getSnapshot = getSnapshot;

  useLayoutEffect(() => {
    const renderIfChanged = () => {
      if (!Object.is(hook.value, hook.getSnapshot())) scheduleRender(instance);
    };
    renderIfChanged();
    return subscribe(renderIfChanged);
  }, [subscribe]);

  return value;
};

const useEffectIn = (
  queue: "pendingEffects" | "pendingLayoutEffects",
  effect: EffectCallback,
  deps: DependencyList | undefined,
): void => {
  const { hook, instance } = useHookSlot<{
    deps?: DependencyList;
    cleanup?: () => void;
  }>(() => ({}));

  if (!depsChanged(hook.deps, deps)) return;
  hook.deps = deps;

  instance[queue].push(() => {
    if (instance.unmounted) return;
    hook.cleanup?.();
    const cleanup = effect();
    hook.cleanup = typeof cleanup === "function" ? cleanup : undefined;
  });
};

const depsChanged = (
  previous: DependencyList | undefined,
  next: DependencyList | undefined,
): boolean =>
  !previous ||
  !next ||
  previous.length !== next.length ||
  previous.some((dep, i) => !Object.is(dep, next[i]));
