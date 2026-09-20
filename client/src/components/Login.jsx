import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const apiBase = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${apiBase}/api/auth/login`, {
        email: email.trim(),
        password,
      });

      const { token, user } = res.data;
      login(token, user);

      // Role-aware redirect
      if (user.role === "hospital_admin") {
        navigate("/hospital-admin");
      } else if (user.role === "super_admin") {
        navigate("/super-admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Invalid email or password. Please verify your credentials.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-container">
        {/* Header Block */}
        <div className="auth-header-block">
          <div className="auth-logo-badge">🔐</div>
          <h1 className="auth-heading">Sign in to CuraMap</h1>
          <p className="auth-subheading">
            Access real-time hospital resources and administrator features
          </p>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="auth-error-banner" role="alert">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="auth-form-body">
          <div className="auth-field-group">
            <label className="auth-label" htmlFor="login-email">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input-field"
              placeholder="name@hospital.com or patient@example.com"
              autoComplete="email"
            />
          </div>

          <div className="auth-field-group">
            <label className="auth-label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input-field"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">or continue with</div>

        {/* Google OAuth Option */}
        <a
          href={`${apiBase}/api/auth/google`}
          className="google-oauth-btn"
        >
          <img
            src="/google.png"
            alt="Google"
            className="google-oauth-icon"
          />
          <span>Sign in with Google</span>
        </a>

        {/* Footer Link */}
        <p className="auth-footer-prompt">
          Don't have an account yet?
          <Link to="/signup">Create account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
