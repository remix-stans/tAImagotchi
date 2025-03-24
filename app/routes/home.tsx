import { adapterContext } from "../utils/adapter-context";
import { Welcome } from "../welcome/welcome";
import type { Route } from "./+types/home";

console.log(process.env); // this works :)
export const loader = async ({ request, context }: Route.LoaderArgs) => {
	const { cloudflare } = context.get(adapterContext);
	console.log(cloudflare.env.counter);

	return null;
};

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "New React Router App" },
		{ name: "description", content: "Welcome to React Router!" },
	];
}

export default function Home() {
	return <Welcome />;
}
