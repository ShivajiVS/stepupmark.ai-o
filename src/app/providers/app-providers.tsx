import { useState, type ReactNode } from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { NuqsAdapter } from "nuqs/adapters/react-router/v8";

import { getQueryClient } from "~/app/query/client";
import { Toaster } from "~/components/ui/sonner";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(getQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {/* reducedMotion="user" makes every Motion animation honour the OS setting. */}
      <MotionConfig reducedMotion="user">
        <NuqsAdapter>
          {children}
          <Toaster />
        </NuqsAdapter>
      </MotionConfig>
    </QueryClientProvider>
  );
}
