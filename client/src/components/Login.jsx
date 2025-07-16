import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

function Login() {
  // user → Get the current logged-in user's data (like name/email)
  const { login } = useAuth();
  const navigate = useNavigate();

  //Collecting email + password with useState
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // errors
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/login`,
        {
          email,
          password,
        }
      );

      const { token, user } = res.data;

      //login(token, user) → Save token + user info to context and localStorage
      login(token, user);
      navigate("/dashboard");
    } catch (err) {
      if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Login failed. Please try again.");
      }
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-glow">
        <div className="login-container">
          {" "}
          <h2 className="login-heading">🔐 Login</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <label className="login-label">
              📧 Email:
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="login-input"
                placeholder="Enter your email"
              />
            </label>

            <label className="login-label">
              <span>🔑 Password:</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="login-input"
                placeholder="Enter your password"
              />
            </label>

            {error && <p className="login-error">❌ {error}</p>}

            <button type="submit" className="login-button">
              Login
            </button>
          </form>
          {/* Google OAuth login */}
          <div className="login-section">
            <a
              href={`${process.env.REACT_APP_API_BASE_URL}/api/auth/google`}
              className="google-btn"
            >
              <img src="/google.png" alt="Google" className="google-icon" />
              <span className="google-text">Login with Google</span>
            </a>
          </div>
          <p className="login-footer">
            Don't have an account? <a href="/signup">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
