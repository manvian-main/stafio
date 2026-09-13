import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import "./ForgotPasswordPopup.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { sendOtp, verifyOtp, resetPassword } from "../../services/authService";

const ForgotPasswordPopup = ({ show, onClose }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [step, setStep] = useState(1);

  const [showPassword, setShowPassword] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // STEP 1 → SEND OTP
  const handleSendOtp = async () => {
    setErrorMsg("");
    try {
      await sendOtp(email);
      setStep(2);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to send OTP.");
    }
  };

  // STEP 2 → VERIFY OTP
  const handleVerifyOtp = async () => {
    setErrorMsg("");
    try {
      await verifyOtp(email, otp);
      setStep(3); // go to reset password page
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Invalid OTP.");
    }
  };

  // STEP 3 → RESET PASSWORD
  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    try {
      await resetPassword(email, otp, newPassword);
      setStep(4); // success page
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to reset password.");
    }
  };

  // CLOSE POPUP
  const handleCloseAll = () => {
    setEmail("");
    setNewPassword("");
    setConfirmPassword("");
    setOtp("");
    setErrorMsg("");
    setStep(1);
    onClose();
  };

  return (
    <>
      {/* STEP 1: ENTER EMAIL */}
      <Modal show={show && step === 1} onHide={handleCloseAll} centered className="forgot-password-modal">
        <Modal.Body className="p-4">
          <h3 className="mb-3 forgot-password-title">Forgot password</h3>
          <p className="forgot-password-desc">Enter your email for the verification proccess,we will send 4 digits code to your email.</p>

          {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

          <Form.Group className="mb-4">
            <Form.Label className="forgot-password-label">E mail</Form.Label>
            <Form.Control
              type="email"
              className="forgot-password-input"
              placeholder="enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          <Button className="w-100 forgot-password-btn" onClick={handleSendOtp}>
            CONTINUE
          </Button>
        </Modal.Body>
      </Modal>

      {/* STEP 2: ENTER OTP */}
      <Modal show={show && step === 2} onHide={handleCloseAll} centered className="forgot-password-modal">
        <Modal.Body className="p-4">
          <h4 className="mb-3">Verify OTP</h4>

          {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Enter OTP</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter the 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </Form.Group>

          <Button className="w-100" onClick={handleVerifyOtp}>
            VERIFY OTP
          </Button>
        </Modal.Body>
      </Modal>

      {/* STEP 3: RESET PASSWORD */}
      <Modal show={show && step === 3} onHide={handleCloseAll} centered className="forgot-password-modal">
        <Modal.Body className="p-4">
          <h4 className="mb-3">Reset Password</h4>

          {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

          <Form.Group className="mb-3" style={{ position: "relative" }}>
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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

          <Form.Group className="mb-3" style={{ position: "relative" }}>
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type={showPassword1 ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <span
              onClick={() => setShowPassword1(!showPassword1)}
              style={{
                position: "absolute",
                right: "10px",
                top: "70%",
                transform: "translateY(-50%)",
                cursor: "pointer",
              }}
            >
              {showPassword1 ? <FaEye /> : <FaEyeSlash />}
            </span>
          </Form.Group>

          <Button className="w-100" onClick={handlePasswordUpdate}>
            UPDATE PASSWORD
          </Button>
        </Modal.Body>
      </Modal>

      {/* STEP 4: SUCCESS */}
      <Modal show={show && step === 4} onHide={handleCloseAll} centered className="forgot-password-modal">
        <Modal.Body className="p-4 text-center">
          <h4>Password Updated</h4>
          <p>Your password has been successfully updated.</p>

          <Button className="w-100 mt-3" onClick={handleCloseAll}>
            OK
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ForgotPasswordPopup;
