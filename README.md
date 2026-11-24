<p align="center">
  <img src="assets/logo.svg" width="112" alt="koniwa logo: a bonsai tree in a small pot">
</p>

<h1 align="center">koniwa 小庭</h1>

<p align="center">A tiny JSX toolkit for small static sites: real DOM, React-style hooks, no dependencies.</p>

koniwa is for sites of about ten pages or fewer, such as school projects, GitHub pages,
portfolios and CVs, where you want to write markup as components and add a bit of
interactivity, but don't need React. If you know React, you already know most of it.

## Packages

| Package                             | What it does                                                        | Docs                                |
| ----------------------------------- | ------------------------------------------------------------------- | ----------------------------------- |
| [`@koniwa/core`](packages/core)     | JSX renderer and hooks (`useState`, `useEffect`, `useContext`, …)   | [README](packages/core/README.md)   |
| [`@koniwa/router`](packages/router) | Small router: path or hash URLs, `:params`, `<Link>`, `useNavigate` | [README](packages/router/README.md) |

## Quick start

```bash
npm install @koniwa/core @koniwa/router
```

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@koniwa/core",
  },
}
```

```tsx
import { mount, useState } from "@koniwa/core";
import { Link, Router, type Page } from "@koniwa/router";

const Home: Page = () => {
  const [likes, setLikes] = useState(0);
  return (
    <main>
      <button onClick={() => setLikes(likes + 1)}>♥ {likes}</button>
      <Link to="/about">About</Link>
    </main>
  );
};

const About: Page = () => <h1>About</h1>;

mount(
  <Router routes={{ "/": Home, "/about": About }} />,
  document.getElementById("root")!,
);
```

## The name

_Koniwa_ (小庭) means "small garden": the little garden inside a traditional Japanese
house, the part guests actually see. A small garden is small but curated, and every stone,
plant and lantern has its place. That is the idea here: a handful of pages built from
components and laid out with care.

Koniwa is one part of a bigger house:

- [**watari**](https://github.com/machiyajs/watari) (渡り), from _watari-rōka_, the covered
  corridor that connects the rooms. It fetches data and carries it where it is needed.
- **jubako** (重箱), the stacked lunch boxes kept in the kitchen. It stores things in layers.
- **koniwa** (小庭), the garden. It puts everything on display.

_Jubako keeps things, watari carries them, koniwa shows them._

## Development

This repository is a Yarn workspace with one folder per package under `packages/`.
[docs/architecture.md](docs/architecture.md) walks through how the renderer and hooks work,
file by file.

```bash
yarn install
yarn test        # Vitest + happy-dom, all packages
yarn typecheck
yarn build       # builds every package into packages/*/dist
```

To publish a package, run `npm publish --access public` from its folder
(`packages/core` or `packages/router`).

On Windows, run the tests from a path with an uppercase drive letter (`C:\...`). VS Code
terminals can start in `c:\...`, which makes Vitest load itself twice and fail with
`Cannot read properties of undefined (reading 'config')`.

## License

[MIT](LICENSE)
