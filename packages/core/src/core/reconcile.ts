import type { ReactNode, Props, Ref } from "../types.js";
import { callComponent } from "./current-component.js";
import { createDomElement, updateProps } from "./dom.js";
import { queueEffectsOf, runQueuedEffects } from "./effects.js";
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

export const createRoot = (container: Node): Instance =>
  createInstance(null, null, container, false);

export const renderRoot = (root: Instance, child: ReactNode): void => {
  root.children = reconcileChildren(root, toRenderItems(child));
  placeDomNodes(root.parentDom, root.children, null);
  runQueuedEffects();
};

export const rerenderComponent = (component: Instance): void => {
  const before =
    nextDomSibling(component) ?? domNodesOf(component).at(-1)?.nextSibling;
  renderComponent(component);
  placeDomNodes(component.parentDom, [component], before ?? null);
};

export const unmount = (instance: Instance): void => {
  instance.unmounted = true;
  instance.children.forEach(unmount);
  runHookCleanups(instance);
  if (isElementItem(instance.item)) {
    setRef(instance.item.props.ref as Ref<Element>, null);
  }
};

const reconcileChildren = (
  parent: Instance,
  items: RenderItem[],
): Instance[] => {
  const findReusable = createMatcher(parent.children);

  const children = items.map((item, index) => {
    const old = findReusable(item, index);
    if (!old) return mountChild(item, parent);
    updateChild(old, item);
    return old;
  });

  const kept = new Set(children);
  for (const old of parent.children) {
    if (!kept.has(old)) removeChild(old);
  }
  return children;
};

const createMatcher = (oldChildren: Instance[]) => {
  const oldByKey = new Map<unknown, Instance>();
  for (const old of oldChildren) {
    const key = keyOf(old.item);
    if (key != null) oldByKey.set(key, old);
  }
  const taken = new Set<Instance>();

  return (item: RenderItem, index: number): Instance | undefined => {
    const key = keyOf(item);
    const old = key != null ? oldByKey.get(key) : oldChildren[index];
    if (!old || taken.has(old) || !canReuse(old.item, item)) return undefined;
    taken.add(old);
    return old;
  };
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

const renderComponent = (component: Instance): void => {
  component.needsRender = false;
  const output = callComponent(component);
  component.children = reconcileChildren(component, toRenderItems(output));
  queueEffectsOf(component);
};

const runHookCleanups = (instance: Instance): void => {
  for (const hook of instance.hooks as Array<{ cleanup?: () => void }>) {
    hook?.cleanup?.();
  }
};
