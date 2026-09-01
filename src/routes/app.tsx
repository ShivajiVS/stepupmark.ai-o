import { Outlet, redirect } from "react-router";

import { SignOutButton } from "~/features/auth";
import { LoadingState } from "~/components/common/loading-state";
import { AppShell } from "~/components/layout/app-shell";
import { refreshSession } from "~/services/api/auth-refresh";
import { getAccessToken } from "~/services/api/session";
import { readSidebarPreference } from "~/lib/sidebar-preference";

import type { Route } from "./+types/app";

// Client-only: the access token lives in browser memory, so this boundary cannot
// run on the server. A missing token is not yet a failure — the refresh cookie
// may still be valid after a reload.
export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  if (getAccessToken() === null) {
    try {
      await refreshSession();
    } catch {
      const { pathname, search } = new URL(request.url);
      const redirectTo = encodeURIComponent(`${pathname}${search}`);
      throw redirect(`/sign-in?redirectTo=${redirectTo}`);
    }
  }
  return { sidebarOpen: readSidebarPreference() };
}

export function HydrateFallback() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 3xl:max-w-7xl 4xl:max-w-8xl">
      <LoadingState rows={3} label="Loading your workspace" />
    </div>
  );
}

export default function AppLayout({ loaderData }: Route.ComponentProps) {
  return (
    <AppShell footer={<SignOutButton />} defaultSidebarOpen={loaderData.sidebarOpen}>
      <Outlet />
    </AppShell>
  );
}
