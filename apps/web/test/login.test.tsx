import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Login } from "../src/Login";

describe("Login component", () => {
  it("renders login form and handles submit, forgot password, and navigation", () => {
    const onLogin = vi.fn();
    const onNavigateRegister = vi.fn();
    render(<Login onLogin={onLogin} onNavigateRegister={onNavigateRegister} />);

    expect(
      screen.getByRole("heading", { name: "LinguistPro" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Email Address"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("link", { name: "Forgot Password?" }));
    fireEvent.click(screen.getByRole("button", { name: /Login/i }));
    expect(onLogin).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("link", { name: "Sign Up" }));
    expect(onNavigateRegister).toHaveBeenCalledTimes(1);
  });

  it("handles fallback when no callbacks provided", () => {
    render(<Login />);
    fireEvent.click(screen.getByRole("button", { name: /Login/i }));
    fireEvent.click(screen.getByRole("link", { name: "Sign Up" }));
    fireEvent.click(screen.getByRole("link", { name: "Forgot Password?" }));
  });
});
