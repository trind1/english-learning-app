import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Register } from "../src/Register";

describe("Register component", () => {
  it("renders register form and handles submit, links, and navigation", () => {
    const onRegister = vi.fn();
    const onNavigateLogin = vi.fn();
    render(
      <Register onRegister={onRegister} onNavigateLogin={onNavigateLogin} />,
    );

    expect(
      screen.getByRole("heading", { name: "Create an Account" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByLabelText(/I agree to the/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Full Name"), {
      target: { value: "Jane Doe" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "jane@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByLabelText(/I agree to the/i));

    fireEvent.click(screen.getByRole("link", { name: "Terms" }));
    fireEvent.click(screen.getByRole("link", { name: "Privacy Policy" }));

    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));
    expect(onRegister).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("link", { name: "Log In" }));
    expect(onNavigateLogin).toHaveBeenCalledTimes(1);
  });

  it("handles fallback when no callbacks provided", () => {
    render(<Register />);
    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));
    fireEvent.click(screen.getByRole("link", { name: "Log In" }));
  });
  it("shows registration errors from the service callback", () => {
    render(
      <Register
        onRegister={() => {
          throw new Error("Duplicate account");
        }}
      />,
    );
    fireEvent.change(screen.getByLabelText("Full Name"), {
      target: { value: "A" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "a@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret1" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "secret1" },
    });
    fireEvent.click(screen.getByLabelText(/I agree to the/i));
    fireEvent.click(screen.getByRole("button", { name: "Create Account" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Duplicate account");
  });
});
