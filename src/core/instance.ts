import type { Child, VirtualNode } from "../types.js";

export type RenderItem = VirtualNode | string | null;

export type ElementItem = VirtualNode & { type: string };

export type Effect = () => void;

export interface Instance {
  item: RenderItem;
  parent: Instance | null;
  parentDom: Node;
  insideSvg: boolean;
  domNode: Node | null;
  children: Instance[];
  hooks: unknown[];
  pendingEffects: { layout: Effect[]; normal: Effect[] };
  needsRender: boolean;
  unmounted: boolean;
}

export const createInstance = (
  item: RenderItem,
  parent: Instance | null,
  parentDom: Node,
  insideSvg: boolean,
): Instance => ({
  item,
  parent,
  parentDom,
  insideSvg,
  domNode: null,
  children: [],
  hooks: [],
  pendingEffects: { layout: [], normal: [] },
  needsRender: false,
  unmounted: false,
});

export const toRenderItems = (child: Child): RenderItem[] => {
  if (Array.isArray(child)) return child.flatMap(toRenderItems);
  if (child == null || typeof child === "boolean") return [null];
  if (typeof child === "object") return [child];
  return [String(child)];
};

export const isElementItem = (item: RenderItem): item is ElementItem =>
  typeof item === "object" && item !== null && typeof item.type === "string";

export const keyOf = (item: RenderItem): unknown =>
  typeof item === "object" && item !== null ? item.props.key : undefined;

export const canReuse = (old: RenderItem, item: RenderItem): boolean => {
  if (old === null || item === null) return old === item;
  if (typeof old === "string" || typeof item === "string") {
    return typeof old === typeof item;
  }
  return old.type === item.type && old.props.key === item.props.key;
};

export const childrenInsideSvg = (instance: Instance): boolean => {
  if (!isElementItem(instance.item)) return instance.insideSvg;
  const tag = instance.item.type;
  return (instance.insideSvg || tag === "svg") && tag !== "foreignObject";
};
