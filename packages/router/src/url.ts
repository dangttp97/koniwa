export type RouterMode = "path" | "hash";

const NAVIGATE_EVENT = "koniwa:navigate";

const ROUTE_CHANGE_EVENTS = ["popstate", "hashchange", NAVIGATE_EVENT];

export const readRoute = (mode: RouterMode): string =>
  mode === "hash"
    ? location.hash.slice(1) || "/"
    : location.pathname + location.search;

export const hrefFor = (mode: RouterMode, route: string): string =>
  mode === "hash" ? `#${route}` : route;

export const changeRoute = (
  mode: RouterMode,
  route: string,
  { replace = false } = {},
): void => {
  const url = hrefFor(mode, route);
  if (replace) history.replaceState(null, "", url);
  else history.pushState(null, "", url);

  window.dispatchEvent(new Event(NAVIGATE_EVENT));
};

export const listenForRouteChanges = (onChange: () => void) => {
  for (const event of ROUTE_CHANGE_EVENTS) {
    window.addEventListener(event, onChange);
  }
  return () => {
    for (const event of ROUTE_CHANGE_EVENTS) {
      window.removeEventListener(event, onChange);
    }
  };
};

export const splitRoute = (
  route: string,
): { pathname: string; search: string } => {
  const queryStart = route.indexOf("?");
  if (queryStart === -1) return { pathname: route, search: "" };
  return {
    pathname: route.slice(0, queryStart),
    search: route.slice(queryStart),
  };
};
