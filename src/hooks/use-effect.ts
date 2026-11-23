import { useHook } from "../core/current-component.js";
import type { Instance } from "../core/instance.js";
import type { DependencyList, EffectCallback } from "../types.js";
import { depsChanged } from "./deps.js";

interface EffectHook {
  component: Instance;
  deps?: DependencyList;
  cleanup?: () => void;
}

export const useEffect = (
  effect: EffectCallback,
  deps?: DependencyList,
): void => useEffectOfKind("normal", effect, deps);

export const useLayoutEffect = (
  effect: EffectCallback,
  deps?: DependencyList,
): void => useEffectOfKind("layout", effect, deps);

const useEffectOfKind = (
  kind: "layout" | "normal",
  effect: EffectCallback,
  deps: DependencyList | undefined,
): void => {
  const hook = useHook<EffectHook>((component) => ({ component }));
  if (!depsChanged(hook.deps, deps)) return;

  hook.deps = deps;
  hook.component.pendingEffects[kind].push(() => runEffect(hook, effect));
};

const runEffect = (hook: EffectHook, effect: EffectCallback): void => {
  if (hook.component.unmounted) return;
  hook.cleanup?.();
  const cleanup = effect();
  hook.cleanup = typeof cleanup === "function" ? cleanup : undefined;
};
