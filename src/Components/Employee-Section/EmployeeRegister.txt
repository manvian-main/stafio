import React, { useState } from "react";
import axios from "axios";
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

// Reuse same assets as Admin page
import BGShape from "../../assets/BGShape.png";
import teampluslogo from "../../assets/stafioimg.png";
import Registerlogo from "../../assets/registerlogo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const EmployeeRegister = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    first_name: "",
    last_name: "",
    role: "employee",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await axios.post("http://127.0.0.1:5001/register", formData);
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setFormData({ ...formData, password: value }); // ✅ Update formData.password

    let strengthScore = 0;

    if (/[A-Z]/.test(value)) strengthScore += 1;
    if (/\d/.test(value)) strengthScore += 1;
    if (value.length >= 8) strengthScore += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) strengthScore += 1;

    setStrength(strengthScore);
  };

  // Determine progress bar color and label
  const getVariant = () => {
    if (strength === 1) return "danger"; // Red
    if (strength === 2) return "warning"; // Yellow
    if (strength === 3) return "ok"; // orange
    if (strength === 4) return "success"; // Green
    return "secondary"; // Grey (empty)
  };

  const getLabel = () => {
    if (strength === 1) return "Weak";
    if (strength === 2) return "Moderate";
    if (strength === 3) return "Almost Strong";
    if (strength === 4) return "Strong";
    return "";
  };

  return (
    <Container fluid className="employee-register-container">
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
                className="teampluss-logo"
              />
            </div>

            <h2 className="register-heading">Welcome Employee,</h2>
            <h4 className="register-subheading">Let’s Get Started</h4>

            <p className="register-description">
              Join the team and explore your full potential today!
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
            <h3 className="mb-4">Employee Sign Up</h3>

            {message && <Alert variant="success">{message}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleChange}
                  required
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

                {/* Progress bar */}
                {password && (
                  <div style={{ marginTop: "8px" }}>
                    <ProgressBar
                      now={(strength / 4) * 100}
                      variant={getVariant()}
                      animated
                      label={getLabel()}
                    />
                    <div style={{ fontSize: "13px", marginTop: "4px" }}>
                      <span style={{ color: strength >= 4 ? "green" : "red" }}>
                        • At least one uppercase
                      </span>
                      <br />
                      <span style={{ color: strength >= 4 ? "green" : "red" }}>
                        • At least one number
                      </span>
                      <br />
                      <span style={{ color: strength >= 4 ? "green" : "red" }}>
                        • Minimum 8 characters
                      </span>
                      <br />
                      <span style={{ color: strength >= 4 ? "green" : "red" }}>
                        • At least one special character
                      </span>
                    </div>
                  </div>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="first_name"
                  placeholder="Enter first name"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="last_name"
                  placeholder="Enter last name"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="register-btn">
                Sign Up
              </Button>

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
