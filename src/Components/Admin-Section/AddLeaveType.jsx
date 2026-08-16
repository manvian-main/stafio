import React, { useState, useEffect } from "react";
import { Button, Card, Container, Form, Alert } from "react-bootstrap";
import apiClient from "../../utils/apiClient";
import AdminSidebar from "./AdminSidebar";

const AddLeaveType = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    max_days_per_year: 12,
  });

  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");

    if (!userId || role !== "admin") {
      setMessage("Please log in as an admin before adding a leave type.");
      setVariant("danger");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "max_days_per_year" ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await apiClient.post("/leave_types", formData, {
        headers: {
          "Content-Type": "application/json",
          "X-User-Role": localStorage.getItem("role"),
          "X-User-ID": localStorage.getItem("userId"),
        },
        withCredentials: true, // ✅ send cookies if needed
      });

      setVariant("success");
      setMessage(`Leave type added successfully! ID: ${res.data.id}`);
      setFormData({ name: "", description: "", max_days_per_year: 12 });
    } catch (err) {
      setVariant("danger");
      setMessage(err?.response?.data?.message || "Failed to add leave type.");
    }
  };

  return (
    <div className="d-flex">
      <AdminSidebar />
      <Container className="mt-4">
        <Card>
          <Card.Body>
            <Card.Title>Add Leave Type</Card.Title>
            {message && <Alert variant={variant}>{message}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group>
                <Form.Label>Leave Type Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>Max Days Per Year</Form.Label>
                <Form.Control
                  type="number"
                  name="max_days_per_year"
                  value={formData.max_days_per_year}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Button
                className="mt-4"
                type="submit"
                disabled={variant === "danger"}
              >
                Add Leave Type
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default AddLeaveType;
