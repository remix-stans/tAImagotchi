import { redirect, useLoaderData } from "react-router";

import { adapterContext } from "@/lib/adapter-context";
import { sessionContext } from "@/lib/middlewares/session";
import type { Route } from "./+types/app";
import UI from "./ui";

export const loader = async ({ request, context }: Route.LoaderArgs) => {
  const { user } = context.get(sessionContext);
  if (!user) {
    throw redirect("/sign-in");
  }

  const { cloudflare } = context.get(adapterContext);

  return {
    user,
    country: cloudflare.cf.country,
    city: cloudflare.cf.city,
  };
};

export const useAppLoaderData = () => {
  const data = useLoaderData<typeof loader>();

  if (data === undefined) {
    throw new Error("Cannot use useAppLoaderData outside of the app route");
  }

  return data;
};

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: "Mochimo" },
    {
      name: "description",
      content: "A soft digital friend that grows with you",
    },
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
