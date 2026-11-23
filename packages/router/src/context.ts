import { createContext, useContext } from "@koniwa/core";
import type { Params } from "./match.js";
import type { RouterMode } from "./url.js";

interface RouterState {
  mode: RouterMode;
  route: string;
  params: Params;
}

export const RouterContext = createContext<RouterState | null>(null);

export const useRouter = (): RouterState => {
  const router = useContext(RouterContext);
  if (!router) {
    throw new Error("Router hooks and <Link> must be used inside <Router>.");
  }
  return router;
};
