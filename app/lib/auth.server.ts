import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { Kysely } from "kysely";
import type { DB } from "kysely-codegen";
import { D1Dialect } from "kysely-d1";

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  cookies: {
    session_token: {
      name: "user.session",
    },
  },
  database: {
    db: new Kysely<DB>({
      dialect: new D1Dialect({
        database: env.DB,
      }),
    }),
    type: "sqlite",
  },
  emailAndPassword: {
    enabled: true,
    async sendResetPassword(data, request) {
      // Send an email to the user with a link to reset their password
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
});
