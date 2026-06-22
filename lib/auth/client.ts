import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { auth } from "./server";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  plugins: [inferAdditionalFields<typeof auth>()],
});
