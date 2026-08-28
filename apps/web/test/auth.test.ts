import { beforeEach, describe, expect, it } from "vitest";
import { AuthService, AuthStorage } from "../src/auth";

describe("mock authentication", () => {
  beforeEach(() => localStorage.clear());
  it("recovers safely from malformed persisted values", () => {
    localStorage.setItem("linguistpro.demo.accounts", "not-json");
    localStorage.setItem("linguistpro.demo.session", "not-json");
    expect(AuthStorage.accounts()).toEqual([]);
    expect(AuthStorage.session()).toBeNull();
  });
  it("registers, restores, logs in, and logs out", () => {
    const service = new AuthService();
    const user = service.register({
      name: " Learner ",
      email: "USER@EXAMPLE.COM",
      password: "secret1",
      confirmPassword: "secret1",
    });
    expect(user.email).toBe("user@example.com");
    expect(AuthStorage.session()).toEqual(user);
    service.logout();
    expect(AuthStorage.session()).toBeNull();
    expect(service.login("user@example.com", "secret1")).toEqual(user);
  });
  it("rejects invalid registration and login", () => {
    const service = new AuthService();
    expect(() =>
      service.register({
        name: "",
        email: "",
        password: "x",
        confirmPassword: "y",
      }),
    ).toThrow("required");
    expect(() =>
      service.register({
        name: "A",
        email: "a@example.com",
        password: "short",
        confirmPassword: "short",
      }),
    ).toThrow("6");
    service.register({
      name: "A",
      email: "a@example.com",
      password: "secret1",
      confirmPassword: "secret1",
    });
    expect(() =>
      service.register({
        name: "B",
        email: "A@EXAMPLE.COM",
        password: "secret1",
        confirmPassword: "secret1",
      }),
    ).toThrow("already");
    expect(() => service.login("a@example.com", "wrong")).toThrow("Invalid");
  });
});
