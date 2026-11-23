import { useLayoutEffect } from "./use-effect.js";
import { useRef } from "./use-ref.js";
import { useState } from "./use-state.js";

export const useSyncExternalStore = <T>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => T,
  _getServerSnapshot?: () => T,
): T => {
  const snapshot = getSnapshot();
  const [, setVersion] = useState(0);
  const latest = useRef({ snapshot, getSnapshot });
  latest.current = { snapshot, getSnapshot };

  useLayoutEffect(() => {
    const rerenderIfChanged = () => {
      const { snapshot, getSnapshot } = latest.current;
      if (!Object.is(snapshot, getSnapshot())) setVersion((v) => v + 1);
    };
    rerenderIfChanged();
    return subscribe(rerenderIfChanged);
  }, [subscribe]);

  return snapshot;
};
