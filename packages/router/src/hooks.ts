import { useCallback } from "@koniwa/core";
import { useRouter } from "./context.js";
import type { Params } from "./match.js";
import { changeRoute, splitRoute } from "./url.js";

export interface NavigateOptions {
  replace?: boolean;
}

export const useNavigate = () => {
  const { mode } = useRouter();

  return useCallback(
    (to: string | number, { replace = false }: NavigateOptions = {}) => {
      if (typeof to === "number") {
        history.go(to);
        return;
      }
      changeRoute(mode, to, { replace });
      if (!replace) window.scrollTo(0, 0);
    },
    [mode],
  );
};

export const useParams = <P extends Params = Params>(): P =>
  useRouter().params as P;

export const useLocation = (): { pathname: string; search: string } =>
  splitRoute(useRouter().route);
