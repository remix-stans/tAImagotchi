import {
  type Session,
  type unstable_MiddlewareFunction,
  type unstable_RouterContextProvider,
  unstable_createContext,
} from "react-router";
import { sessionStorages } from "./session.server";

export interface User {
  id: string;
  email: string;
  name: string;
}
interface SessionData {
  user: { user: User };
}

const sessionContext =
  unstable_createContext<{
    [K in keyof SessionData]: Session<SessionData[K]>;
  }>();

export const sessionMiddleware: unstable_MiddlewareFunction<Response> = async (
  { request, context },
  next,
) => {
  const sessions = Object.fromEntries(
    await Promise.all(
      Object.entries(sessionStorages).map(async ([key, storage]) => [
        key,
        await storage.getSession(request.headers.get("Cookie")),
      ]),
    ),
  );
  context.set(sessionContext, sessions);

  const response = await next();

  for (const key in sessionStorages) {
    response.headers.append(
      "Set-Cookie",
      await sessionStorages[key as keyof typeof sessionStorages].commitSession(
        sessions[key as keyof typeof sessions],
      ),
    );
  }

  return response;
};

export function getSession(
  context: unstable_RouterContextProvider,
  key: keyof SessionData,
) {
  return context.get(sessionContext)[key];
}
