import { Link } from "react-router";

import { EmptyState } from "~/components/common/empty-state";
import { Button } from "~/components/ui/button";

export function meta() {
  return [{ title: "Page not found · stepupmark" }];
}

export function loader() {
  throw new Response("Not Found", { status: 404 });
}

export default function NotFoundRoute() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md items-center px-4">
      <EmptyState title="Page not found" description="That page doesn't exist or has moved.">
        <Button asChild variant="link">
          <Link to="/">Back to home</Link>
        </Button>
      </EmptyState>
    </main>
  );
}
