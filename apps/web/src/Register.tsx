import { useState } from "react";

export const Register = ({
  onRegister,
  onNavigateLogin,
}: {
  onRegister?: (input: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => void;
  onNavigateLogin?: () => void;
}) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      onRegister?.({ name: fullName, email, password, confirmPassword });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to register.");
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="register-card">
        {/* Left Side: Branding / Visual (Hidden on mobile) */}
        <div className="register-hero-side">
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "32px",
              }}
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
                style={{ fontSize: "32px", fontVariationSettings: "'FILL' 1" }}
              >
                school
              </span>
              <span className="text-headline-lg" style={{ color: "white" }}>
                LinguistPro
              </span>
            </div>
            <h1
              className="text-display-lg"
              style={{
                color: "white",
                marginBottom: "24px",
                maxWidth: "420px",
              }}
            >
              Start your journey to language mastery.
            </h1>
            <p
              className="text-body-lg"
              style={{
                color: "var(--primary-fixed)",
                maxWidth: "420px",
                opacity: 0.95,
              }}
            >
              Join thousands of learners achieving fluency with our methodical,
              distraction-free approach.
            </p>
          </div>
          <div style={{ display: "flex", gap: "16px", marginTop: "48px" }}>
            <div
              style={{
                width: "48px",
                height: "4px",
                backgroundColor: "var(--secondary-container)",
                borderRadius: "4px",
              }}
            />
            <div
              style={{
                width: "16px",
                height: "4px",
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                borderRadius: "4px",
              }}
            />
            <div
              style={{
                width: "16px",
                height: "4px",
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                borderRadius: "4px",
              }}
            />
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="register-form-side">
          {/* Header */}
          <div style={{ marginBottom: "28px" }}>
            <h2
              className="text-headline-lg"
              style={{ color: "var(--on-surface)", margin: "0 0 8px 0" }}
            >
              Create an Account
            </h2>
            <p
              className="text-body-md"
              style={{ color: "var(--on-surface-variant)", margin: 0 }}
            >
              Sign up to start learning with LinguistPro.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {error && <p role="alert">{error}</p>}
            {/* Full Name */}
            <div>
              <label
                className="text-label-md"
                htmlFor="fullName"
                style={{
                  color: "var(--on-surface)",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Full Name
              </label>
              <div className="input-icon-wrapper">
                <span className="material-symbols-outlined" aria-hidden="true">
                  person
                </span>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                className="text-label-md"
                htmlFor="email"
                style={{
                  color: "var(--on-surface)",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Email
              </label>
              <div className="input-icon-wrapper">
                <span className="material-symbols-outlined" aria-hidden="true">
                  mail
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="text-label-md"
                htmlFor="password"
                style={{
                  color: "var(--on-surface)",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Password
              </label>
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

            {/* Confirm Password */}
            <div>
              <label
                className="text-label-md"
                htmlFor="confirmPassword"
                style={{
                  color: "var(--on-surface)",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Confirm Password
              </label>
              <div className="input-icon-wrapper">
                <span className="material-symbols-outlined" aria-hidden="true">
                  lock
                </span>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Terms and Privacy */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                marginTop: "4px",
              }}
            >
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{
                  width: "18px",
                  height: "18px",
                  marginTop: "2px",
                  accentColor: "var(--primary)",
                  cursor: "pointer",
                }}
                required
              />
              <label
                htmlFor="terms"
                className="text-body-md"
                style={{
                  fontSize: "14px",
                  color: "var(--on-surface-variant)",
                  cursor: "pointer",
                }}
              >
                I agree to the{" "}
                <a
                  href="#terms"
                  style={{ color: "var(--primary)", fontWeight: 500 }}
                  onClick={(e) => e.preventDefault()}
                >
                  Terms
                </a>{" "}
                and{" "}
                <a
                  href="#privacy"
                  style={{ color: "var(--primary)", fontWeight: 500 }}
                  onClick={(e) => e.preventDefault()}
                >
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              className="btn-primary"
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "12px",
                borderRadius: "10px",
              }}
            >
              Create Account
            </button>
          </form>

          {/* Login Link */}
          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <p
              className="text-body-md"
              style={{ color: "var(--on-surface-variant)", margin: 0 }}
            >
              Already have an account?{" "}
              <a
                href="#login"
                className="text-label-md"
                style={{
                  color: "var(--primary)",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateLogin?.();
                }}
              >
                Log In
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
