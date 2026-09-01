import { useQuery } from "@tanstack/react-query";

import { currentUserQuery } from "~/features/auth";

export function meta() {
  return [{ title: "Overview · stepupmark" }];
}

export default function AppIndexRoute() {
  const { data: user } = useQuery(currentUserQuery());

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {user === undefined ? "Overview" : `Welcome back, ${user.name}`}
        </h1>
        <p className="text-sm text-muted-foreground">
          This area renders on the client. Its data is private and changes while you watch it.
        </p>
      </div>
    </div>
  );
}
