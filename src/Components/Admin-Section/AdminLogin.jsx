// AdminLogin.jsx
import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import "./AdminLogin.css";

import BGShape from "../../assets/BGShape.png";
import teampluslogo from "../../assets/stafio-bg-dark.png";
import Imagelogin from "../../assets/Imagelogin.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import ForgotPasswordPopup from "./ForgotPasswordPopup";
import gicon from "../../assets/favicon.ico";

import {
  saveSession,
  isLoggedIn,
  saveRememberMe,
  saveGoogleRememberMe,
  clearRememberMe,
  getRememberMe,
} from "../../utils/sessionManager";

import { useGoogleLogin } from "@react-oauth/google";

const AdminLogin = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const googleInitRef = useRef(false);

  // ---------------------------
  // ⭐ Admin Normal Login
  // ---------------------------
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:5001/admin_login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // ✅ 1. Save session (MANDATORY)
      saveSession(data, "admin");

      // ✅ 2. Remember Me (OPTIONAL)
      if (rememberMe) {
        saveRememberMe(identifier, password, "admin", data.user_id);
      } else {
        clearRememberMe("admin", data.user_id);
      }

      // ✅ 3. Navigate
      navigate("/admin-dashboard");
    } catch {
      setError("Network error. Check backend.");
    }
  };

  // ---------------------------
  // ⭐ Google Login (Fully Fixed)
  // ---------------------------
  // const handleGoogleLogin = (credentialResponse) => {
  //   if (!credentialResponse || !credentialResponse.credential) {
  //     setError("Google login cancelled or failed.");
  //     return;
  //   }

  //   fetch("http://127.0.0.1:5001/admin_google_login", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       id_token: credentialResponse.credential,
  //       role: "admin",
  //     }),
  //   })
  //     .then((res) => res.json())
  //     .then((data) => {
  //       if (data.user_id) {
  //         localStorage.setItem("admin_user_id", data.user_id);
  //         localStorage.setItem("admin_role", data.role);
  //         localStorage.setItem("admin_username", data.username);

  //         // ⭐ Save Google Remember Me
  //         if (rememberMe) {
  //           localStorage.setItem("remember_admin", "true");
  //           localStorage.setItem("remember_google", "true");
  //           localStorage.setItem("remember_google_email", data.email);
  //           localStorage.setItem("remember_google_name", data.username);
  //         } else {
  //           localStorage.removeItem("remember_google");
  //           localStorage.removeItem("remember_google_email");
  //           localStorage.removeItem("remember_google_name");
  //         }

  //         navigate("/admin-dashboard");
  //       } else {
  //         setError(data.message || "Google login failed");
  //       }
  //     })
  //     .catch(() => setError("Google login failed"));
  // };

  const googleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch("http://127.0.0.1:5001/admin_google_login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: tokenResponse.access_token,
            role: "admin",
          }),
        });

        const data = await res.json();

        if (!data.user_id) {
          setError("Google login failed");
          return;
        }

        // ✅ 1. Save session
        saveSession(data, "admin");

        // ✅ 2. Remember Google
        if (rememberMe) {
          saveGoogleRememberMe(
            data.email,
            data.username,
            "admin",
            data.user_id,
          );
        }

        navigate("/admin-dashboard");
      } catch {
        setError("Google login failed");
      }
    },
  });

  //  useEffect(() => {
  //   if (googleInitRef.current) return;
  //   googleInitRef.current = true;

  //   if (!window.google) return;

  //   window.google.accounts.id.initialize({
  //     client_id:
  //       "337074822738-kaucna6a1olvoo8qfvs8r320iekp9hi1.apps.googleusercontent.com",
  //     callback: handleGoogleLogin,
  //     ux_mode: "popup",
  //   });

  //     window.google.accounts.id.renderButton(
  //     document.getElementById("googleLoginButton"),
  //     { theme: "outline", size: "large" }
  //   );

  // }, []);

  //  AUTO LOGIN (Normal + Google)

  useEffect(() => {
    if (isLoggedIn()) {
      navigate("/admin-dashboard");
      return;
    }

    const remembered = getRememberMe("admin");
    if (!remembered) return;

    // Only pre-fill email, never password (security fix)
    setIdentifier(remembered.email || "");
  }, []);

  return (
    <Container fluid className="admin-login-container">
      <Row className="vh-100">
        {/* ---------- LEFT SIDE ---------- */}
        <Col
          md={6}
          className="login-left d-flex flex-column align-items-center justify-content-center"
        >
          <img src={BGShape} alt="Background Shape" className="bg-shape" />

          <div className="login-left-content text-center">
            <img
              src={teampluslogo}
              alt="Team Plus"
              className="teampluss-logo mb-3"
            />
            <h2 className="login-heading">One Portal,</h2>
            <h4 className="login-subheading">Unlimited Potential</h4>
            <p className="login-description">
              Welcome to workspace Hub – Where people & productivity meet.
            </p>
          </div>

          <img
            src={Imagelogin}
            alt="Login Illustration"
            className="login-illustrations"
          />
        </Col>

        {/* ---------- RIGHT SIDE ---------- */}
        <Col
          md={6}
          className="d-flex align-items-center justify-content-left login-right-side"
        >
          <div className="login-form-wrapper">
            <h5 className="mb-2">Welcome back! 👋</h5>
            <h3 className="mb-4">HR Login</h3>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleAdminLogin}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="text"
                  className="email-input"
                  placeholder="Please Enter your email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4" style={{ position: "relative" }}>
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  className="email-input"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "70%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                  }}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </Form.Group>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <Form.Check
                  type="checkbox"
                  label="Remember me"
                  className="remember-me-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />

                <span
                  onClick={() => setShowForgot(true)}
                  className="forgot-password-link"
                  style={{ cursor: "pointer" }}
                >
                  Forgot password?
                </span>
              </div>

              <ForgotPasswordPopup
                show={showForgot}
                onClose={() => setShowForgot(false)}
              />

              <Button variant="primary" type="submit" className="login-btn">
                Login
              </Button>

              {/* ⭐ GOOGLE LOGIN BUTTON */}
              {/* ⭐ OFFICIAL GOOGLE LOGIN BUTTON RENDER TARGET */}
              {/* Custom Google Login Button */}

              {/* Hidden official Google button */}

              <div className="custom-google-btn" onClick={() => googleLogin()}>
                <img src={gicon} alt="Google" className="google-icon" />
                <span>Continue with Google</span>
              </div>
            </Form>

            <div className="signup-text mt-4">
              <span>New to Stafio? </span>
              <Link to="/register-admin" className="signup-page">
                Sign up
              </Link>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLogin;
