import React, { useState } from "react";
import axios from "axios";
import "./Auth.css";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  // To show error or success message
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    axios
      .post("http://localhost:5000/api/auth/signup", form)
      .then(() => {
        setSuccess("Signup successful. Please log in.");
        setForm({ name: "", email: "", password: "" }); // reset form
      })
      .catch((err) => setError(err.response?.data?.error || "Signup failed"));
  }

  return (
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
        {success && <p className="auth-success">✅ {success}</p>}

        <button type="submit" className="auth-button">
          Sign Up
        </button>
      </form>

      <p className="auth-footer">
        Already have an account? <a href="/login">Log in</a>
      </p>
    </div>
  );
}

export default Signup;
