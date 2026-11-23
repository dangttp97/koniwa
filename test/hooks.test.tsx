import { describe, expect, it, vi } from "vitest";
import {
  mount,
  render,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "@koniwa/core";

const nextUpdate = () => new Promise((resolve) => setTimeout(resolve, 0));

const renderIntoDocument = (child: Parameters<typeof render>[0]) => {
  const root = document.createElement("div");
  document.body.append(root);
  render(child, root);
  return root;
};

const click = (element: Element | null) => (element as HTMLElement).click();

describe("useState", () => {
  it("re-renders the component and keeps the same DOM nodes", async () => {
    const Counter = () => {
      const [count, setCount] = useState(0);
      return <button onClick={() => setCount(count + 1)}>{count}</button>;
    };
    const root = renderIntoDocument(<Counter />);
    const button = root.querySelector("button");

    click(button);
    await nextUpdate();

    expect(root.innerHTML).toBe("<button>1</button>");
    expect(root.querySelector("button")).toBe(button);
  });

  it("accepts an updater function and batches updates into one render", async () => {
    let renders = 0;
    const Counter = () => {
      renders++;
      const [count, setCount] = useState(() => 10);
      const addTwo = () => {
        setCount((c) => c + 1);
        setCount((c) => c + 1);
      };
      return <button onClick={addTwo}>{count}</button>;
    };
    const root = renderIntoDocument(<Counter />);

    click(root.querySelector("button"));
    await nextUpdate();

    expect(root.textContent).toBe("12");
    expect(renders).toBe(2);
  });

  it("skips the render when the value does not change", async () => {
    let renders = 0;
    const Same = () => {
      renders++;
      const [value, setValue] = useState("a");
      return <button onClick={() => setValue("a")}>{value}</button>;
    };
    const root = renderIntoDocument(<Same />);

    click(root.querySelector("button"));
    await nextUpdate();

    expect(renders).toBe(1);
  });

  it("keeps focus and updates the value of a controlled input", async () => {
    const Form = () => {
      const [text, setText] = useState("");
      return (
        <div>
          <input
            value={text}
            onInput={(e: Event) =>
              setText((e.target as HTMLInputElement).value.toUpperCase())
            }
          />
          <p>{text}</p>
        </div>
      );
    };
    const root = renderIntoDocument(<Form />);
    const input = root.querySelector("input")!;
    input.focus();

    input.value = "hi";
    input.dispatchEvent(new Event("input"));
    await nextUpdate();

    expect(root.querySelector("input")).toBe(input);
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe("HI");
    expect(root.querySelector("p")!.textContent).toBe("HI");
  });

  it("keeps child state when the parent re-renders", async () => {
    const Child = () => {
      const [on, setOn] = useState(false);
      return <button onClick={() => setOn(!on)}>{on ? "on" : "off"}</button>;
    };
    const Parent = () => {
      const [count, setCount] = useState(0);
      return (
        <div>
          <span onClick={() => setCount(count + 1)}>{count}</span>
          <Child />
        </div>
      );
    };
    const root = renderIntoDocument(<Parent />);

    click(root.querySelector("button"));
    await nextUpdate();
    click(root.querySelector("span"));
    await nextUpdate();

    expect(root.innerHTML).toBe("<div><span>1</span><button>on</button></div>");
  });

  it("moves keyed items instead of recreating them", async () => {
    let reverse: () => void = () => {};
    const List = () => {
      const [items, setItems] = useState(["a", "b", "c"]);
      reverse = () => setItems([...items].reverse());
      return (
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    };
    const root = renderIntoDocument(<List />);
    const [a, , c] = root.querySelectorAll("li");

    reverse();
    await nextUpdate();

    const after = root.querySelectorAll("li");
    expect(root.textContent).toBe("cba");
    expect(after[0]).toBe(c);
    expect(after[2]).toBe(a);
  });

  it("keeps sibling order when a conditional element appears", async () => {
    let show: () => void = () => {};
    const Toggle = () => {
      const [visible, setVisible] = useState(false);
      show = () => setVisible(true);
      return (
        <p>
          <b>first</b>
          {visible && <i>middle</i>}
          <u>last</u>
        </p>
      );
    };
    const root = renderIntoDocument(<Toggle />);

    show();
    await nextUpdate();

    expect(root.innerHTML).toBe("<p><b>first</b><i>middle</i><u>last</u></p>");
  });

  it("re-renders a component that sits between siblings in place", async () => {
    let grow: () => void = () => {};
    const Middle = () => {
      const [items, setItems] = useState(["x"]);
      grow = () => setItems(["x", "y"]);
      return <>{items}</>;
    };
    const root = renderIntoDocument(
      <div>
        <b>start</b>
        <Middle />
        <b>end</b>
      </div>,
    );

    grow();
    await nextUpdate();

    expect(root.innerHTML).toBe("<div><b>start</b>xy<b>end</b></div>");
  });

  it("replaces event listeners on re-render", async () => {
    const calls: number[] = [];
    let bump: () => void = () => {};
    const Clicker = () => {
      const [count, setCount] = useState(0);
      bump = () => setCount(count + 1);
      return <button onClick={() => calls.push(count)}>go</button>;
    };
    const root = renderIntoDocument(<Clicker />);

    bump();
    await nextUpdate();
    click(root.querySelector("button"));

    expect(calls).toEqual([1]);
  });
});

describe("useEffect", () => {
  it("runs after the DOM is in place, and again only when deps change", async () => {
    const log: string[] = [];
    let setCount: (n: number) => void = () => {};
    let setOther: (s: string) => void = () => {};
    const Logger = () => {
      const [count, _setCount] = useState(0);
      const [other, _setOther] = useState("a");
      setCount = _setCount;
      setOther = _setOther;
      useEffect(() => {
        log.push(
          `effect ${count} ${document.getElementById("value")?.textContent}`,
        );
        return () => log.push(`cleanup ${count}`);
      }, [count]);
      return (
        <p id="value">
          {count}
          {other}
        </p>
      );
    };
    renderIntoDocument(<Logger />);

    setOther("b");
    await nextUpdate();
    setCount(1);
    await nextUpdate();

    expect(log).toEqual(["effect 0 0a", "cleanup 0", "effect 1 1b"]);
  });

  it("runs on every render without deps, and once with []", async () => {
    let everyRender = 0;
    let once = 0;
    let bump: () => void = () => {};
    const App = () => {
      const [count, setCount] = useState(0);
      bump = () => setCount(count + 1);
      useEffect(() => {
        everyRender++;
      });
      useEffect(() => {
        once++;
      }, []);
      return <p>{count}</p>;
    };
    renderIntoDocument(<App />);

    bump();
    await nextUpdate();
    bump();
    await nextUpdate();

    expect(everyRender).toBe(3);
    expect(once).toBe(1);
  });

  it("runs children's effects before the parent's, siblings in order", () => {
    const log: string[] = [];
    const Item = ({ name }: { name: string }) => {
      useEffect(() => {
        log.push(name);
      }, []);
      return <li>{name}</li>;
    };
    const List = () => {
      useEffect(() => {
        log.push("list");
      }, []);
      return (
        <ul>
          <Item name="a" />
          <Item name="b" />
        </ul>
      );
    };
    const Page = () => {
      useEffect(() => {
        log.push("page");
      }, []);
      return <List />;
    };

    renderIntoDocument(<Page />);

    expect(log).toEqual(["a", "b", "list", "page"]);
  });

  it("cleans up when the component is removed", async () => {
    const cleanup = vi.fn();
    let hide: () => void = () => {};
    const Timer = () => {
      useEffect(() => cleanup, []);
      return <span>timer</span>;
    };
    const App = () => {
      const [visible, setVisible] = useState(true);
      hide = () => setVisible(false);
      return <div>{visible && <Timer />}</div>;
    };
    const root = renderIntoDocument(<App />);

    hide();
    await nextUpdate();

    expect(cleanup).toHaveBeenCalledOnce();
    expect(root.innerHTML).toBe("<div></div>");
  });

  it("cleans up when mount() replaces the page", () => {
    const cleanup = vi.fn();
    const Page = () => {
      useEffect(() => cleanup, []);
      return <p>page</p>;
    };
    const root = document.createElement("div");

    mount(<Page />, root);
    mount(<p>next</p>, root);

    expect(cleanup).toHaveBeenCalledOnce();
    expect(root.innerHTML).toBe("<p>next</p>");
  });

  it("can set state, which triggers another render", async () => {
    const Loader = () => {
      const [text, setText] = useState("loading");
      useEffect(() => setText("done"), []);
      return <p>{text}</p>;
    };
    const root = renderIntoDocument(<Loader />);

    await nextUpdate();

    expect(root.textContent).toBe("done");
  });
});

describe("useMemo and useCallback", () => {
  it("recompute only when deps change", async () => {
    const compute = vi.fn((n: number) => n * 2);
    const callbacks = new Set<() => void>();
    let setCount: (n: number) => void = () => {};
    let setOther: (s: string) => void = () => {};
    const App = () => {
      const [count, _setCount] = useState(1);
      const [other, _setOther] = useState("a");
      setCount = _setCount;
      setOther = _setOther;
      const doubled = useMemo(() => compute(count), [count]);
      callbacks.add(useCallback(() => {}, [count]));
      return (
        <p>
          {doubled}
          {other}
        </p>
      );
    };
    const root = renderIntoDocument(<App />);

    setOther("b");
    await nextUpdate();
    expect(compute).toHaveBeenCalledTimes(1);
    expect(callbacks.size).toBe(1);

    setCount(5);
    await nextUpdate();
    expect(compute).toHaveBeenCalledTimes(2);
    expect(callbacks.size).toBe(2);
    expect(root.textContent).toBe("10b");
  });
});

describe("rules", () => {
  it("throws a clear error when a hook is called outside a component", () => {
    expect(() => useState(0)).toThrow(/inside a component/);
  });
});
