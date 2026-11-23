import type { Child } from "@koniwa/core";
import { useRouter } from "./context.js";
import { useNavigate } from "./hooks.js";
import { hrefFor } from "./url.js";

export interface LinkProps {
  to: string;
  replace?: boolean;
  target?: string;
  onClick?: (event: MouseEvent) => void;
  children?: Child;
  [attribute: string]: unknown;
}

export const Link = ({
  to,
  replace,
  onClick,
  children,
  ...attributes
}: LinkProps) => {
  const { mode } = useRouter();
  const navigate = useNavigate();

  const handleClick = (event: MouseEvent) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (!isPlainLeftClick(event) || opensNewWindow(attributes.target)) return;

    event.preventDefault();
    navigate(to, { replace });
  };

  return (
    <a {...attributes} href={hrefFor(mode, to)} onClick={handleClick}>
      {children}
    </a>
  );
};

const isPlainLeftClick = (event: MouseEvent): boolean =>
  event.button === 0 &&
  !event.metaKey &&
  !event.ctrlKey &&
  !event.shiftKey &&
  !event.altKey;

const opensNewWindow = (target: unknown): boolean =>
  target !== undefined && target !== "_self";
