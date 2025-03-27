import { adapterContext } from "@/lib/adapter-context";
import { getSession } from "@/lib/session-middleware";
import { redirect } from "react-router";
import type { Route } from "./+types/app";
import UI from "./ui";

export const loader = async ({ request, context }: Route.LoaderArgs) => {
	const user = getSession(context, "user").get("user");
	const { cloudflare } = context.get(adapterContext);

	return {
		user,
		country: cloudflare.cf.country,
		city: cloudflare.cf.city,
	};
};

export const action = async ({ request, context }: Route.ActionArgs) => {
	const user = getSession(context, "user");
	const { cloudflare } = context.get(adapterContext);

	const formData = await request.formData();
	const number = formData.get("number");
	const intent = formData.get("intent");

	// if (intent === "set-cookie") {
	// 	user.set("user", number as string);
	// }

	throw redirect("/");
};

export function meta({ data }: Route.MetaArgs) {
	return [
		{ title: "New React Router App" },
		{ name: "description", content: "Welcome to React Router!" },
	];
}

export default function Home({ loaderData }: Route.ComponentProps) {
	return (
		<div>
			<pre>{JSON.stringify(loaderData, null, 2)}</pre>

			<UI />
		</div>
	);
}
