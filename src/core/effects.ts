import type { Effect, Instance } from "./instance.js";

let queued: { layout: Effect[]; normal: Effect[] } = { layout: [], normal: [] };

export const queueEffectsOf = (component: Instance): void => {
  queued.layout.push(...component.pendingEffects.layout);
  queued.normal.push(...component.pendingEffects.normal);
  component.pendingEffects = { layout: [], normal: [] };
};

export const runQueuedEffects = (): void => {
  const { layout, normal } = queued;
  queued = { layout: [], normal: [] };
  layout.forEach((run) => run());
  normal.forEach((run) => run());
};
