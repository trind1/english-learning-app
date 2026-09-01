import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./test/setup.ts"],
    coverage: {
      all: true,
      // main.tsx only mounts App into the browser-owned root element. Product
      // behavior is covered through App and the feature components.
      exclude: ["**/*.d.ts", "src/main.tsx"],
      include: ["src/**/*.{ts,tsx}"],
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "coverage",
      thresholds: {
        branches: 95,
        functions: 95,
        lines: 95,
        statements: 95,
      },
    },
    environment: "jsdom",
    globals: true,
  },
});
