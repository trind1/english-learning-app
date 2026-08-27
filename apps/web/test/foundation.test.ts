import { describe, expect, it } from "vitest";

import { webWorkspaceIdentity } from "../src/foundation";

describe("TEST-001 web workspace foundation", () => {
  it("identifies the frontend workspace", () => {
    expect(webWorkspaceIdentity()).toEqual({
      kind: "frontend",
      name: "@english-learning/web",
    });
  });
});
