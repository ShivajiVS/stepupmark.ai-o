import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

import { env } from "~/app/config/env";

async function hydrate() {
  if (env.VITE_ENABLE_MSW) {
    const { worker } = await import("~/mocks/browser");
    await worker.start({ onUnhandledRequest: "bypass", quiet: true });
  }

  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <HydratedRouter />
      </StrictMode>,
    );
  });
}

void hydrate();
