import { currentComponent } from "../core/current-component.js";
import type { ReactNode, Context } from "../types.js";

export const createContext = <T>(defaultValue: T): Context<T> => ({
  defaultValue,
  Provider: ({ children }: { value: T; children?: ReactNode }) => children,
});

export const useContext = <T>(context: Context<T>): T => {
  for (let above = currentComponent().parent; above; above = above.parent) {
    const item = above.item;
    if (typeof item === "object" && item?.type === context.Provider) {
      return item.props.value as T;
    }
  }
  return context.defaultValue;
};
