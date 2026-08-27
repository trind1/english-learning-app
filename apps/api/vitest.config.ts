import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      all: true,
      // The composition root only wires already-tested module boundaries; it has no business logic.
      exclude: ["**/*.d.ts", "src/server.ts", "src/app.ts"],
      include: ["src/**/*.ts"],
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
    environment: "node",
    globals: true,
  },
});
