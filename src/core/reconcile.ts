import type { Child, Props, Ref } from "../types.js";
import { callComponent } from "./current-component.js";
import { createDomElement, updateProps } from "./dom.js";
import {
  canReuse,
  childrenInsideSvg,
  createInstance,
  isElementItem,
  keyOf,
  toRenderItems,
  type ElementItem,
  type Instance,
  type RenderItem,
} from "./instance.js";
import { domNodesOf, nextDomSibling, placeDomNodes } from "./placement.js";
import { setRef } from "./refs.js";

let queuedEffects: Array<() => void> = [];

export const createRoot = (container: Node): Instance =>
  createInstance(null, null, container, false);

export const renderRoot = (root: Instance, child: Child): void => {
  root.children = reconcileChildren(root, toRenderItems(child));
  placeDomNodes(root.parentDom, root.children, null);
  runQueuedEffects();
};

export const rerenderComponent = (instance: Instance): void => {
  const before =
    nextDomSibling(instance) ?? domNodesOf(instance).at(-1)?.nextSibling;
  renderComponent(instance);
  placeDomNodes(instance.parentDom, [instance], before ?? null);
};

export const runQueuedEffects = (): void => {
  const effects = queuedEffects;
  queuedEffects = [];
  effects.forEach((run) => run());
};

export const unmount = (instance: Instance): void => {
  instance.unmounted = true;
  instance.children.forEach(unmount);
  for (const hook of instance.hooks as Array<{ cleanup?: () => void }>) {
    hook.cleanup?.();
  }
  if (isElementItem(instance.item)) {
    setRef(instance.item.props.ref as Ref<Element>, null);
  }
};

const reconcileChildren = (
  parent: Instance,
  items: RenderItem[],
): Instance[] => {
  const oldChildren = parent.children;
  const oldByKey = new Map<unknown, Instance>();
  for (const old of oldChildren) {
    const key = keyOf(old.item);
    if (key != null) oldByKey.set(key, old);
  }

  const reused = new Set<Instance>();
  const children = items.map((item, index) => {
    const key = keyOf(item);
    const old = key != null ? oldByKey.get(key) : oldChildren[index];
    if (old && !reused.has(old) && canReuse(old.item, item)) {
      reused.add(old);
      updateChild(old, item);
      return old;
    }
    return mountChild(item, parent);
  });

  for (const old of oldChildren) {
    if (!reused.has(old)) removeChild(old);
  }
  return children;
};

const mountChild = (item: RenderItem, parent: Instance): Instance => {
  const instance = createInstance(
    item,
    parent,
    parent.domNode ?? parent.parentDom,
    childrenInsideSvg(parent),
  );

  if (typeof item === "string") {
    instance.domNode = document.createTextNode(item);
  } else if (isElementItem(item)) {
    const isSvg = instance.insideSvg || item.type === "svg";
    instance.domNode = createDomElement(item.type, isSvg);
    renderElement(instance, {});
  } else if (item) {
    renderComponent(instance);
  }
  return instance;
};

const updateChild = (instance: Instance, item: RenderItem): void => {
  const old = instance.item;
  instance.item = item;

  if (typeof item === "string") {
    if (item !== old) (instance.domNode as Text).data = item;
  } else if (isElementItem(item)) {
    renderElement(instance, (old as ElementItem).props);
  } else if (item) {
    renderComponent(instance);
  }
};

const removeChild = (instance: Instance): void => {
  for (const node of domNodesOf(instance)) (node as ChildNode).remove();
  unmount(instance);
};

const renderElement = (instance: Instance, oldProps: Props): void => {
  const { props, children } = instance.item as ElementItem;
  const element = instance.domNode as Element;

  instance.children = reconcileChildren(instance, toRenderItems(children));
  placeDomNodes(element, instance.children, null);
  updateProps(element, oldProps, props);

  if (oldProps.ref !== props.ref) {
    setRef(oldProps.ref as Ref<Element>, null);
    setRef(props.ref as Ref<Element>, element);
  }
};

const renderComponent = (instance: Instance): void => {
  instance.needsRender = false;
  const output = callComponent(instance);
  instance.children = reconcileChildren(instance, toRenderItems(output));

  queuedEffects.push(...instance.pendingEffects);
  instance.pendingEffects = [];
};
