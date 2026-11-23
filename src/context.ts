import { currentInstance } from "./core/current-component.js";
import type { Child, Context } from "./types.js";

export const createContext = <T>(defaultValue: T): Context<T> => ({
  defaultValue,
  Provider: ({ children }: { value: T; children?: Child }) => children,
});

export const useContext = <T>(context: Context<T>): T => {
  for (let p = currentInstance().parent; p; p = p.parent) {
    const item = p.item;
    if (typeof item === "object" && item?.type === context.Provider) {
      return item.props.value as T;
    }
  }
  return context.defaultValue;
};
