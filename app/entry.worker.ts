import { DurableObject } from "cloudflare:workers";
import { createRequestHandler } from "react-router";

// @ts-expect-error - no types
import * as build from "virtual:react-router/server-build";
import { adapterContext } from "./utils/adapter-context";

declare global {
	interface CloudflareEnvironment extends Env {}
}
declare module "react-router" {
	export interface AppLoadContext {
		cloudflare: {
			env: CloudflareEnvironment;
			ctx: ExecutionContext;
		};
	}
}

export class Counter extends DurableObject {
	async getCounterValue() {
		const value = ((await this.ctx.storage.get("value")) as number) || 0;
		return value;
	}

	async increment(amount = 1) {
		let value = ((await this.ctx.storage.get("value")) as number) || 0;
		value += amount;

		await this.ctx.storage.put("value", value);
		return value;
	}

	async decrement(amount = 1) {
		let value = ((await this.ctx.storage.get("value")) as number) || 0;
		value -= amount;
		await this.ctx.storage.put("value", value);
		return value;
	}
}

const handler = createRequestHandler(build);

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const context = new Map([
			[
				adapterContext,
				{
					cloudflare: { env, ctx },
				},
			],
		]);

		return await handler(request, context);
	},
};
