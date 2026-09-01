import type { ComponentType } from "react";
import { createRoutesStub } from "react-router";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";

type RouteStub = { path: string; Component: ComponentType };

export function renderRoutes(routes: RouteStub[], initialEntry: string) {
  const Stub = createRoutesStub(routes);
  // Retries and caching are production concerns; in a component test they only
  // turn a failed assertion into a timeout.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 0 }, mutations: { retry: false } },
  });

  const queryIndex = initialEntry.indexOf("?");
  const searchParams = queryIndex === -1 ? "" : initialEntry.slice(queryIndex);

  return render(
    <QueryClientProvider client={queryClient}>
      <NuqsTestingAdapter searchParams={searchParams}>
        <Stub initialEntries={[initialEntry]} />
      </NuqsTestingAdapter>
    </QueryClientProvider>,
  );
}
