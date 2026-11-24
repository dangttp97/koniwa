import { describe, expect, it, vi } from "vitest";
import {
  render,
  useRef,
  type Child,
  type ComponentProps,
  type ComponentPropsWithoutRef,
  type FC,
  type MouseEventHandler,
  type ReactNode,
  type PropsWithChildren,
} from "@koniwa/core";

const renderToRoot = (child: Parameters<typeof render>[0]) => {
  const root = document.createElement("div");
  render(child, root);
  return root;
};

type ButtonProps = ComponentProps<"button"> & { variant?: "primary" | "ghost" };

const Button = ({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonProps) => (
  <button
    type="button"
    {...rest}
    className={`btn btn-${variant} ${className}`.trim()}
  >
    {children}
  </button>
);

describe("ComponentProps", () => {
  it("lets a component pass DOM props through to the element", () => {
    const onClick = vi.fn();
    const root = renderToRoot(
      <Button
        variant="ghost"
        disabled
        title="Close"
        aria-label="Close"
        data-id={3}
        onClick={onClick}
      >
        x
      </Button>,
    );
    const button = root.querySelector("button")!;

    expect(button.className).toBe("btn btn-ghost");
    expect(button.disabled).toBe(true);
    expect(button.getAttribute("aria-label")).toBe("Close");
    expect(button.getAttribute("data-id")).toBe("3");
  });

  it("passes a ref through to the element", () => {
    let ref: { current: HTMLButtonElement | null } = { current: null };
    const App = () => {
      ref = useRef<HTMLButtonElement>(null);
      return <Button ref={ref}>go</Button>;
    };
    const root = renderToRoot(<App />);
    expect(ref.current).toBe(root.querySelector("button"));
  });

  it("reads the props of a component", () => {
    const Card = ({ title }: { title: string }) => <h2>{title}</h2>;
    const props: ComponentProps<typeof Card> = { title: "Cart" };
    expect(renderToRoot(<Card {...props} />).textContent).toBe("Cart");
  });
});

describe("PropsWithChildren", () => {
  it("adds children to a props type", () => {
    const Card = ({
      title,
      children,
    }: PropsWithChildren<{ title: string }>) => (
      <section>
        <h2>{title}</h2>
        {children}
      </section>
    );
    const root = renderToRoot(
      <Card title="Cart">
        <p>Empty</p>
      </Card>,
    );
    expect(root.innerHTML).toBe("<section><h2>Cart</h2><p>Empty</p></section>");
  });
});

describe("event props", () => {
  it("types currentTarget as the element", () => {
    const values: string[] = [];
    const root = renderToRoot(
      <input onInput={(event) => values.push(event.currentTarget.value)} />,
    );
    const input = root.querySelector("input")!;

    input.value = "hi";
    input.dispatchEvent(new Event("input"));

    expect(values).toEqual(["hi"]);
  });

  it("attaches onDoubleClick to the dblclick event", () => {
    const onDoubleClick = vi.fn();
    const root = renderToRoot(<p onDoubleClick={onDoubleClick}>x</p>);

    root.querySelector("p")!.dispatchEvent(new MouseEvent("dblclick"));

    expect(onDoubleClick).toHaveBeenCalledOnce();
  });
});

describe("type checks", () => {
  it("rejects props an element does not have", () => {
    const elements = [
      // @ts-expect-error: typo, <button> has no "disbled"
      <button disbled />,
      // @ts-expect-error: disabled is a boolean
      <button disabled="yes" />,
      // @ts-expect-error: onClick needs a function
      <button onClick="go()" />,
      // @ts-expect-error: <a> has no "disabled"
      <a disabled />,
      // @ts-expect-error: unknown CSS property
      <p style={{ colour: "red" }} />,
    ];
    expect(elements).toHaveLength(5);
  });

  it("accepts numbers or strings for text and number props, SVG attributes and custom elements", () => {
    const elements = [
      <input value={3} maxLength={10} readOnly />,
      <img src="a.png" alt="" width="600" height={600} />,
      <svg viewBox="0 0 10 10">
        <circle cx="5" cy="5" r={4} stroke-width="2" />
      </svg>,
      <my-widget size="large" />,
      <p style="color: red" />,
      <p style={{ opacity: 0.5, backgroundColor: "red" }} />,
    ];
    expect(elements).toHaveLength(6);
  });
});

describe("React type names", () => {
  it("covers FC, event handler types and ComponentPropsWithoutRef", () => {
    const clicks: string[] = [];
    const onClick: MouseEventHandler<HTMLButtonElement> = (event) =>
      clicks.push(event.currentTarget.type);
    const Toolbar: FC<ComponentPropsWithoutRef<"div">> = ({
      children,
      ...rest
    }) => <div {...rest}>{children}</div>;
    const root = renderToRoot(
      <Toolbar role="toolbar">
        <button onClick={onClick}>save</button>
      </Toolbar>,
    );

    root.querySelector("button")!.click();

    expect(root.firstElementChild!.getAttribute("role")).toBe("toolbar");
    expect(clicks).toEqual(["submit"]);
  });

  it("keeps the old names working as deprecated aliases", () => {
    const legacy: Child = "text";
    const node: ReactNode = legacy;
    expect(renderToRoot(<p>{node}</p>).textContent).toBe("text");
  });
});
