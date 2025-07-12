import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

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
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

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
    <div className="auth-container">
      <h2 className="auth-heading">🔐 Login</h2>

      <form onSubmit={handleSubmit} className="auth-form">
        <label className="auth-label">
          📧 Email:
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="auth-input"
            placeholder="Enter your email"
          />
        </label>

        <label>
          🔑 Password:
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="auth-input"
            placeholder="Enter your password"
          />
        </label>

        {error && <p className="auth-error">❌ {error}</p>}

        <button type="submit" className="auth-button">
          Login
        </button>
      </form>

      <p className="auth-footer">
        Don't have an account? <a href="/signup">Sign up</a>
      </p>
    </div>
  );
}

export default Login;
