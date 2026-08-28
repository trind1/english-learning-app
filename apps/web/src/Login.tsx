import { useState } from "react";

export const Login = ({
  onLogin,
  onNavigateRegister,
}: {
  onLogin?: (email: string, password: string) => void;
  onNavigateRegister?: () => void;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      onLogin?.(email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to log in.");
    }
  };

  return (
    <div className="auth-page-wrapper">
      <main className="login-card">
        {/* Subtle Background Accent */}
        <div className="login-accent-bar" />
        <div className="login-glow-blob" />

        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "32px",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
              style={{ color: "var(--primary)", fontSize: "32px" }}
            >
              language
            </span>
            <h1
              className="text-headline-lg"
              style={{ color: "var(--primary)", margin: 0 }}
            >
              LinguistPro
            </h1>
          </div>
          <p
            className="text-body-md"
            style={{ color: "var(--on-surface-variant)", margin: 0 }}
          >
            Welcome back. Let's continue your journey.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {error && <p role="alert">{error}</p>}
          {/* Email Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label
              className="text-label-md"
              htmlFor="email"
              style={{ color: "var(--on-surface)", display: "block" }}
            >
              Email Address
            </label>
            <div className="input-icon-wrapper">
              <span className="material-symbols-outlined" aria-hidden="true">
                mail
              </span>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <label
                className="text-label-md"
                htmlFor="password"
                style={{ color: "var(--on-surface)", display: "block" }}
              >
                Password
              </label>
              <a
                href="#forgot"
                className="text-label-md"
                style={{ color: "var(--primary)", textDecoration: "none" }}
                onClick={(e) => e.preventDefault()}
              >
                Forgot Password?
              </a>
            </div>
            <div className="input-icon-wrapper">
              <span className="material-symbols-outlined" aria-hidden="true">
                lock
              </span>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            className="btn-primary"
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "16px",
              borderRadius: "8px",
            }}
          >
            <span>Login</span>
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
              style={{ fontSize: "20px" }}
            >
              arrow_forward
            </span>
          </button>
        </form>

        {/* Sign Up Link */}
        <div
          style={{
            marginTop: "32px",
            textAlign: "center",
            position: "relative",
            zIndex: 10,
          }}
        >
          <p
            className="text-body-md"
            style={{ color: "var(--on-surface-variant)", margin: 0 }}
          >
            Don't have an account?{" "}
            <a
              href="#register"
              className="text-label-md"
              style={{
                color: "var(--primary)",
                textDecoration: "none",
                fontWeight: 600,
              }}
              onClick={(e) => {
                e.preventDefault();
                onNavigateRegister?.();
              }}
            >
              Sign Up
            </a>
          </p>
        </div>
      </main>
    </div>
  );
};
