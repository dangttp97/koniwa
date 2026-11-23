import type { DependencyList } from "../types.js";

export const depsChanged = (
  previous: DependencyList | undefined,
  next: DependencyList | undefined,
): boolean =>
  !previous ||
  !next ||
  previous.length !== next.length ||
  previous.some((dep, i) => !Object.is(dep, next[i]));
