import type { ReactNode } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";

import { AppProviders } from "~/app/providers/app-providers";
import { ErrorState } from "~/components/common/error-state";
import { describeError } from "~/lib/describe-error";

import type { Route } from "./+types/root";

import "~/styles/app.css";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return (
    <AppProviders>
      <Outlet />
    </AppProviders>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const { title, description } = describeError(error);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md items-center px-4">
      <ErrorState title={title} description={description} />
    </main>
  );
}
