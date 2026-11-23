import { mount, useState } from "@koniwa/core";
import {
  Link,
  Router,
  useLocation,
  useNavigate,
  useParams,
  type Page,
} from "@koniwa/router";
import { beforeEach, describe, expect, it } from "vitest";

const nextUpdate = () => new Promise((resolve) => setTimeout(resolve, 0));

const Home: Page = () => (
  <main>
    <h1>Home</h1>
    <Link to="/products/42">Product</Link>
  </main>
);
const Product: Page = ({ params }) => <h1>Product {params.id}</h1>;
const routes = { "/": Home, "/products/:id": Product };

const mountRouter = (child: Parameters<typeof mount>[0]) => {
  const root = document.createElement("div");
  document.body.replaceChildren(root);
  mount(child, root);
  return root;
};

const click = (element: Element | null, init: MouseEventInit = {}) =>
  element!.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true, ...init }),
  );

beforeEach(() => {
  window.history.replaceState(null, "", "/");
});

describe("path mode", () => {
  it("renders the page that matches the URL, with params", () => {
    window.history.replaceState(null, "", "/products/7");
    const root = mountRouter(<Router routes={routes} />);
    expect(root.textContent).toBe("Product 7");
  });

  it("allows a trailing slash and decodes params", () => {
    const Tag: Page = ({ params }) => <h1>{params.tag}</h1>;
    window.history.replaceState(null, "", "/tags/caf%C3%A9/");
    const root = mountRouter(<Router routes={{ "/tags/:tag": Tag }} />);
    expect(root.textContent).toBe("café");
  });

  it("falls back to the * route, or a default Not found page", () => {
    window.history.replaceState(null, "", "/missing");
    const NotFound: Page = () => <p>Nothing here</p>;

    expect(mountRouter(<Router routes={routes} />).textContent).toBe(
      "Not found",
    );
    expect(
      mountRouter(<Router routes={{ ...routes, "*": NotFound }} />).textContent,
    ).toBe("Nothing here");
  });

  it("follows a Link without reloading the page", async () => {
    const root = mountRouter(<Router routes={routes} />);
    const link = root.querySelector("a")!;
    expect(link.getAttribute("href")).toBe("/products/42");

    click(link);
    await nextUpdate();

    expect(location.pathname).toBe("/products/42");
    expect(root.textContent).toBe("Product 42");
  });

  it("lets the browser handle ctrl-click and target=_blank links", () => {
    const Page: Page = () => (
      <>
        <Link to="/products/1">same tab</Link>
        <Link to="/products/2" target="_blank">
          new tab
        </Link>
      </>
    );
    const root = mountRouter(<Router routes={{ "/": Page }} />);
    const [sameTab, newTab] = root.querySelectorAll("a");
    const preventedByRouter: boolean[] = [];
    const recordAndStopNavigation = (event: Event) => {
      preventedByRouter.push(event.defaultPrevented);
      event.preventDefault();
    };
    document.addEventListener("click", recordAndStopNavigation);

    click(sameTab, { ctrlKey: true });
    click(newTab);
    document.removeEventListener("click", recordAndStopNavigation);

    expect(preventedByRouter).toEqual([false, false]);
    expect(location.pathname).toBe("/");
  });

  it("updates when the browser goes back (popstate)", async () => {
    const root = mountRouter(<Router routes={routes} />);
    click(root.querySelector("a"));
    await nextUpdate();

    window.history.replaceState(null, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
    await nextUpdate();

    expect(root.querySelector("h1")!.textContent).toBe("Home");
  });
});

describe("hooks", () => {
  it("useNavigate pushes or replaces, useParams and useLocation read the URL", async () => {
    let navigate: ReturnType<typeof useNavigate> = () => {};
    const Shop: Page = () => {
      navigate = useNavigate();
      const { id } = useParams<{ id: string }>();
      const { pathname, search } = useLocation();
      return (
        <p>
          {id}|{pathname}|{search}
        </p>
      );
    };
    const root = mountRouter(
      <Router routes={{ "/": Shop, "/shop/:id": Shop }} />,
    );
    const lengthBefore = window.history.length;

    navigate("/shop/5?sort=price");
    await nextUpdate();
    expect(root.textContent).toBe("5|/shop/5|?sort=price");
    expect(window.history.length).toBe(lengthBefore + 1);

    navigate("/shop/6", { replace: true });
    await nextUpdate();
    expect(root.textContent).toBe("6|/shop/6|");
    expect(window.history.length).toBe(lengthBefore + 1);
  });

  it("keeps page state when only the params change", async () => {
    let navigate: ReturnType<typeof useNavigate> = () => {};
    const Counter: Page = ({ params }) => {
      navigate = useNavigate();
      const [clicks, setClicks] = useState(0);
      return (
        <button onClick={() => setClicks(clicks + 1)}>
          {params.id}:{clicks}
        </button>
      );
    };
    window.history.replaceState(null, "", "/items/1");
    const root = mountRouter(<Router routes={{ "/items/:id": Counter }} />);

    click(root.querySelector("button"));
    await nextUpdate();
    navigate("/items/2");
    await nextUpdate();

    expect(root.textContent).toBe("2:1");
  });

  it("throws a clear error when used outside <Router>", () => {
    const Lost = () => <Link to="/">home</Link>;
    expect(() => mountRouter(<Lost />)).toThrow(/inside <Router>/);
  });
});

describe("hash mode", () => {
  it("reads the route from the hash and writes #/ links", async () => {
    window.history.replaceState(null, "", "/#/products/3");
    const root = mountRouter(<Router routes={routes} mode="hash" />);
    expect(root.textContent).toBe("Product 3");

    window.history.replaceState(null, "", "/");
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    await nextUpdate();

    const link = root.querySelector("a")!;
    expect(link.getAttribute("href")).toBe("#/products/42");

    click(link);
    await nextUpdate();
    expect(location.hash).toBe("#/products/42");
    expect(root.textContent).toBe("Product 42");
  });
});
