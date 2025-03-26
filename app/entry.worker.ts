import { betterAuth } from "better-auth";
import { Hono } from "hono";
import { agentsMiddleware } from "hono-agents";
import { createMiddleware } from "hono/factory";
import { D1Dialect } from "kysely-d1";
import { Kysely } from "kysely";
import type { DB } from "kysely-codegen";
import { type ServerBuild, createRequestHandler } from "react-router";
// @ts-expect-error - no types
import * as build from "virtual:react-router/server-build";

import { adapterContext } from "./lib/adapter-context";
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
		db: Kysely<DB>;
		auth: ReturnType<typeof betterAuth>;
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

		const db = new Kysely<DB>({
			dialect: new D1Dialect({
				database: c.env.DB,
			}),
		});

		const context = new Map([
			[
				adapterContext,
				{
					db,
					auth: betterAuth({
						database: {
							db,
							type: "sqlite",
						},
						emailAndPassword: {
							enabled: true,
							async sendResetPassword(data, request) {
								// Send an email to the user with a link to reset their password
							},
						},
						socialProviders: {},
					}),
					cloudflare: { env: c.env, ctx: c.executionCtx, cf: c.req.raw.cf },
				},
			],
		]);
		return await requestHandler(c.req.raw, context);
	});
};

app.use("/agents/*", agentsMiddleware());

app.use(
	"/*",
	reactRouter({
		build,
		mode: process.env.ENV as "development" | "production",
	}),
);

export default app;
