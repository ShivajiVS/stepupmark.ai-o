import { Outlet } from "react-router";

import { SiteHeader } from "~/components/layout/site-header";

export default function PublicLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-16">
        <Outlet />
      </main>
      <footer className="border-t">
        <p className="mx-auto max-w-5xl px-4 py-6 text-sm text-muted-foreground">
          Built with React Router, TanStack Query and Tailwind.
        </p>
      </footer>
    </div>
  );
}
