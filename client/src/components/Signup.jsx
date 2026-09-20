import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const apiBase = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const result = await axios.post(`${apiBase}/api/auth/signup`, {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      const { token, user } = result.data;
      login(token, user);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Signup encountered an error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-container">
        {/* Header Block */}
        <div className="auth-header-block">
          <div className="auth-logo-badge">📝</div>
          <h1 className="auth-heading">Create an Account</h1>
          <p className="auth-subheading">
            Join CuraMap to find nearby hospital care and emergency updates
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
            <label className="auth-label" htmlFor="signup-name">
              Full Name
            </label>
            <input
              id="signup-name"
              name="name"
              type="text"
              placeholder="Dr. Jane Doe / John Smith"
              onChange={handleChange}
              value={form.name}
              required
              className="auth-input-field"
              autoComplete="name"
            />
          </div>

          <div className="auth-field-group">
            <label className="auth-label" htmlFor="signup-email">
              Email Address
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              placeholder="name@example.com"
              onChange={handleChange}
              value={form.email}
              required
              className="auth-input-field"
              autoComplete="email"
            />
          </div>

          <div className="auth-field-group">
            <label className="auth-label" htmlFor="signup-password">
              Password (min 6 characters)
            </label>
            <input
              id="signup-password"
              name="password"
              type="password"
              placeholder="••••••••"
              onChange={handleChange}
              value={form.password}
              required
              className="auth-input-field"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Complete Sign Up →"}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">or sign up with</div>

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
          <span>Sign up with Google</span>
        </a>

        {/* Footer Link */}
        <p className="auth-footer-prompt">
          Already registered on CuraMap?
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
