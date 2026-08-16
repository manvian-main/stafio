import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./EmployeeLogin.css";

import Imagelogin from "../../assets/Imagelogin.png";
import BGShape from "../../assets/BGShape.png";
import teampluslogo from "../../assets/stafio-bg-dark.png";
import ForgotPasswordPopup from "../Admin-Section/ForgotPasswordPopup";
import gicon from "../../assets/favicon.ico";

import { useGoogleLogin } from "@react-oauth/google";
import { saveSession } from "../../utils/sessionManager";

const EmployeeLogin = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const googleInitRef = useRef(false);

  // -------------------------------------------------------------------
  // ⭐ NORMAL EMPLOYEE LOGIN
  // -------------------------------------------------------------------
  const handleEmployeeLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const response = await fetch("http://127.0.0.1:5001/employee_login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();
      if (response.ok) {
        // ✅ Use standardized session management to store user data and tokens correctly
        saveSession(data, "employee");

        // ⭐ Remember Me logic (only store email for pre-fill, never password)
        if (rememberMe) {
          localStorage.setItem("remember_employee", "true");
          localStorage.setItem("employee_email", identifier);
          // Password is NOT stored — refresh token handles session persistence
        } else {
          localStorage.removeItem("remember_employee");
          localStorage.removeItem("employee_email");
        }
        // Clean up any previously stored password (security fix)
        localStorage.removeItem("employee_password");
        localStorage.removeItem("remember_email");
        localStorage.removeItem("remember_password");

        navigate("/employee-dashboard");
      } else {
        setErrorMsg(data.message || "Login failed");
      }
    } catch (err) {
      setErrorMsg("Network error. Check if backend is running.");
    }
  };

  // -------------------------------------------------------------------
  // ⭐ EMPLOYEE GOOGLE LOGIN (same method as Admin)
  // -------------------------------------------------------------------
  // const handleGoogleLogin = (credentialResponse) => {
  //   if (!credentialResponse || !credentialResponse.credential) {
  //     setErrorMsg("Google login cancelled or failed.");
  //     return;
  //   }

  //   fetch("http://127.0.0.1:5001/employee_google_login", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       id_token: credentialResponse.credential,
  //       role: "employee",
  //     }),
  //   })
  //     .then((res) => res.json())
  //     .then((data) => {
  //       if (data.user_id) {
  //         localStorage.setItem("employee_user_id", data.user_id);
  //         localStorage.setItem("employee_role", data.role);
  //         localStorage.setItem("employee_username", data.username);

  //         if (rememberMe) {
  //           localStorage.setItem("remember_employee", "true");
  //           localStorage.setItem("remember_google", "true");
  //           localStorage.setItem("employee_google_email", data.email);
  //           localStorage.setItem("employee_google_name", data.username);
  //         } else {
  //           localStorage.removeItem("remember_google");
  //           localStorage.removeItem("employee_google_email");
  //           localStorage.removeItem("employee_google_name");
  //         }

  //         navigate("/employee-dashboard");
  //       } else {
  //         setErrorMsg(data.message || "Google login failed");
  //       }
  //     })
  //     .catch(() => setErrorMsg("Google login failed"));
  // };

  const googleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch("http://127.0.0.1:5001/employee_google_login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: tokenResponse.access_token,
            role: "employee",
          }),
        });

        const data = await res.json();

        if (data.user_id) {

          // ✅ Use standardized session management
          saveSession(data, "employee");
          navigate("/employee-dashboard");
        } else {
          setErrorMsg("Google login failed");
        }
      } catch {
        setErrorMsg("Google login failed");
      }
    },
    onError: () => setErrorMsg("Google login failed"),
  });

  // -------------------------------------------------------------------
  // ⭐ INITIALIZE GOOGLE LOGIN BUTTON (same as Admin)
  // -------------------------------------------------------------------
  // useEffect(() => {
  //   /* global google */
  //   window.google.accounts.id.initialize({
  //     client_id:
  //       "337074822738-kaucna6a1olvoo8qfvs8r320iekp9hi1.apps.googleusercontent.com",
  //     callback: handleGoogleLogin,
  //     ux_mode: "popup",
  //     auto_select: false,
  //   });

  //   window.google.accounts.id.renderButton(
  //     document.getElementById("googleEmployeeLoginButton"),
  //     {
  //       theme: "outline",
  //       size: "large",
  //       width: 400,
  //       text: "continue_with",
  //     }
  //   );
  // }, []);

  // -------------------------------------------------------------------
  // ⭐ AUTO LOGIN (Normal + Google)
  // -------------------------------------------------------------------
  useEffect(() => {
    const remember = localStorage.getItem("remember_employee");
    const isGoogle = localStorage.getItem("remember_google") === "true";

    if (remember === "true" && isGoogle) {
      const idToken = localStorage.getItem("remember_google_token");
      if (!idToken) return;

      fetch("http://127.0.0.1:5001/employee_google_login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_token: idToken,
          role: "employee",
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user_id) {

            // ✅ Use standardized session management
            saveSession(data, "employee");
            navigate("/employee-dashboard");
          }
        });

      return;
    }

    if (remember === "true" && !isGoogle) {
      // Pre-fill email only (no password stored anymore)
      setIdentifier(localStorage.getItem("employee_email") || "");
      // If refresh token exists, auto-navigate (session still valid)
      if (localStorage.getItem("refresh_token")) {
        navigate("/employee-dashboard");
      }
    }
  }, []);

  return (
    <Container fluid className="employee-login-container">
      <Row className="vh-100">
        {/* LEFT SIDE */}
        <Col
          md={6}
          className="login-left d-flex flex-column align-items-center justify-content-center"
        >
          <img src={BGShape} className="bg-shape" alt="Background Shape" />

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
            className="login-illustrations"
            alt="Login Illustration"
          />
        </Col>

        {/* RIGHT SIDE */}
        <Col
          md={6}
          className="d-flex align-items-center justify-content-left login-right-side"
        >
          <div className="login-form-wrapper">
            <h5 className="mb-2">Welcome back! 👋</h5>
            <h3 className="mb-4">Employee Login</h3>

            {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

            <Form onSubmit={handleEmployeeLogin}>
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
                  className="forgot-password-link" //new
                  style={{ cursor: "pointer" }}
                >
                  Forgot password?
                </span>
              </div>

              <ForgotPasswordPopup
                show={showForgot}
                onClose={() => setShowForgot(false)}
              />

              <Button className="login-btn" type="submit" variant="primary">
                Login
              </Button>

              {/* ⭐ GOOGLE LOGIN BUTTON (SAME AS ADMIN) */}
              <div className="custom-google-btn" onClick={() => googleLogin()}>
                <img src={gicon} alt="Google" className="google-icon" />
                <span>Continue with Google</span>
              </div>
            </Form>

            <div className="signup-text mt-4">
              <span>New to Stafio? </span>
              <Link to="/register-employee" className="signup-page">
                Sign up
              </Link>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default EmployeeLogin;
