import { describe, expect, it, vi } from "vitest";
import {
  createContext,
  render,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from "@koniwa/core";

const nextUpdate = () => new Promise((resolve) => setTimeout(resolve, 0));

const renderIntoDocument = (child: Parameters<typeof render>[0]) => {
  const root = document.createElement("div");
  document.body.append(root);
  render(child, root);
  return root;
};

describe("useRef", () => {
  it("keeps the same object across renders and does not re-render", async () => {
    const refs = new Set<object>();
    let renders = 0;
    let bump: () => void = () => {};
    const App = () => {
      renders++;
      const count = useRef(0);
      const [, setTick] = useState(0);
      refs.add(count);
      bump = () => setTick((t) => t + 1);
      return <button onClick={() => count.current++}>{count.current}</button>;
    };
    const root = renderIntoDocument(<App />);

    (root.querySelector("button") as HTMLButtonElement).click();
    await nextUpdate();
    expect(renders).toBe(1);

    bump();
    await nextUpdate();
    expect(refs.size).toBe(1);
    expect(root.textContent).toBe("1");
  });

  it("points at the element, and at null once it is removed", async () => {
    let inputRef: { current: HTMLInputElement | null } = { current: null };
    let hide: () => void = () => {};
    const App = () => {
      inputRef = useRef<HTMLInputElement>(null);
      const [visible, setVisible] = useState(true);
      hide = () => setVisible(false);
      return <div>{visible && <input ref={inputRef} />}</div>;
    };
    const root = renderIntoDocument(<App />);

    expect(inputRef.current).toBe(root.querySelector("input"));
    expect(root.querySelector("input")!.hasAttribute("ref")).toBe(false);

    hide();
    await nextUpdate();
    expect(inputRef.current).toBeNull();
  });

  it("supports callback refs", async () => {
    const calls: Array<Element | null> = [];
    let hide: () => void = () => {};
    const App = () => {
      const [visible, setVisible] = useState(true);
      hide = () => setVisible(false);
      return (
        <div>
          {visible && <p ref={(el: Element | null) => calls.push(el)} />}
        </div>
      );
    };
    const root = renderIntoDocument(<App />);
    const p = root.querySelector("p");

    hide();
    await nextUpdate();

    expect(calls[0]).toBe(p);
    expect(calls.at(-1)).toBeNull();
  });

  it("is passed to components as a normal prop", () => {
    const TextField = ({ ref }: { ref?: Ref<HTMLInputElement> }) => (
      <input ref={ref} />
    );
    let inputRef: { current: HTMLInputElement | null } = { current: null };
    const App = () => {
      inputRef = useRef<HTMLInputElement>(null);
      return <TextField ref={inputRef} />;
    };
    const root = renderIntoDocument(<App />);

    expect(inputRef.current).toBe(root.querySelector("input"));
  });
});

describe("useImperativeHandle", () => {
  it("exposes methods to the parent, ready in the parent's effects", () => {
    type Handle = { focus: () => void };
    const TextField = ({ ref }: { ref?: Ref<Handle> }) => {
      const input = useRef<HTMLInputElement>(null);
      useImperativeHandle(
        ref,
        () => ({ focus: () => input.current!.focus() }),
        [],
      );
      return <input ref={input} />;
    };
    const Form = () => {
      const field = useRef<Handle>(null);
      useEffect(() => field.current!.focus(), []);
      return <TextField ref={field} />;
    };
    const root = renderIntoDocument(<Form />);

    expect(document.activeElement).toBe(root.querySelector("input"));
  });

  it("clears the handle when the component is removed", async () => {
    const handle = { current: null as { ping: () => string } | null };
    let hide: () => void = () => {};
    const ReactNode = ({ ref }: { ref?: Ref<{ ping: () => string }> }) => {
      useImperativeHandle(ref, () => ({ ping: () => "pong" }), []);
      return <span />;
    };
    const App = () => {
      const [visible, setVisible] = useState(true);
      hide = () => setVisible(false);
      return <div>{visible && <ReactNode ref={handle} />}</div>;
    };
    renderIntoDocument(<App />);
    expect(handle.current!.ping()).toBe("pong");

    hide();
    await nextUpdate();
    expect(handle.current).toBeNull();
  });
});

describe("createContext and useContext", () => {
  const Theme = createContext("light");
  const Label = () => <span>{useContext(Theme)}</span>;

  it("returns the default value without a provider", () => {
    expect(renderIntoDocument(<Label />).textContent).toBe("light");
  });

  it("reads the nearest provider", () => {
    const root = renderIntoDocument(
      <Theme.Provider value="dark">
        <Label />
        <Theme.Provider value="sepia">
          <Label />
        </Theme.Provider>
      </Theme.Provider>,
    );
    expect(root.textContent).toBe("darksepia");
  });

  it("updates consumers when the provider value changes", async () => {
    let toggle: () => void = () => {};
    const Middle = () => (
      <p>
        <Label />
      </p>
    );
    const App = () => {
      const [theme, setTheme] = useState("dark");
      toggle = () => setTheme("sepia");
      return (
        <Theme.Provider value={theme}>
          <Middle />
        </Theme.Provider>
      );
    };
    const root = renderIntoDocument(<App />);

    toggle();
    await nextUpdate();

    expect(root.textContent).toBe("sepia");
  });

  it("still finds the provider when the consumer re-renders on its own", async () => {
    const effect = vi.fn();
    let bump: () => void = () => {};
    const Counter = () => {
      const theme = useContext(Theme);
      const [count, setCount] = useState(0);
      bump = () => setCount(count + 1);
      useEffect(() => effect(theme));
      return (
        <span>
          {theme}
          {count}
        </span>
      );
    };
    const root = renderIntoDocument(
      <Theme.Provider value="dark">
        <Counter />
      </Theme.Provider>,
    );

    bump();
    await nextUpdate();

    expect(root.textContent).toBe("dark1");
    expect(effect).toHaveBeenLastCalledWith("dark");
  });
});
