import React, { useState } from "react";
import {
  Form,
  Button,
  Alert,
  Container,
  Row,
  Col,
  ProgressBar,
  InputGroup,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import "./EmployeeRegister.css";

import BGShape from "../../assets/BGShape.png";
import teampluslogo from "../../assets/stafioimg.png";
import Registerlogo from "../../assets/registerlogo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import apiClient from "../../utils/apiClient";
import { useGoogleLogin } from "@react-oauth/google";
import gicon from "../../assets/favicon.ico";

const EmployeeRegister = () => {
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    password: "",
    confirmPassword: "",
    email: "",
    role: "employee",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [strength, setStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agree, setAgree] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const evaluatePasswordStrength = (value) => {
    let score = 0;
    if (/[A-Z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (value.length >= 8) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) score += 1;
    return score;
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, password: value });
    setStrength(evaluatePasswordStrength(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError("");
    setMessage("");

    if (!formData.username || !formData.email) {
      setError("Username and email are required.");
      return;
    }

    if (!formData.phone) {
      setError("Phone number is required.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await apiClient.post("/register", {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: "employee",
      });

      setMessage(res.data?.message || "Registration successful!");

      setFormData({
        username: "",
        phone: "",
        password: "",
        confirmPassword: "",
        email: "",
        role: "employee",
      });
      setStrength(0);
    } catch (err) {
      const apiMessage = err.response?.data?.message || "Registration failed.";
      setError(apiMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVariant = () => {
    if (strength === 1) return "danger";
    if (strength === 2) return "warning";
    if (strength === 3) return "ok";
    if (strength === 4) return "success";
    return "secondary";
  };

  const getLabel = () => {
    if (strength === 1) return "Weak";
    if (strength === 2) return "Moderate";
    if (strength === 3) return "Almost Strong";
    if (strength === 4) return "Strong";
    return "";
  };

  // ⭐ Employee Google Register
  const handleGoogleEmployeeRegister = async (tokenResponse) => {
    try {
      const userInfoRes = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        },
      );

      const profile = await userInfoRes.json();

      const googleEmail = profile.email;
      const googleName = profile.name;

      const res = await apiClient.post("/employee_google_register", {
        email: googleEmail,
        username: googleName,
        role: "employee",
      });

      setMessage(res.data?.message || "Google registration successful!");
      setError("");
    } catch (err) {
      setError("Google registration failed.");
    }
  };

  const googleRegister = useGoogleLogin({
    onSuccess: handleGoogleEmployeeRegister,
    onError: () => setError("Google registration failed."),
  });

  return (
    <Container fluid className="admin-register-container">
      <Row className="vh-100">
        {/* LEFT SIDE */}
        <Col
          md={6}
          className="register-left d-flex flex-column align-items-center justify-content-center"
        >
          <img src={BGShape} alt="Background" className="bg-shape" />
          <div className="register-left-content text-center">
            <div className="register-logos mb-3">
              <img src={teampluslogo} alt="Logo" className="teamplus-logo" />
            </div>

            <h2 className="register-heading">One Portal,</h2>
            <h4 className="register-subheading">Unlimited Potential</h4>

            <p className="register-description">
              Create your employee account — It only takes a minute!
            </p>
          </div>

          <img
            src={Registerlogo}
            alt="Register Illustration"
            className="register-illustration"
          />
        </Col>

        {/* RIGHT SIDE */}
        <Col
          md={6}
          className="d-flex align-items-center justify-content-left bg-white"
        >
          <div className="register-form-wrapper">
            <h5 className="mb-2">Just a Few Details to Begin</h5>
            <h3 className="mb-4">Employee Sign Up</h3>

            {message && <Alert variant="success">{message}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  placeholder="Please enter your name"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  placeholder="Please enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
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
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <InputGroup>
                  <div style={{ position: "relative" }}>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handlePasswordChange}
                      required
                      style={{ paddingRight: "40px" }}
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
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </span>
                  </div>
                </InputGroup>

                {formData.password && (
                  <div style={{ marginTop: "8px" }}>
                    <ProgressBar
                      now={(strength / 4) * 100}
                      variant={getVariant()}
                      animated
                      label={getLabel()}
                    />
                  </div>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <InputGroup>
                  <div style={{ position: "relative" }}>
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Enter confirm password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
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
                      {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                    </span>
                  </div>
                </InputGroup>
              </Form.Group>
              <div className="terms-container">
                <input
                  type="checkbox"
                  id="terms"
                  className="terms-checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  required
                />
                <label htmlFor="terms" className="terms-label">
                  I agree to all the{" "}
                  <span className="terms-link">Terms & Conditions</span>
                </label>
              </div>

              <Button variant="primary" type="submit" className="register-btn">
                Sign Up
              </Button>

              {/* Google Register Button */}
              <div className="text-center my-3">
                <button
                  type="button"
                  onClick={() => googleRegister()}
                  className="google-btn"
                >
                  <img
                    src={gicon}
                    alt="Google"
                    style={{ width: "20px", marginRight: "10px" }}
                  />
                  <span
                    style={{
                      color: "#19bde9",
                      fontWeight: 600,
                      fontSize: 18,
                    }}
                  >
                    Continue with Google
                  </span>
                </button>
              </div>

              <div className="text-center mt-3">
                <small>
                  Already have an account?{" "}
                  <Link to="/employee-login" className="login-link">
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

export default EmployeeRegister;
