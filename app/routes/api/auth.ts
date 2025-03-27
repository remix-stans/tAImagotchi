import { getAuth } from "@/lib/auth.server";
import type { Route } from "./+types/auth";

export async function loader({ request }: Route.LoaderArgs) {
  const auth = getAuth();
  return auth.handler(request);
}

export async function action({ request }: Route.ActionArgs) {
  const auth = getAuth();
  return auth.handler(request);
}
