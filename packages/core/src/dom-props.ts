import type { JSX } from "./jsx.js";
import type { ReactNode, FunctionComponent, Ref } from "./types.js";

interface EventNames {
  onAbort: "abort";
  onAnimationCancel: "animationcancel";
  onAnimationEnd: "animationend";
  onAnimationIteration: "animationiteration";
  onAnimationStart: "animationstart";
  onAuxClick: "auxclick";
  onBeforeInput: "beforeinput";
  onBlur: "blur";
  onCancel: "cancel";
  onCanPlay: "canplay";
  onCanPlayThrough: "canplaythrough";
  onChange: "change";
  onClick: "click";
  onClose: "close";
  onCompositionEnd: "compositionend";
  onCompositionStart: "compositionstart";
  onCompositionUpdate: "compositionupdate";
  onContextMenu: "contextmenu";
  onCopy: "copy";
  onCut: "cut";
  onDoubleClick: "dblclick";
  onDrag: "drag";
  onDragEnd: "dragend";
  onDragEnter: "dragenter";
  onDragLeave: "dragleave";
  onDragOver: "dragover";
  onDragStart: "dragstart";
  onDrop: "drop";
  onDurationChange: "durationchange";
  onEmptied: "emptied";
  onEnded: "ended";
  onError: "error";
  onFocus: "focus";
  onFocusIn: "focusin";
  onFocusOut: "focusout";
  onFormData: "formdata";
  onGotPointerCapture: "gotpointercapture";
  onInput: "input";
  onInvalid: "invalid";
  onKeyDown: "keydown";
  onKeyUp: "keyup";
  onLoad: "load";
  onLoadedData: "loadeddata";
  onLoadedMetadata: "loadedmetadata";
  onLoadStart: "loadstart";
  onLostPointerCapture: "lostpointercapture";
  onMouseDown: "mousedown";
  onMouseEnter: "mouseenter";
  onMouseLeave: "mouseleave";
  onMouseMove: "mousemove";
  onMouseOut: "mouseout";
  onMouseOver: "mouseover";
  onMouseUp: "mouseup";
  onPaste: "paste";
  onPause: "pause";
  onPlay: "play";
  onPlaying: "playing";
  onPointerCancel: "pointercancel";
  onPointerDown: "pointerdown";
  onPointerEnter: "pointerenter";
  onPointerLeave: "pointerleave";
  onPointerMove: "pointermove";
  onPointerOut: "pointerout";
  onPointerOver: "pointerover";
  onPointerUp: "pointerup";
  onProgress: "progress";
  onRateChange: "ratechange";
  onReset: "reset";
  onResize: "resize";
  onScroll: "scroll";
  onScrollEnd: "scrollend";
  onSeeked: "seeked";
  onSeeking: "seeking";
  onSelect: "select";
  onSelectionChange: "selectionchange";
  onSelectStart: "selectstart";
  onStalled: "stalled";
  onSubmit: "submit";
  onSuspend: "suspend";
  onTimeUpdate: "timeupdate";
  onToggle: "toggle";
  onTouchCancel: "touchcancel";
  onTouchEnd: "touchend";
  onTouchMove: "touchmove";
  onTouchStart: "touchstart";
  onTransitionCancel: "transitioncancel";
  onTransitionEnd: "transitionend";
  onTransitionRun: "transitionrun";
  onTransitionStart: "transitionstart";
  onVolumeChange: "volumechange";
  onWaiting: "waiting";
  onWheel: "wheel";
}

export type EventHandler<E extends Event, T = Element> = (
  event: E & { currentTarget: T },
) => void;

export type MouseEventHandler<T = Element> = EventHandler<MouseEvent, T>;
export type PointerEventHandler<T = Element> = EventHandler<PointerEvent, T>;
export type KeyboardEventHandler<T = Element> = EventHandler<KeyboardEvent, T>;
export type FocusEventHandler<T = Element> = EventHandler<FocusEvent, T>;
export type FormEventHandler<T = Element> = EventHandler<Event, T>;
export type ChangeEventHandler<T = Element> = EventHandler<Event, T>;
export type DragEventHandler<T = Element> = EventHandler<DragEvent, T>;
export type TouchEventHandler<T = Element> = EventHandler<TouchEvent, T>;
export type WheelEventHandler<T = Element> = EventHandler<WheelEvent, T>;
export type ClipboardEventHandler<T = Element> = EventHandler<
  ClipboardEvent,
  T
>;

export type DOMAttributes<T extends Element> = {
  [Prop in keyof EventNames]?: EventHandler<
    GlobalEventHandlersEventMap[EventNames[Prop]],
    T
  >;
};

export type CSSProperties = {
  [
    Key in keyof CSSStyleDeclaration as Key extends string
      ? CSSStyleDeclaration[Key] extends string
        ? Key
        : never
      : never
  ]?: string | number;
};

type DataAndAriaProps = {
  [data: `data-${string}`]: string | number | boolean | null | undefined;
  [aria: `aria-${string}`]: string | number | boolean | null | undefined;
};

type CommonProps<T extends Element> = DataAndAriaProps & {
  key?: string | number;
  ref?: Ref<T>;
  children?: ReactNode;
  class?: string;
  style?: string | CSSProperties;
};

type IfEquals<X, Y, Then, Else> =
  (<V>() => V extends X ? 1 : 2) extends <V>() => V extends Y ? 1 : 2
    ? Then
    : Else;

type WritableKeys<T> = {
  [Key in keyof T]-?: IfEquals<
    { [Q in Key]: T[Key] },
    { -readonly [Q in Key]: T[Key] },
    Key,
    never
  >;
}[keyof T];

type NotSetFromJsx =
  | "innerHTML"
  | "outerHTML"
  | "innerText"
  | "outerText"
  | "textContent"
  | "nodeValue"
  | "defaultValue"
  | "defaultChecked"
  | "style"
  | `aria${string}`
  | `on${string}`;

type PropertyProps<T extends Element> = {
  [
    Key in Exclude<WritableKeys<T>, NotSetFromJsx> as T[Key] extends
      string | number | boolean | null
      ? Key
      : never
  ]?: T[Key] extends string | number ? string | number : T[Key];
};

export type HTMLAttributes<T extends HTMLElement = HTMLElement> =
  PropertyProps<T> & DOMAttributes<T> & CommonProps<T>;

export type SVGProps<T extends SVGElement> = DOMAttributes<T> &
  CommonProps<T> & {
    className?: string;
    [attribute: string]: unknown;
  };

export type ComponentProps<T> = T extends keyof JSX.IntrinsicElements
  ? JSX.IntrinsicElements[T]
  : T extends FunctionComponent<infer P>
    ? P
    : never;

export type ComponentPropsWithRef<T> = ComponentProps<T>;

export type ComponentPropsWithoutRef<T> = Omit<ComponentProps<T>, "ref">;

export type PropsWithChildren<P = unknown> = P & { children?: ReactNode };
