import {
	type RouteConfig,
	index,
	prefix,
	route,
} from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("app", "./routes/app.tsx"),
	route("sign-in", "./routes/sign-in.tsx"),
	route("sign-up", "./routes/sign-up.tsx"),
	...prefix("api", [route("auth/*", "./routes/api/auth.ts")]),
] satisfies RouteConfig;
