import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";

function OAuthHandler() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [handled, setHandled] = useState(false);

  useEffect(() => {
    if (handled) return;

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    console.log("Token received from URL:", token);

    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Decoded token:", decoded);
        //alert("Decoded name: " + decoded.name);

        const user = {
          _id: decoded.id,
          email: decoded.email,
          name: decoded.name || "Google User", // fallback name
        };

        console.log("Constructed user object:", user);

        login(token, user);
        console.log("Login function called");

        setHandled(true);

        navigate("/dashboard");
      } catch (err) {
        console.error("Invalid token:", err);
        navigate("/login");
      }
    } else {
      console.warn("No token found in URL");
      navigate("/login");
    }
  }, [login, navigate, handled]);

  return <p>Logging you in via Google...</p>;
}

export default OAuthHandler;
