import { describe, expect, it } from "vitest";

import { apiWorkspaceIdentity } from "../src/foundation";

describe("TEST-001 API workspace foundation", () => {
  it("identifies the backend workspace", () => {
    expect(apiWorkspaceIdentity()).toEqual({
      kind: "backend",
      name: "@english-learning/api",
    });
  });
});
