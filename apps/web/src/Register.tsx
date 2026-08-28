import { useState } from "react";

export const Register = ({
  onRegister,
  onNavigateLogin,
}: {
  onRegister?: () => void;
  onNavigateLogin?: () => void;
}) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister?.();
  };

  return (
    <div className="auth-page-wrapper">
      <div className="register-card">
        {/* Left Side: Branding / Visual (Hidden on mobile) */}
        <div className="register-hero-side">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "32px" }}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "32px", fontVariationSettings: "'FILL' 1" }}
              >
                school
              </span>
              <span className="text-headline-lg" style={{ color: "white" }}>
                LinguistPro
              </span>
            </div>
            <h1 className="text-display-lg" style={{ color: "white", marginBottom: "24px", maxWidth: "420px" }}>
              Start your journey to language mastery.
            </h1>
            <p
              className="text-body-lg"
              style={{ color: "var(--primary-fixed)", maxWidth: "420px", opacity: 0.95 }}
            >
              Join thousands of learners achieving fluency with our methodical, distraction-free approach.
            </p>
          </div>
          <div style={{ display: "flex", gap: "16px", marginTop: "48px" }}>
            <div style={{ width: "48px", height: "4px", backgroundColor: "var(--secondary-container)", borderRadius: "4px" }} />
            <div style={{ width: "16px", height: "4px", backgroundColor: "rgba(255, 255, 255, 0.3)", borderRadius: "4px" }} />
            <div style={{ width: "16px", height: "4px", backgroundColor: "rgba(255, 255, 255, 0.3)", borderRadius: "4px" }} />
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="register-form-side">
          {/* Header */}
          <div style={{ marginBottom: "28px" }}>
            <h2 className="text-headline-lg" style={{ color: "var(--on-surface)", margin: "0 0 8px 0" }}>
              Create an Account
            </h2>
            <p className="text-body-md" style={{ color: "var(--on-surface-variant)", margin: 0 }}>
              Sign up to start learning with LinguistPro.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Full Name */}
            <div>
              <label className="text-label-md" htmlFor="fullName" style={{ color: "var(--on-surface)", display: "block", marginBottom: "4px" }}>
                Full Name
              </label>
              <div className="input-icon-wrapper">
                <span className="material-symbols-outlined">person</span>
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
              <label className="text-label-md" htmlFor="email" style={{ color: "var(--on-surface)", display: "block", marginBottom: "4px" }}>
                Email
              </label>
              <div className="input-icon-wrapper">
                <span className="material-symbols-outlined">mail</span>
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
              <label className="text-label-md" htmlFor="password" style={{ color: "var(--on-surface)", display: "block", marginBottom: "4px" }}>
                Password
              </label>
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

            {/* Confirm Password */}
            <div>
              <label className="text-label-md" htmlFor="confirmPassword" style={{ color: "var(--on-surface)", display: "block", marginBottom: "4px" }}>
                Confirm Password
              </label>
              <div className="input-icon-wrapper">
                <span className="material-symbols-outlined">lock</span>
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
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginTop: "4px" }}>
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ width: "18px", height: "18px", marginTop: "2px", accentColor: "var(--primary)", cursor: "pointer" }}
                required
              />
              <label htmlFor="terms" className="text-body-md" style={{ fontSize: "14px", color: "var(--on-surface-variant)", cursor: "pointer" }}>
                I agree to the{" "}
                <a href="#terms" style={{ color: "var(--primary)", fontWeight: 500 }} onClick={(e) => e.preventDefault()}>
                  Terms
                </a>{" "}
                and{" "}
                <a href="#privacy" style={{ color: "var(--primary)", fontWeight: 500 }} onClick={(e) => e.preventDefault()}>
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              className="btn-primary"
              type="submit"
              style={{ width: "100%", padding: "12px", marginTop: "12px", borderRadius: "10px" }}
            >
              Create Account
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <div className="line" />
            <span>Or sign up with</span>
            <div className="line" />
          </div>

          {/* Social Logins */}
          <div className="social-grid">
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

          {/* Login Link */}
          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <p className="text-body-md" style={{ color: "var(--on-surface-variant)", margin: 0 }}>
              Already have an account?{" "}
              <a
                href="#login"
                className="text-label-md"
                style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}
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
