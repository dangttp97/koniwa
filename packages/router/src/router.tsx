import { useSyncExternalStore, type Component } from "@koniwa/core";
import { RouterContext } from "./context.js";
import { findPage, type Params } from "./match.js";
import {
  listenForRouteChanges,
  readRoute,
  splitRoute,
  type RouterMode,
} from "./url.js";

export type Page = Component<{ params: Params }>;

export interface RouterProps {
  routes: Record<string, Page>;
  mode?: RouterMode;
}

const NotFound: Page = () => <p>Not found</p>;

export const Router = ({ routes, mode = "path" }: RouterProps) => {
  const route = useSyncExternalStore(listenForRouteChanges, () =>
    readRoute(mode),
  );
  const { page, params } = findPage(routes, splitRoute(route).pathname);
  const CurrentPage = page ?? NotFound;

  return (
    <RouterContext.Provider value={{ mode, route, params }}>
      <CurrentPage params={params} />
    </RouterContext.Provider>
  );
};
