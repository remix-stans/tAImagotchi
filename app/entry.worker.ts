// @ts-expect-error - no types
import * as build from "virtual:react-router/server-build";
import { Hono } from "hono";
import { agentsMiddleware } from "hono-agents";
import { createMiddleware } from "hono/factory";
import { type ServerBuild, createRequestHandler } from "react-router";

import { adapterContext } from "./lib/adapter-context";
import { sessionStorages } from "./lib/session.server";
import { Tamagochi } from "./taimogochi";

interface ReactRouterMiddlewareOptions {
  build: ServerBuild;
  mode?: "development" | "production";
}

declare global {
  interface CloudflareEnvironment extends Env {}
}

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: CloudflareEnvironment;
      ctx: ExecutionContext;
      cf: IncomingRequestCfProperties;
    };
  }
}

const app = new Hono<{ Bindings: Env }>();

export { Tamagochi };

const reactRouter = ({ build, mode }: ReactRouterMiddlewareOptions) => {
  return createMiddleware(async (c) => {
    const requestHandler = createRequestHandler(build, mode);

    const context = new Map([
      [
        adapterContext,
        {
          cloudflare: { env: c.env, ctx: c.executionCtx, cf: c.req.raw.cf },
        },
      ],
    ]);
    return await requestHandler(c.req.raw, context);
  });
};

app.use("/agents/*", agentsMiddleware({
  options: {
    onBeforeConnect: async (req) => {
      const session = await sessionStorages.user.getSession(req.headers.get("cookie"));
      const user = session.get("user");
      if (!user) {
        return new Response("Unauthorized", { status: 401 });
      }

      const room = req.headers.get("x-partykit-room");
      if (room?.toLowerCase() !== user.id.toLowerCase()) {
        return new Response("Forbidden", { status: 403 });
      }
    },
  }
}));

app.use(
  "/*",
  reactRouter({
    build,
    mode: process.env.ENV as "development" | "production",
  }),
);

export default app;
