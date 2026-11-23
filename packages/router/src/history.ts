export type RouterMode = "path" | "hash";

export interface RouterHistory {
  read: () => string;
  href: (to: string) => string;
  push: (to: string) => void;
  replace: (to: string) => void;
  subscribe: (onChange: () => void) => () => void;
}

const listeners = new Set<() => void>();

const notifyListeners = () => listeners.forEach((listener) => listener());

const listenTo =
  (browserEvent: "popstate" | "hashchange") => (onChange: () => void) => {
    listeners.add(onChange);
    window.addEventListener(browserEvent, onChange);
    return () => {
      listeners.delete(onChange);
      window.removeEventListener(browserEvent, onChange);
    };
  };

const pathHistory: RouterHistory = {
  read: () => location.pathname + location.search,
  href: (to) => to,
  push: (to) => {
    window.history.pushState(null, "", to);
    notifyListeners();
  },
  replace: (to) => {
    window.history.replaceState(null, "", to);
    notifyListeners();
  },
  subscribe: listenTo("popstate"),
};

const hashHistory: RouterHistory = {
  read: () => location.hash.slice(1) || "/",
  href: (to) => `#${to}`,
  push: (to) => {
    window.history.pushState(null, "", `#${to}`);
    notifyListeners();
  },
  replace: (to) => {
    window.history.replaceState(null, "", `#${to}`);
    notifyListeners();
  },
  subscribe: listenTo("hashchange"),
};

export const historyFor = (mode: RouterMode): RouterHistory =>
  mode === "hash" ? hashHistory : pathHistory;
