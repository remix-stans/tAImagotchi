import { redirect, type unstable_MiddlewareFunction } from "react-router";

import { sessionContext } from "./session";

export const loginMiddleware: unstable_MiddlewareFunction<Response> = async (
  { context },
  next,
) => {
  const { user } = context.get(sessionContext);
  if (user) {
    throw redirect("/app");
  }

  return next();
};
