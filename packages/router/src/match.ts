export type Params = Record<string, string>;

interface CompiledRoute<P> {
  pattern: RegExp;
  paramNames: string[];
  page: P;
}

export const compileRoutes = <P>(
  routes: Record<string, P>,
): CompiledRoute<P>[] =>
  Object.entries(routes)
    .filter(([path]) => path !== "*")
    .map(([path, page]) => ({
      pattern: new RegExp(`^${path.replace(/:\w+/g, "([^/]+)")}/?$`),
      paramNames: [...path.matchAll(/:(\w+)/g)].map(([, name]) => name),
      page,
    }));

export const matchRoute = <P>(
  routes: CompiledRoute<P>[],
  pathname: string,
): { page: P; params: Params } | null => {
  for (const route of routes) {
    const match = route.pattern.exec(pathname);
    if (!match) continue;

    const values = match.slice(1).map(decodeURIComponent);
    const params = Object.fromEntries(
      route.paramNames.map((name, i) => [name, values[i]]),
    );
    return { page: route.page, params };
  }
  return null;
};

export const splitLocation = (
  location: string,
): { pathname: string; search: string } => {
  const queryStart = location.indexOf("?");
  return queryStart === -1
    ? { pathname: location, search: "" }
    : {
        pathname: location.slice(0, queryStart),
        search: location.slice(queryStart),
      };
};
