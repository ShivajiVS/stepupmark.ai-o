import { reactRouter } from "@react-router/dev/vite";

import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    // The React Router plugin serves virtual modules that Vitest cannot resolve,
    // so component tests run against the plain React pipeline instead.
    !process.env.VITEST && reactRouter(),
  ],
});
