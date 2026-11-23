import type { Instance } from "./instance.js";
import { rerenderComponent, runQueuedEffects } from "./reconcile.js";

const MAX_RENDERS_PER_FLUSH = 1000;

const waiting = new Set<Instance>();
let flushScheduled = false;

export const scheduleRender = (instance: Instance): void => {
  if (instance.unmounted) return;
  instance.needsRender = true;
  waiting.add(instance);

  if (!flushScheduled) {
    flushScheduled = true;
    queueMicrotask(flush);
  }
};

const flush = () => {
  flushScheduled = false;

  for (let renders = 0; waiting.size > 0; renders++) {
    if (renders === MAX_RENDERS_PER_FLUSH) {
      waiting.clear();
      throw new Error(
        "Too many re-renders. A component keeps setting state while rendering.",
      );
    }
    const instance = takeShallowest(waiting);
    if (instance.needsRender && !instance.unmounted) {
      rerenderComponent(instance);
    }
  }
  runQueuedEffects();
};

const takeShallowest = (instances: Set<Instance>): Instance => {
  const shallowest = [...instances].reduce((a, b) =>
    depthOf(b) < depthOf(a) ? b : a,
  );
  instances.delete(shallowest);
  return shallowest;
};

const depthOf = (instance: Instance): number => {
  let depth = 0;
  for (let p = instance.parent; p; p = p.parent) depth++;
  return depth;
};
