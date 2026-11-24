<p align="center">
  <img src="https://raw.githubusercontent.com/machiyajs/koniwa/main/assets/logo.svg" width="96" alt="koniwa logo: a bonsai tree in a small pot">
</p>

<h1 align="center">@koniwa/router</h1>

<p align="center">A small router for <a href="https://github.com/machiyajs/koniwa">koniwa 小庭</a> sites: path or hash URLs, route params, links and navigation hooks.</p>

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

## License

[MIT](LICENSE)
