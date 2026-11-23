<p align="center">
  <img src="https://raw.githubusercontent.com/dangttp97/koniwa/main/assets/logo.svg" width="96" alt="koniwa logo: a bonsai tree in a small pot">
</p>

<h1 align="center">@koniwa/router</h1>

<p align="center">A small router for <a href="https://github.com/dangttp97/koniwa">koniwa 小庭</a> sites: path or hash URLs, route params, links and navigation hooks.</p>

Made for sites of a handful of pages. It switches pages without reloading, reads `:params`
from the URL, and gives you `<Link>` and a few hooks. It is not a full SPA framework: no
nested layouts, data loaders or lazy routes.

## Install

```bash
npm install @koniwa/core @koniwa/router
```

## Usage

```tsx
import { mount } from "@koniwa/core";
import { Link, Router, useNavigate, type Page } from "@koniwa/router";

const Home: Page = () => (
  <main>
    <h1>Home</h1>
    <Link to="/products/42">See product 42</Link>
  </main>
);

const Product: Page = ({ params }) => {
  const navigate = useNavigate();
  return (
    <main>
      <h1>Product {params.id}</h1>
      <button onClick={() => navigate(-1)}>Back</button>
    </main>
  );
};

const NotFound: Page = () => <h1>Page not found</h1>;

const routes = {
  "/": Home,
  "/products/:id": Product,
  "*": NotFound,
};

mount(<Router routes={routes} />, document.getElementById("root")!);
```

## Path or hash URLs

| Mode               | URL looks like   | Use it when                                                                                       |
| ------------------ | ---------------- | ------------------------------------------------------------------------------------------------- |
| `"path"` (default) | `/products/42`   | Your server returns `index.html` for every path (Vite dev server, Netlify, Vercel with a rewrite) |
| `"hash"`           | `/#/products/42` | You cannot configure the server, for example on GitHub Pages                                      |

```tsx
<Router routes={routes} mode="hash" />
```

In path mode on a plain static host, opening `/products/42` directly returns the host's 404
page, because there is no `products/42` file. Hash mode avoids that: the browser only ever
asks for `/`.

## API

| Export                   | Description                                                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `<Router routes mode?>`  | Renders the page whose pattern matches the URL. `routes` maps patterns (`"/products/:id"`) to pages; `"*"` is the fallback.                            |
| `<Link to replace? ...>` | An `<a>` that changes the page without reloading. Ctrl/Cmd-click, middle-click and `target="_blank"` still work as usual. Other props go to the `<a>`. |
| `useNavigate()`          | Returns `navigate(to, { replace? })`. `navigate(-1)` goes back one page. Pushing a new page scrolls to the top.                                        |
| `useParams()`            | The params of the current route, such as `{ id: "42" }`. Pages also receive them as the `params` prop.                                                 |
| `useLocation()`          | `{ pathname, search }` of the current URL.                                                                                                             |

Types: `Page`, `Params`, `RouterProps`, `LinkProps`, `NavigateOptions`, `RouterMode`.

Patterns match the whole path. A trailing slash is allowed (`/about/` matches `"/about"`),
and params are decoded (`/tags/caf%C3%A9` gives `{ tag: "café" }`).

When only the params change (`/products/1` to `/products/2`), the same page component stays
mounted and keeps its state, like React Router. Use the param as a `useEffect` dependency
to reload data.

## How it works

The whole router is a few small files in `src/`:

| File         | What it does                                                                   |
| ------------ | ------------------------------------------------------------------------------ |
| `url.ts`     | Reads the current route from the URL, changes the URL, and listens for changes |
| `match.ts`   | Finds the page for a path, and its params                                      |
| `router.tsx` | `<Router>`: reads the route, finds the page, renders it                        |
| `context.ts` | Shares the mode, route and params with everything inside `<Router>`            |
| `link.tsx`   | `<Link>`: an `<a>` that calls `navigate` on a plain left click                 |
| `hooks.ts`   | `useNavigate`, `useParams`, `useLocation`                                      |

**Reading the URL.** In path mode the route is `location.pathname + location.search`
(`/products/42?tab=info`). In hash mode it is everything after `#` (`/#/products/42` gives
`/products/42`).

**Matching.** Both the pattern and the path are split on `/` and compared part by part.
A part that starts with `:` matches anything and is saved as a param:

```
pattern  "/products/:id"  →  ["products", ":id"]
path     "/products/42"   →  ["products", "42"]     →  { id: "42" }
```

Patterns are tried in the order you wrote them; `"*"` is used when none match.

**Navigating.** `navigate("/about")` calls `history.pushState`, which changes the URL without
loading a new page. The browser does not announce `pushState`, so the router fires its own
`koniwa:navigate` event. `<Router>` listens for that event, plus `popstate` (back and
forward buttons) and `hashchange`, and re-reads the URL through `useSyncExternalStore`
whenever one of them fires.

## License

[MIT](LICENSE)
