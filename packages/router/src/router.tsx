import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type Child,
  type Component,
} from "@koniwa/core";
import { historyFor, type RouterHistory, type RouterMode } from "./history.js";
import {
  compileRoutes,
  matchRoute,
  splitLocation,
  type Params,
} from "./match.js";

export type Page = Component<{ params: Params }>;

export interface RouterProps {
  routes: Record<string, Page>;
  mode?: RouterMode;
}

export interface NavigateOptions {
  replace?: boolean;
}

export interface LinkProps {
  to: string;
  replace?: boolean;
  target?: string;
  onClick?: (event: MouseEvent) => void;
  children?: Child;
  [attribute: string]: unknown;
}

interface RouterState {
  history: RouterHistory;
  location: string;
  params: Params;
}

const RouterContext = createContext<RouterState | null>(null);

const NotFound: Page = () => <p>Not found</p>;

export const Router = ({ routes, mode = "path" }: RouterProps) => {
  const history = historyFor(mode);
  const compiled = useMemo(() => compileRoutes(routes), [routes]);
  const location = useSyncExternalStore(history.subscribe, history.read);

  const match = matchRoute(compiled, splitLocation(location).pathname);
  const CurrentPage = match?.page ?? routes["*"] ?? NotFound;
  const params = match?.params ?? {};

  return (
    <RouterContext.Provider value={{ history, location, params }}>
      <CurrentPage params={params} />
    </RouterContext.Provider>
  );
};

export const Link = ({
  to,
  replace,
  onClick,
  children,
  ...attributes
}: LinkProps) => {
  const { history } = useRouter();
  const navigate = useNavigate();

  const handleClick = (event: MouseEvent) => {
    onClick?.(event);
    if (shouldLetBrowserHandle(event, attributes.target)) return;
    event.preventDefault();
    navigate(to, { replace });
  };

  return (
    <a {...attributes} href={history.href(to)} onClick={handleClick}>
      {children}
    </a>
  );
};

export const useNavigate = () => {
  const { history } = useRouter();

  return useCallback(
    (to: string | number, { replace = false }: NavigateOptions = {}) => {
      if (typeof to === "number") {
        window.history.go(to);
      } else if (replace) {
        history.replace(to);
      } else {
        history.push(to);
        window.scrollTo(0, 0);
      }
    },
    [history],
  );
};

export const useParams = <P extends Params = Params>(): P =>
  useRouter().params as P;

export const useLocation = (): { pathname: string; search: string } =>
  splitLocation(useRouter().location);

const useRouter = (): RouterState => {
  const router = useContext(RouterContext);
  if (!router) {
    throw new Error("Router hooks and <Link> must be used inside <Router>.");
  }
  return router;
};

const shouldLetBrowserHandle = (event: MouseEvent, target: unknown) =>
  event.defaultPrevented ||
  event.button !== 0 ||
  event.metaKey ||
  event.ctrlKey ||
  event.shiftKey ||
  event.altKey ||
  (target !== undefined && target !== "_self");
