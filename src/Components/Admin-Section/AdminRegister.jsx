import React, { useState } from "react";
import {
  Form,
  Button,
  Alert,
  Container,
  Row,
  Col,
  // ProgressBar,
  InputGroup,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import "./AdminRegister.css";

// Reuse same assets as login
import BGShape from "../../assets/BGShape.png";
import teampluslogo from "../../assets/stafio-bg-dark.png";
import Registerlogo from "../../assets/registerlogo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import apiClient from "../../utils/apiClient";
import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";
import gicon from "../../assets/favicon.ico";

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    password: "",
    confirmPassword: "",
    email: "",
    role: "admin",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  // const [strength, setStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  //new
  const [agree, setAgree] = useState(false);
  const [passwordRules, setPasswordRules] = useState({
    uppercase: false,
    number: false,
    length: false,
    special: false,
  });

  // regex validation for name,email and ph.number

  const nameRegex = /^[A-Za-z\s]{3,50}$/;
  const phoneRegex = /^[6-9]\d{9}$/; // Indian 10-digit mobile
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // new

  const allRulesPassed = Object.values(passwordRules).every(Boolean);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "password") {
      setPasswordRules({
        uppercase: /[A-Z]/.test(value),
        number: /\d/.test(value),
        length: password.length >= 8,
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      });
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError("");
    setMessage("");

    if (!Object.values(passwordRules).every(Boolean)) {
      //new
      setError("Password does not meet all requirements.");
      return;
    }

    if (!formData.username.trim()) {
      setError("Name is required.");
      return;
    }
    if (!nameRegex.test(formData.username)) {
      setError(
        "Name should contain only letters and spaces (min 3 characters).",
      );
      return;
    }

    // if (!formData.username || !formData.email) {
    //   setError("Username and email are required.");
    //   return;
    // }

    if (!formData.phone) {
      setError("Phone number required.");
      return;
    }
    if (!phoneRegex.test(formData.phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (!formData.email) {
      setError("Email is required.");
      return;
    }
    if (!emailRegex.test(formData.email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      // ⭐ NORMAL REGISTRATION
      const res = await apiClient.post("/register", {
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone,
        password: formData.password,
        role: "admin",
      });
      console.log("SUCCESS MESSAGE:", res.data?.message);

      if (res.status === 200 || res.status === 201) {
        setMessage(res.data?.message || "Registration successful!");
        setError("");

        setTimeout(() => {
          // optional redirect
          // navigate("/login");
        }, 1500);
        // Reset form

        setFormData({
          username: "",
          phone: "",
          password: "",
          confirmPassword: "",
          email: "",
          role: "admin",
        });

        setPasswordRules({
          uppercase: false,
          number: false,
          length: false,
          special: false,
        });
        return; //  !!stop execution here
      }

      setError("Registration failed.");
    } catch (err) {
      console.error("Register error:", err);
      // const apiMessage =
      // !! Only show error if backend REALLY failed

      if (err.response) {
        setError(err.response.data?.message || "Registration failed.");
      } else {
        // Network / redirect / google auth
        setError("");
      }

      // setError(apiMessage);
      // console.error("AdminRegister error:", err.response || err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, password: value }));
    setPasswordRules({
      uppercase: /[A-Z]/.test(value),
      number: /\d/.test(value),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      length: value.length >= 8,
    });
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, confirmPassword: value });
  }; // Determine progress bar color and label

  // const getVariant = () => {
  //   if (strength === 1) return "danger"; // Red
  //   if (strength === 2) return "warning"; // Yellow
  //   if (strength === 3) return "ok"; // orange
  //   if (strength === 4) return "success"; // Green
  //   return "secondary"; // Grey (empty)
  // };

  // const getLabel = () => {
  //   if (strength === 1) return "Weak";
  //   if (strength === 2) return "Moderate";
  //   if (strength === 3) return "Almost Strong";
  //   if (strength === 4) return "Strong";
  //   return "";
  // };

  // ---------------------------
  // ⭐ Google Register
  // ---------------------------
  const handleGoogleRegister = async (tokenResponse) => {
    try {
      setError("");
      setMessage("");
      // Get Google profile
      const userInfoRes = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        },
      );

      if (!userInfoRes.ok) {
        //new
        throw new Error("Failed to fetch Google profile");
      }

      const profile = await userInfoRes.json();

      // const googleEmail = profile.email;
      // const googleName = profile.name;

      // Send to backend for registration
      const res = await apiClient.post("/admin_google_register", {
        email: profile.email,
        username: profile.name,
        role: "admin",
      });

      console.log("GOOGLE SUCCESS MESSAGE:", res.data?.message);

      // ✅ Accept success properly
      if (res.status === 200 || res.status === 201) {
        setMessage(res.data?.message || "Google registration successful!");
        setError("");

        setTimeout(() => {
          // navigate("/login");
        }, 1500);

        return; // stop here
      }

      //  fallback
      setError("Google registration failed.");
    } catch (err) {
      console.error("Google register error:", err);

      //  Show error ONLY if backend responded
      if (err.response) {
        setError(err.response.data?.message || "Google registration failed.");
      } else {
        setError(""); // silent fail (popup / redirect issues)
      }
    }
  };

  const googleRegister = useGoogleLogin({
    onSuccess: handleGoogleRegister,
    onError: () => {
      //  console.warn("Google auth cancelled or failed:", err);
      setError(""); // do NOT show error here
    },
  });

  return (
    <Container fluid className="admin-register-container">
      <Row className="vh-100">
        {/* ===== LEFT SIDE ===== */}
        <Col
          md={6}
          className="register-left d-flex flex-column align-items-center justify-content-center"
        >
          <img src={BGShape} alt="Background Shape" className="bg-shape" />

          <div className="register-left-content text-center">
            <div className="register-logos mb-3">
              <img
                src={teampluslogo}
                alt="Team Plus Logo"
                className="teamplus-logo"
              />
            </div>

            <h2 className="register-heading">One Portal,</h2>
            <h4 className="register-subheading">Unlimited Potential</h4>

            <p className="register-description">
              Create your account — It only takes a minute!
            </p>
          </div>

          <img
            src={Registerlogo}
            alt="Register Illustration"
            className="register-illustration"
          />
        </Col>

        {/* ===== RIGHT SIDE ===== */}
        <Col
          md={6}
          className="d-flex align-items-center justify-content-left bg-white"
        >
          <div className="register-form-wrapper">
            <h5 className="mb-2">Just a Few Details to Begin</h5>
            <h3 className="mb-4">Sign Up</h3>

            {message && <Alert variant="success">{message}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  placeholder="Please enter your name"
                  value={formData.username}
                  onChange={(e) => {
                    //new
                    const value = e.target.value;
                    if (/^[A-Za-z\s]*$/.test(value)) {
                      handleChange(e);
                    }
                  }}
                  // required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  placeholder="Please enter your phone number"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,10}$/.test(value)) {
                      handleChange(e);
                    }
                  }}
                  // required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Please enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  // required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>

                {/* Input with eye toggle */}
                <InputGroup className="align-items-center">
                  <div style={{ position: "relative" }}>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handlePasswordChange}
                      required
                      style={{ paddingRight: "40px" }} // add space for the eye icon
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        color: "#6c757d",
                      }}
                    >
                      {showPassword ? (
                        <FaEye size={18} />
                      ) : (
                        <FaEyeSlash size={18} />
                      )}
                    </span>
                  </div>
                </InputGroup>

                {!allRulesPassed && formData.password && (
                  <div
                    className="password-rules"
                    style={{ marginTop: "8px", fontSize: "12px", gap: "2px" }}
                  >
                    <ul>
                      <li
                        className={
                          passwordRules.uppercase ? "valid" : "invalid"
                        }
                      >
                        At least one uppercase letter
                      </li>
                      <li
                        className={passwordRules.number ? "valid" : "invalid"}
                      >
                        At least one number
                      </li>
                      <li
                        className={passwordRules.length ? "valid" : "invalid"}
                      >
                        Minimum 8 characters
                      </li>
                      <li
                        className={passwordRules.special ? "valid" : "invalid"}
                      >
                        At least one special character
                      </li>
                    </ul>
                  </div>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <InputGroup className="align-items-center">
                  <div style={{ position: "relative" }}>
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Enter confirm password"
                      value={formData.confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      required
                      style={{ paddingRight: "40px" }}
                    />
                    <span
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        color: "#6c757d",
                      }}
                    >
                      {showConfirmPassword ? (
                        <FaEye size={18} />
                      ) : (
                        <FaEyeSlash size={18} />
                      )}
                    </span>
                  </div>
                </InputGroup>
              </Form.Group>

              <>
                <div className="terms-container">
                  <input
                    type="checkbox"
                    id="terms"
                    className="terms-checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                  />
                  <label htmlFor="terms" className="terms-label">
                    I agree to all the{" "}
                    <span className="terms-link">Terms & Conditions</span>
                  </label>
                </div>

                <Button
                  variant="primary"
                  type="submit"
                  className="register-btn"
                  disabled={!agree}
                >
                  Sign Up
                </Button>
              </>

              {/* -------- Google Register Button -------- */}
              <div className="text-center my-3">
                <button
                  type="button"
                  // onClick={() => googleRegister()}
                  className="google-btn"
                  disabled={isSubmitting}
                  onClick={() => {
                    setError("");
                    // setMessage("");
                    googleRegister();
                  }}
                >
                  <img
                    src={gicon}
                    alt="Google"
                    // style={{ width: "20px", marginRight: "10px" }}
                    className="google-icon"
                  />
                  <span
                    style={{ color: "#19bde9", fontWeight: 600, fontSize: 18 }}
                  >
                    Continue with Google
                  </span>
                </button>
              </div>

              <div className="text-center mt-3">
                <small>
                  Already have an account?{" "}
                  <Link to="/" className="login-link">
                    Log in
                  </Link>
                </small>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminRegister;
