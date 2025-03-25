import { Form, redirect } from "react-router";
import { getSession, sessionMiddleware } from "~/utils/session-middleware";
import { adapterContext } from "../utils/adapter-context";
import { Welcome } from "../welcome/welcome";
import type { Route } from "./+types/home";

export const unstable_middleware = [sessionMiddleware];

export const loader = async ({ request, context }: Route.LoaderArgs) => {
	const user = getSession(context, "user").get("user");
	const { cloudflare } = context.get(adapterContext);

	const id = cloudflare.env.counter.idFromName("global");
	const stub = cloudflare.env.counter.get(id);

	return {
		user,
		country: cloudflare.cf.country,
		city: cloudflare.cf.city,
		counter: await stub.getCounterValue(),
	};
};

export const action = async ({ request, context }: Route.ActionArgs) => {
	const user = getSession(context, "user");
	const { cloudflare } = context.get(adapterContext);

	const formData = await request.formData();
	const number = formData.get("number");
	const intent = formData.get("intent");

	const id = cloudflare.env.counter.idFromName("global");
	const stub = cloudflare.env.counter.get(id);

	if (intent === "increment") {
		await stub.increment();
	} else if (intent === "decrement") {
		await stub.decrement();
	} else if (intent === "set-cookie") {
		user.set("user", number as string);
	}

	throw redirect("/");
};

export function meta({ data }: Route.MetaArgs) {
	return [
		{ title: `New React Router App - ${data.counter}` },
		{ name: "description", content: "Welcome to React Router!" },
	];
}

export default function Home({ loaderData }: Route.ComponentProps) {
	return (
		<div>
			<Welcome />

			<Form method="post">
				<button name="intent" value="set-cookie" type="submit">
					Set random number on cookie
				</button>
				<input
					type="text"
					name="number"
					placeholder="Enter a number"
					className="text-white border border-white bg-stone-600"
				/>
				<button name="intent" value="increment" type="submit">
					Increment
				</button>
				<button name="intent" value="decrement" type="submit">
					Decrement
				</button>
			</Form>

			<pre>{JSON.stringify(loaderData, null, 2)}</pre>
		</div>
	);
}
