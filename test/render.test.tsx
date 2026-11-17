import { describe, expect, it, vi } from "vitest";
import { Fragment, h, mount, render, type Child } from "jsx-lite-renderer";

const renderToRoot = (child: Parameters<typeof render>[0]) => {
  const root = document.createElement("div");
  render(child, root);
  return root;
};

describe("h", () => {
  it("creates a VNode and flattens nested children", () => {
    const node = h("ul", { id: "list" }, ["a", ["b", ["c"]]]);
    expect(node).toEqual({
      type: "ul",
      props: { id: "list" },
      children: ["a", "b", "c"],
    });
  });

  it("uses empty props when null is passed", () => {
    expect(h("br", null).props).toEqual({});
  });
});

describe("render", () => {
  it("renders elements, text and numbers", () => {
    const root = renderToRoot(<p>Hi {3}</p>);
    expect(root.innerHTML).toBe("<p>Hi 3</p>");
  });

  it("skips null, undefined and booleans (for `cond && <x />`)", () => {
    const hidden = false;
    const root = renderToRoot(
      <div>
        {hidden && <span>no</span>}
        {null}
        {undefined}
        {true}
      </div>,
    );
    expect(root.innerHTML).toBe("<div></div>");
  });

  it("renders fragments without a wrapper", () => {
    const root = renderToRoot(
      <>
        <b>1</b>
        <i>2</i>
      </>,
    );
    expect(root.innerHTML).toBe("<b>1</b><i>2</i>");
  });

  it("renders lists from map()", () => {
    const root = renderToRoot(
      <ul>
        {["a", "b"].map((item) => (
          <li>{item}</li>
        ))}
      </ul>,
    );
    expect(root.innerHTML).toBe("<ul><li>a</li><li>b</li></ul>");
  });

  it("maps className, htmlFor, booleans and style", () => {
    const root = renderToRoot(
      <label
        className="field"
        htmlFor="name"
        hidden
        style={{ color: "red" }}
        data-x={false}
      />,
    );
    const label = root.firstElementChild as HTMLElement;
    expect(label.getAttribute("class")).toBe("field");
    expect(label.getAttribute("for")).toBe("name");
    expect(label.hasAttribute("hidden")).toBe(true);
    expect(label.style.color).toBe("red");
    expect(label.hasAttribute("data-x")).toBe(false);
  });

  it("attaches event listeners for on* props", () => {
    const onClick = vi.fn();
    const root = renderToRoot(<button onClick={onClick}>Go</button>);
    (root.firstElementChild as HTMLButtonElement).click();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("calls components with props and children", () => {
    const Card = ({ title, children }: { title: string; children?: Child }) => (
      <section>
        <h2>{title}</h2>
        {children}
      </section>
    );
    const root = renderToRoot(
      <Card title="Hello">
        <p>Body</p>
      </Card>,
    );
    expect(root.innerHTML).toBe("<section><h2>Hello</h2><p>Body</p></section>");
  });

  it("accepts a component directly: render(App, root)", () => {
    const App = () => <main>app</main>;
    expect(renderToRoot(App).innerHTML).toBe("<main>app</main>");
  });

  it("creates SVG elements in the SVG namespace", () => {
    const root = renderToRoot(
      <svg viewBox="0 0 10 10">
        <circle cx="5" cy="5" r="4" />
      </svg>,
    );
    const circle = root.querySelector("circle")!;
    expect(circle.namespaceURI).toBe("http://www.w3.org/2000/svg");
  });

  it("works with the classic h() factory too", () => {
    const root = renderToRoot(h(Fragment, null, h("em", null, "x")));
    expect(root.innerHTML).toBe("<em>x</em>");
  });
});

describe("mount", () => {
  it("replaces whatever was in the container", () => {
    const root = document.createElement("div");
    root.innerHTML = "<p>old</p>";
    mount(<p>new</p>, root);
    expect(root.innerHTML).toBe("<p>new</p>");
  });
});
