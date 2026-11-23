export type Params = Record<string, string>;

export const findPage = <P>(
  routes: Record<string, P>,
  pathname: string,
): { page: P | undefined; params: Params } => {
  for (const [pattern, page] of Object.entries(routes)) {
    if (pattern === "*") continue;
    const params = matchPath(pattern, pathname);
    if (params) return { page, params };
  }
  return { page: routes["*"], params: {} };
};

export const matchPath = (pattern: string, pathname: string): Params | null => {
  const patternParts = splitPath(pattern);
  const pathParts = splitPath(pathname);
  if (patternParts.length !== pathParts.length) return null;

  const params: Params = {};
  for (const [i, part] of patternParts.entries()) {
    if (part.startsWith(":")) {
      params[part.slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (part !== pathParts[i]) {
      return null;
    }
  }
  return params;
};

const splitPath = (path: string): string[] =>
  path.split("/").filter((part) => part !== "");
