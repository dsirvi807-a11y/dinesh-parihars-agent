import { betterAuth } from "better-auth";

const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

function getAllowedHosts(): string[] {
  const hosts = [
    ...(process.env.NODE_ENV === "development"
      ? ["localhost:3000", "127.0.0.1:3000"]
      : []),
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.V0_RUNTIME_URL,
    process.env.V0_DEV_APP_URL,
    process.env.V0_BUILD_URL,
    process.env.V0_SANDBOX_URL,
  ].filter((host): host is string => Boolean(host));

  if (hosts.length === 0) {
    throw new Error("No trusted deployment hosts are configured");
  }
  return Array.from(new Set(hosts));
}

export const auth = betterAuth({
  baseURL: {
    allowedHosts: getAllowedHosts(),
    protocol: process.env.NODE_ENV === "development" ? "auto" : "https",
  },
  session: {
    expiresIn: SESSION_MAX_AGE_SECONDS,
    disableSessionRefresh: true,
    cookieCache: {
      enabled: true,
      maxAge: SESSION_MAX_AGE_SECONDS,
      refreshCache: false,
      strategy: "jwe",
    },
  },
  ...(process.env.NODE_ENV === "development"
    ? {
        advanced: {
          defaultCookieAttributes: {
            sameSite: "none" as const,
            secure: true,
          },
        },
      }
    : {}),
});
