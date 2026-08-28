import { useState } from "react";

export const Login = ({
  onLogin,
  onNavigateRegister,
}: {
  onLogin?: () => void;
  onNavigateRegister?: () => void;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin?.();
  };

  return (
    <div className="auth-page-wrapper">
      <main className="login-card">
        {/* Subtle Background Accent */}
        <div className="login-accent-bar" />
        <div className="login-glow-blob" />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px", position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "12px" }}>
            <span className="material-symbols-outlined" style={{ color: "var(--primary)", fontSize: "32px" }}>
              language
            </span>
            <h1 className="text-headline-lg" style={{ color: "var(--primary)", margin: 0 }}>
              LinguistPro
            </h1>
          </div>
          <p className="text-body-md" style={{ color: "var(--on-surface-variant)", margin: 0 }}>
            Welcome back. Let's continue your journey.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Email Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label className="text-label-md" htmlFor="email" style={{ color: "var(--on-surface)", display: "block" }}>
              Email Address
            </label>
            <div className="input-icon-wrapper">
              <span className="material-symbols-outlined">mail</span>
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label className="text-label-md" htmlFor="password" style={{ color: "var(--on-surface)", display: "block" }}>
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
              <span className="material-symbols-outlined">lock</span>
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
            style={{ width: "100%", padding: "12px", marginTop: "16px", borderRadius: "8px" }}
          >
            <span>Login</span>
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
              arrow_forward
            </span>
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider" style={{ position: "relative", zIndex: 10 }}>
          <div className="line" />
          <span>Or continue with</span>
          <div className="line" />
        </div>

        {/* Social Logins */}
        <div className="social-grid" style={{ position: "relative", zIndex: 10 }}>
          <button className="social-btn" type="button">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google</span>
          </button>
          <button className="social-btn" type="button">
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
              file_download
            </span>
            <span>Apple</span>
          </button>
        </div>

        {/* Sign Up Link */}
        <div style={{ marginTop: "32px", textAlign: "center", position: "relative", zIndex: 10 }}>
          <p className="text-body-md" style={{ color: "var(--on-surface-variant)", margin: 0 }}>
            Don't have an account?{" "}
            <a
              href="#register"
              className="text-label-md"
              style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}
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
