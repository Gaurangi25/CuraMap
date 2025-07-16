import React, { useState } from "react";
import axios from "axios";
import { useNavigate} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Signup.css";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  // To show error message
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/signup`,
        form
      );

      //If signup is successful, log them in right away
      const { token, user } = result.data;

      //saves to AuthContext + localstorage
      login(token, user);

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-glow">
    <div className="auth-container">
      <h2 className="auth-heading">📝 Sign Up</h2>

      <form onSubmit={handleSubmit} className="auth-form">
        <label className="auth-label">
          👤 Name:
          <input
            name="name"
            placeholder="Name"
            onChange={handleChange}
            value={form.name}
            required
            className="auth-input"
          />
        </label>

        <label className="auth-label">
          📧 Email:
          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            value={form.email}
            required
            className="auth-input"
            type="email"
          />
        </label>

        <label className="auth-label">
          🔑 Password:
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            value={form.password}
            required
            className="auth-input"
          />
        </label>

        {/* Show any error or success message */}
        {error && <p className="auth-error">❌ {error}</p>}

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>

      <div className="oauth-section">
        <a
          href={`${process.env.REACT_APP_API_BASE_URL}/api/auth/google`}
          className="google-btn"
        >
          <img src="/google.png" alt="Google" className="google-icon" />
          <span className="google-text">SignUp with Google</span>
        </a>
      </div>

      <p className="auth-footer">
        Already have an account? <a href="/login">Log in</a>
      </p>
    </div>
    </div>
    </div>
  );
}

export default Signup;
