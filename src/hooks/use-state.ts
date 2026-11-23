import { useHook } from "../core/current-component.js";
import type { Instance } from "../core/instance.js";
import { scheduleRender } from "../core/scheduler.js";
import type { Dispatch, SetStateAction } from "../types.js";
import { useCallback } from "./use-memo.js";
import { useRef } from "./use-ref.js";

interface StateHook<S> {
  value: S;
  setValue: Dispatch<SetStateAction<S>>;
}

export const useState = <S>(
  initialState: S | (() => S),
): [S, Dispatch<SetStateAction<S>>] => {
  const hook = useHook((component) => createStateHook(component, initialState));
  return [hook.value, hook.setValue];
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

  const dispatch = useCallback(
    (action: A) =>
      setState((previous) => latestReducer.current(previous, action)),
    [],
  );
  return [state, dispatch];
}

const createStateHook = <S>(
  component: Instance,
  initialState: S | (() => S),
): StateHook<S> => {
  const hook: StateHook<S> = {
    value:
      typeof initialState === "function"
        ? (initialState as () => S)()
        : initialState,
    setValue: (action) => {
      const next =
        typeof action === "function"
          ? (action as (previous: S) => S)(hook.value)
          : action;
      if (Object.is(next, hook.value)) return;
      hook.value = next;
      scheduleRender(component);
    },
  };
  return hook;
};
