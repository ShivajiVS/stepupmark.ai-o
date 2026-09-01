import { defineConfig, devices } from "@playwright/test";

const PORT = "3000";
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  // One engine only. These specs cover routing, auth and URL state, none of which
  // are rendering-engine specific, so a browser matrix would triple CI time for
  // no extra signal.
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm build && pnpm start",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    // Vite inlines VITE_* at build time, so these must be present for the build
    // step, not just for the server process.
    env: {
      VITE_API_URL: "http://localhost:3001/api",
      VITE_ENABLE_MSW: "true",
      PORT,
    },
    timeout: 180_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
