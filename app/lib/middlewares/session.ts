import type { Session, User } from "better-auth";
import {
  type unstable_MiddlewareFunction,
  unstable_createContext,
} from "react-router";

import { auth } from "../auth.server";

export const sessionContext = unstable_createContext<{
  session: Session | undefined;
  user: User | undefined;
}>();

export const sessionMiddleware: unstable_MiddlewareFunction<Response> = async (
  { request, context },
  next,
) => {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  context.set(
    sessionContext,
    session ?? {
      session: undefined,
      user: undefined,
    },
  );
  return next();
};
