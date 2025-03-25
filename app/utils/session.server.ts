import { env } from "cloudflare:workers";
import { createCookieSessionStorage } from "react-router";

const cookieConfig = {
	httpOnly: true,
	path: "/",
	sameSite: "lax",
	secure: env.ENV === "production",
	secrets: env.COOKIE_SECRET.split(","),
} as const;

export const sessionStorages = {
	user: createCookieSessionStorage({
		cookie: {
			name: "user.session",
			maxAge: 60 * 60 * 24 * 30, // Reset after a month
			...cookieConfig,
		},
	}),
};
