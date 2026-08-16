import React, { useState, useEffect } from "react";
// import { FaEdit, FaTimes } from "react-icons/fa"; // Removed as replaced by custom SVGs
import "./LeavePolicies.css";
import AdminSidebar from "../AdminSidebar";
import Topbar from "../Topbar";
import group10 from "../../../assets/Group10.png";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../utils/apiClient";

const LeavePolicies = () => {
  const [leavePolicies, setLeavePolicies] = useState([]);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    leaveName: "",
    description: "",
    maxDays: 12,
    applicability: "",
    leaveType: "",
    gender: [],
  });

  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  //initial state + reset function
  const initialFormState = {
    leaveName: "",
    description: "",
    maxDays: 0,
    applicability: "",
    leaveType: "",
    gender: [],
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setErrors({});
  };

  //Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Allow only digits for maxDays
    if (name === "maxDays" && !/^\d*$/.test(value)) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  //Handle gender checkbox
  const handleGenderChange = (e) => {
    const { value, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      gender: checked
        ? [...prev.gender, value]
        : prev.gender.filter((g) => g !== value),
    }));

    setErrors((prev) => ({ ...prev, gender: "" }));
  };

  //Validation function
  const validateForm = () => {
    let newErrors = {};

    // Leave Name: mandatory, alphabets + numbers
    const nameRegex = /^[a-zA-Z0-9 ]+$/;
    if (!formData.leaveName.trim()) {
      newErrors.leaveName = "*Leave name is required";
    } else if (!nameRegex.test(formData.leaveName)) {
      newErrors.leaveName = "*Only alphabets and numbers allowed";
    }

    // Max Days: positive number
    if (!formData.maxDays || Number(formData.maxDays) <= 0) {
      newErrors.maxDays =
        "*Maximum days allowed per year must be greater than 0";
    } else if (Number(formData.maxDays) > 12) {
      newErrors.maxDays = "*Maximum allowed days per year is 12";
    }

    // Applicability
    if (!formData.applicability) {
      newErrors.applicability = "*Please select applicability";
    }

    // Gender
    if (formData.gender.length === 0) {
      newErrors.gender = "*Please select at least one gender";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildApplicabilityType = (applicability, gender) => {
    if (!applicability) return "All";

    if (gender.length === 1) {
      return `${applicability} (${gender[0]} only)`;
    }

    if (gender.length > 1) {
      return `${applicability} (Male & Female)`;
    }

    return applicability;
  };

  const fetchleavepolicies = async () => {
    try {
      const response = await apiClient.get("/api/leavepolicies");
      setLeavePolicies(response.data);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    }
  };

  //Save button handler (NO refresh)
  const handleSave = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = {
      name: formData.leaveName,
      description: formData.description,
      max_days: Number(formData.maxDays),
      type: buildApplicabilityType(
        formData.applicability || "All",
        formData.gender,
      ),
    };

    try {
      if (isEdit) {
        // 🔄 UPDATE
        await apiClient.put(`/api/leavepolicies/${editId}`, payload);
      } else {
        // ➕ CREATE (future-ready)
        await apiClient.post("/api/leavepolicies", payload);
      }

      // Refresh table
      const res = await apiClient.get("/api/leavepolicies");
      setLeavePolicies(res.data);

      resetForm();
      setIsEdit(false);
      setEditId(null);
      setShowModal(false);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  useEffect(() => {
    fetchleavepolicies();
  }, []);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this leave policy?"))
      return;

    await fetch(`/api/leavepolicies/${id}`, {
      method: "DELETE",
    });

    fetchleavepolicies(); // refresh list
  };

  const openEditModal = (policy) => {
    setIsEdit(true);
    setEditId(policy.id);

    setFormData({
      leaveName: policy.name || "",
      description: policy.description || "",
      maxDays: policy.max_days || 0,
      applicability: policy.type || "All", // mapping backend → frontend
      leaveType: policy.name || "",
      gender: [], // backend doesn’t have gender yet
    });

    setErrors({});
    setShowModal(true);
  };

  return (
    <div className="leave-policies-layout">
      <div className="rightside-logo ">
        <img src={group10} alt="logo" className="rightside-logos" />
      </div>
      <AdminSidebar />
      <div className="leave-policies-main">
        <Topbar />

        {/* ===== Header Section ===== */}
        <div className="leave-policies-header">
          <h2 className="leave-policies-title">Leave Policies</h2>
          <button
            className="leave-policies-add-btn"
            onClick={() => setShowModal(true)}
          >
            <div className="add-btn-icon-circle">
              <span className="plus-symbol">+</span>
            </div>
            Add Leave Type
          </button>
        </div>

        {/* ===== Table Section ===== */}
        <table className="leave-policies-table">
          <thead>
            <tr>
              <th>Leave Name</th>
              <th>Created On</th>
              <th>Leave Type</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {leavePolicies.map((policy, index) => (
              <tr key={index}>
                <td>{policy.name}</td>
                <td>{policy.createdOn}</td>
                <td>{policy.type}</td>
                <td className="leave-policies-actions text-center">
                  <button
                    className="leave-policies-edit-btn"
                    onClick={() => openEditModal(policy)}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    className="leave-policies-delete-btn"
                    onClick={() => handleDelete(policy.id)}
                  >
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="14" cy="14" r="12" fill="#FF3B30"/>
                      <path d="M10 10L18 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M18 10L10 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ===== Modal Section ===== */}
        {showModal && (
          <div className="leave-policies-overlay">
            <div className="leave-policies-modal">
              {/* Header */}
              <div className="leave-policies-modal-header">
                <h3 className="leave-policies-modal-title">
                  {isEdit ? "Edit Leave Policy" : "Add New Leave"}
                </h3>
                <button
                  className="leave-policies-close-btn"
                  onClick={() => {
                    resetForm();
                    setIsEdit(false);
                    setEditId(null);
                    setShowModal(false);
                  }}
                >
                  ×
                </button>
              </div>

              {/* Body */}
              <div className="leave-policies-modal-body">
                <form className="leave-policies-form">
                  <div className="leave-policies-form-content">
                    <div className="leave-policies-field">
                      <label>Leave Name</label>
                      <input
                        type="text"
                        name="leaveName"
                        value={formData.leaveName}
                        onChange={handleChange}
                        placeholder="Please enter name"
                        className="leave-policies-input"
                      />
                      {errors.leaveName && (
                        <p className="leave-policies-error">
                          {errors.leaveName}
                        </p>
                      )}
                    </div>

                    <div className="leave-policies-field">
                      <label>Description</label>
                      <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Please enter description"
                        className="leave-policies-input"
                      />
                    </div>

                    <div className="leave-policies-field">
                      <label>Maximum Days Allowed</label>
                      <input
                        type="number"
                        name="maxDays"
                        value={formData.maxDays}
                        onChange={handleChange}
                        placeholder="Please enter number of days"
                        className="leave-policies-input"
                        onWheel={(e) => e.target.blur()}
                        min="1"
                      />
                      {errors.maxDays && (
                        <p className="leave-policies-error">{errors.maxDays}</p>
                      )}
                    </div>

                    <div className="leave-policies-field">
                      <label>Applicability</label>
                      <select
                        className="leave-policies-select"
                        name="applicability"
                        value={formData.applicability}
                        onChange={handleChange}
                      >
                        <option value="">Select</option>
                        <option value="All">All Employee</option>
                        <option value="Specific">Specific Employee</option>
                        <option value="Department">Department-wise</option>
                      </select>
                      {errors.applicability && (
                        <p className="leave-policies-error">
                          {errors.applicability}
                        </p>
                      )}
                    </div>

                    <div className="leave-policies-field">
                      <label>Leave Type</label>
                      <select className="leave-policies-select">
                        <option>All</option>
                        <option>Sick Leave</option>
                        <option>Casual Leave</option>
                        <option>Annual Leave</option>
                      </select>
                    </div>

                    <div className="leave-policies-field">
                      <label>Gender</label>
                      <div className="leave-policies-checkbox-group">
                        <label className="leave-policies-checkbox-label">
                          <input
                            type="checkbox"
                            value="Male"
                            checked={formData.gender.includes("Male")}
                            onChange={handleGenderChange}
                            className="leave-policies-checkbox"
                          />
                          <span>Male</span>
                        </label>

                        <label className="leave-policies-checkbox-label">
                          <input
                            type="checkbox"
                            value="Female"
                            checked={formData.gender.includes("Female")}
                            onChange={handleGenderChange}
                            className="leave-policies-checkbox"
                          />
                          <span>Female</span>
                        </label>
                        {errors.gender && (
                          <p className="leave-policies-error">
                            {errors.gender}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="leave-policies-modal-footer">
                <button
                  type="button"
                  className="leave-policies-save-btn"
                  onClick={handleSave}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="leave-policies-cancel-btn"
                  onClick={() => {
                    resetForm();
                    setShowModal(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeavePolicies;
