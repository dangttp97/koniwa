import { describe, expect, it } from "vitest";
import {
  render,
  useEffect,
  useId,
  useLayoutEffect,
  useReducer,
  useState,
  useSyncExternalStore,
} from "@koniwa/core";

const nextUpdate = () => new Promise((resolve) => setTimeout(resolve, 0));

const renderIntoDocument = (child: Parameters<typeof render>[0]) => {
  const root = document.createElement("div");
  document.body.append(root);
  render(child, root);
  return root;
};

describe("useReducer", () => {
  type Action = { type: "add"; by: number } | { type: "reset" };
  const reducer = (state: number, action: Action) =>
    action.type === "add" ? state + action.by : 0;

  it("updates state through the reducer and keeps dispatch stable", async () => {
    const dispatches = new Set<unknown>();
    let send: (action: Action) => void = () => {};
    const Counter = () => {
      const [count, dispatch] = useReducer(reducer, 1);
      dispatches.add(dispatch);
      send = dispatch;
      return <p>{count}</p>;
    };
    const root = renderIntoDocument(<Counter />);

    send({ type: "add", by: 2 });
    send({ type: "add", by: 3 });
    await nextUpdate();
    expect(root.textContent).toBe("6");

    send({ type: "reset" });
    await nextUpdate();
    expect(root.textContent).toBe("0");
    expect(dispatches.size).toBe(1);
  });

  it("builds the initial state with init(initialArg)", () => {
    const Counter = () => {
      const [count] = useReducer(
        reducer,
        "41",
        (text: string) => Number(text) + 1,
      );
      return <p>{count}</p>;
    };
    expect(renderIntoDocument(<Counter />).textContent).toBe("42");
  });
});

describe("useId", () => {
  it("is stable across renders and unique per component", async () => {
    let bump: () => void = () => {};
    const Field = ({ label }: { label: string }) => {
      const id = useId();
      const [, setTick] = useState(0);
      if (label === "a") bump = () => setTick((t) => t + 1);
      return (
        <p>
          <label htmlFor={id}>{label}</label>
          <input id={id} />
        </p>
      );
    };
    const root = renderIntoDocument(
      <>
        <Field label="a" />
        <Field label="b" />
      </>,
    );
    const [first, second] = [...root.querySelectorAll("input")].map(
      (i) => i.id,
    );

    bump();
    await nextUpdate();

    expect(first).not.toBe(second);
    expect(root.querySelector("input")!.id).toBe(first);
    expect(root.querySelector("label")!.getAttribute("for")).toBe(first);
  });
});

describe("useLayoutEffect", () => {
  it("runs every layout effect in the tree before any useEffect", () => {
    const log: string[] = [];
    const Child = () => {
      useEffect(() => {
        log.push("child effect");
      }, []);
      useLayoutEffect(() => {
        log.push("child layout");
      }, []);
      return <span />;
    };
    const Parent = () => {
      useEffect(() => {
        log.push("parent effect");
      }, []);
      useLayoutEffect(() => {
        log.push("parent layout");
      }, []);
      return <Child />;
    };

    renderIntoDocument(<Parent />);

    expect(log).toEqual([
      "child layout",
      "parent layout",
      "child effect",
      "parent effect",
    ]);
  });

  it("sees the updated DOM and cleans up before the next run", async () => {
    const log: string[] = [];
    let setText: (text: string) => void = () => {};
    const Measure = () => {
      const [text, _setText] = useState("a");
      setText = _setText;
      useLayoutEffect(() => {
        log.push(`layout ${document.getElementById("measured")?.textContent}`);
        return () => log.push(`cleanup ${text}`);
      }, [text]);
      return <p id="measured">{text}</p>;
    };
    renderIntoDocument(<Measure />);

    setText("bb");
    await nextUpdate();

    expect(log).toEqual(["layout a", "cleanup a", "layout bb"]);
  });
});

describe("useSyncExternalStore", () => {
  const createStore = (initial: number) => {
    let value = initial;
    const listeners = new Set<() => void>();
    return {
      listeners,
      get: () => value,
      set: (next: number) => {
        value = next;
        listeners.forEach((listener) => listener());
      },
      subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    };
  };

  it("re-renders when the store changes, and unsubscribes on unmount", async () => {
    const store = createStore(1);
    let hide: () => void = () => {};
    const Value = () => (
      <span>{useSyncExternalStore(store.subscribe, store.get)}</span>
    );
    const App = () => {
      const [visible, setVisible] = useState(true);
      hide = () => setVisible(false);
      return <div>{visible && <Value />}</div>;
    };
    const root = renderIntoDocument(<App />);
    expect(store.listeners.size).toBe(1);

    store.set(2);
    await nextUpdate();
    expect(root.textContent).toBe("2");

    hide();
    await nextUpdate();
    expect(store.listeners.size).toBe(0);
  });

  it("skips the render when the snapshot did not change", async () => {
    const store = createStore(1);
    let renders = 0;
    const Value = () => {
      renders++;
      return <span>{useSyncExternalStore(store.subscribe, store.get)}</span>;
    };
    renderIntoDocument(<Value />);

    store.set(1);
    await nextUpdate();

    expect(renders).toBe(1);
  });

  it("catches a change made between render and subscribe", async () => {
    const store = createStore(1);
    const Value = () => (
      <span>{useSyncExternalStore(store.subscribe, store.get)}</span>
    );
    const Changer = () => {
      useLayoutEffect(() => store.set(5), []);
      return null;
    };
    const root = renderIntoDocument(
      <>
        <Changer />
        <Value />
      </>,
    );

    await nextUpdate();

    expect(root.textContent).toBe("5");
  });
});
