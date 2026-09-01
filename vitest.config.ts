import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    env: {
      VITE_API_URL: "http://localhost:3001/api",
      VITE_ENABLE_MSW: "false",
    },
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/mocks/**", "src/**/*.test.{ts,tsx}", "src/entry.client.tsx"],
    },
  },
});
