import { sessionContext } from "@/lib/middlewares/session";
import { Link } from "react-router";
import type { Route } from "./+types/home";

export async function loader({ context }: Route.LoaderArgs) {
  const { user } = context.get(sessionContext);
  return { user };
}

export default function LandingPage({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-indigo-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <header className="mb-16 text-center">
          <h1 className="mb-4 font-bold text-6xl">tAImagotchi</h1>
          <p className="text-xl">Your AI companion that grows with you</p>
          {user ? (
            <div>
              Hello, {user.name} {user.email} {user.id}
            </div>
          ) : (
            <div>
              <Link to="/sign-in">Sign in</Link>
              <Link to="/sign-up">Sign up</Link>
            </div>
          )}
        </header>

        <div className="mb-16 grid items-center gap-12 md:grid-cols-2">
          <div className="space-y-6">
            <h2 className="font-bold text-4xl">Raise Your Virtual AI Pet</h2>
            <p className="text-lg">
              Experience the joy of nurturing an AI companion that learns,
              evolves, and develops its own unique personality through your
              interactions.
            </p>
            <Link
              to="/app"
              className="inline-block rounded-full bg-white px-8 py-3 font-semibold text-purple-600 transition hover:bg-purple-100"
            >
              Create Your tAImagotchi
            </Link>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
              <h3 className="mb-3 font-bold text-xl">Interactive Learning</h3>
              <p>
                Watch as your pet develops based on your conversations and care
              </p>
            </div>
            <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
              <h3 className="mb-3 font-bold text-xl">Unique Personality</h3>
              <p>
                Every tAImagotchi evolves differently based on your interactions
              </p>
            </div>
            <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
              <h3 className="mb-3 font-bold text-xl">24/7 Companion</h3>
              <p>
                Your AI friend is always there when you need someone to talk to
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
