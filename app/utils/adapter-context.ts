import {
	type Session,
	type SessionStorage,
	unstable_createContext,
} from "react-router";

export const adapterContext = unstable_createContext<{
	cloudflare: {
		env: CloudflareEnvironment;
		ctx: ExecutionContext;
	};
}>();
