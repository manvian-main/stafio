import React, { useState, useEffect, useRef } from "react";
import "./MyRegularization.css";
import { FaEdit, FaTimesCircle, FaFilter, FaUpload } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import illustration from "../../../assets/Timemgnt.png";
import AdminSidebar from "../AdminSidebar";
import Topbar from "../Topbar";
import { useNavigate } from "react-router-dom";
import group10 from "../../../assets/Group10.png";
import apiClient from "../../../utils/apiClient";

export default function MyRegularization() {
  const [showModal, setShowModal] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter states
  const [filterName, setFilterName] = useState("");
  const [filterLeaveType, setFilterLeaveType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const filterRef = useRef(null);
  const filterButtonRef = useRef(null);

  const [regularizationData, setRegularizationData] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user_id: "",
    date: "",
    session_type: "Full Day",
    attendance_type: "Present",
    reason: "",
  });
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const fetchMyRegularizations = async () => {
      try {
        const userId = localStorage.getItem("current_user_id");
        const userRole = localStorage.getItem("current_role");
        if (!userId) return;

        const response = await apiClient.get("/api/myregularization", {
          headers: {
            "X-User-ID": userId,
            "X-User-Role": userRole,
          },
        });

        setRegularizationData(response.data);
      } catch (error) {
        console.error("Error fetching admin regularization data:", error);
      }
    };

    fetchMyRegularizations();
  }, []);

  const filteredAndSortedLeaves = regularizationData.filter((leave) =>
    filterStatus === "All" ? true : leave.status === filterStatus,
  );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedLeaves.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  // Ensure totalPages is at least 1 so "01" always shows
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedLeaves.length / itemsPerPage));

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterName, searchTerm]);

  const handleResetFilter = () => {
    setFilterName("");
    setFilterLeaveType("All");
    setFilterStatus("All");
  };

  const handleApplyFilter = () => {
    setShowFilterPopup(false);
  };

  // Close filter popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showFilterPopup &&
        filterRef.current &&
        !filterRef.current.contains(event.target) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(event.target)
      ) {
        setShowFilterPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilterPopup]);

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

  const handleSubmitRegularization = async () => {
    const userId = localStorage.getItem("current_user_id");
    const userRole = localStorage.getItem("current_role");
    console.log(userId);
    try {
      if (isEdit) {
        // ✏️ EDIT
        await apiClient.put(`/api/regularization/${editId}`, formData, {
          headers: { "X-User-ID": userId, "X-User-Role": userRole },
        });

        alert("Regularization updated successfully");
      } else {
        // ➕ ADD
        await apiClient.post("/api/regularization", formData, {
          headers: { "X-User-ID": userId, "X-User-Role": userRole },
        });

        alert("Regularization added successfully");
      }

      // Reset modal & state
      setShowModal(false);
      setIsEdit(false);
      setEditId(null);
      setFormData({
        user_id:
          localStorage.getItem("employee_user_id") ||
          localStorage.getItem("current_user_id"),
        date: "",
        session_type: "Full Day",
        attendance_type: "Present",
        reason: "",
      });

      // Refresh table
      const res = await apiClient.get("/api/myregularization", {
        headers: { "X-User-ID": userId, "X-User-Role": userRole },
      });
      setRegularizationData(res.data);
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Something went wrong. Please try again.",
      );
    }
  };

  const handleEdit = (row) => {
    if (row.status !== "Pending") return;

    setIsEdit(true);
    setEditId(row.id);

    setFormData({
      user_id:
        localStorage.getItem("employee_user_id") ||
        localStorage.getItem("current_user_id"),
      date: row.date.split("/")[0].split("-").reverse().join("-"),
      session_type: row.date.split("/")[1] || "Full Day",
      attendance_type: row.attendanceType,
      reason: row.reason || "",
    });

    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this regularization?")) return;

    const userId = localStorage.getItem("current_user_id");

    try {
      await apiClient.delete(`/api/regularization/${id}`, {
        headers: { "X-User-ID": userId },
      });
      setRegularizationData((prev) => prev.filter((item) => item.id !== id));
      alert("Regularization deleted successfully");
    } catch (error) {
      console.error("Error deleting regularization:", error);
      alert(error.response?.data?.message || "Failed to delete regularization");
    }
  };

  return (
    <div className="layout">
      <div className="rightside-logo">
        <img src={group10} alt="logo" className="rightside-logos" />
      </div>
      <AdminSidebar />
      <div className="regularization-container">
        <Topbar />
        <h2 className="page-title">My Regularization Listing</h2>

        {/* Action Buttons */}
        <div className="regularization-actions">
          <button
            className="btn-regularization-add"
            onClick={() => {
              setFormData({
                user_id:
                  localStorage.getItem("employee_user_id") ||
                  localStorage.getItem("current_user_id"),
                date: "",
                session_type: "Full Day",
                attendance_type: "Present",
                reason: "",
              });
              setShowModal(true);
            }}
          >
            + Add Regularization
          </button>
          <button
            className="btn-my-leaves"
            onClick={() => navigate("/admin-my-leave")}
          >
            My Leaves
          </button>

          {/* Filter Button with Dropdown */}
          <div className="filter-wrapper" style={{ position: "relative" }}>
            <button
              ref={filterButtonRef}
              className="right-butn-filters"
              onClick={() => setShowFilterPopup(!showFilterPopup)}
            >
              <FaFilter /> Filter
            </button>

            {/* Filter Dropdown */}
            {showFilterPopup && (
              <div ref={filterRef} className="filter-dropdown-box">
                {/* Header */}
                <div className="filter-popup-header">
                  <h3>Filter</h3>
                  <button
                    className="filter-popup-close"
                    onClick={() => setShowFilterPopup(false)}
                  >
                    <IoClose />
                  </button>
                </div>

                {/* Body */}
                <div className="filter-popup-body">
                  {/* Name Field */}
                  <div className="filter-field">
                    <label>Name</label>
                    <input
                      type="text"
                      placeholder="Please enter name"
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                    />
                  </div>

                  {/* Leave Type and Status Row */}
                  <div className="filter-row">
                    <div className="filter-field">
                      <label>Leave Type</label>
                      <select
                        value={filterLeaveType}
                        onChange={(e) => setFilterLeaveType(e.target.value)}
                      >
                        <option value="All">All</option>
                        <option value="Full Day">Full Day</option>
                        <option value="Half Day(FN)">Half Day(FN)</option>
                        <option value="Half Day(AN)">Half Day(AN)</option>
                      </select>
                    </div>

                    <div className="filter-field">
                      <label>Status</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="All">All</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="filter-popup-footer">
                  <button
                    className="filter-reset-btn"
                    onClick={handleResetFilter}
                  >
                    Reset
                  </button>
                  <button
                    className="filter-apply-btn"
                    onClick={handleApplyFilter}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Regularization Table */}
        <div className="regularization-table">
          <table>
            <thead>
              <tr>
                <th>Sl No</th>
                <th>Attendance Type</th>
                <th>Date</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((row, index) => (
                  <tr key={row.id}>
                    <td>
                      {String(indexOfFirstItem + index + 1).padStart(2, "0")}
                    </td>
                    <td>{row.attendanceType}</td>
                    <td>{row.date}</td>
                    <td>{row.reason}</td>
                    <td>
                      <span
                        className={`status-badge ${row.status === "Approved"
                            ? "approved"
                            : row.status === "Pending"
                              ? "pending"
                              : "rejected"
                          }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="action-icons">
                      <FaEdit
                        className="edit-icon"
                        onClick={() => handleEdit(row)}
                      />
                      <FaTimesCircle
                        className="delete-icon"
                        onClick={() => handleDelete(row.id)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                    No regularization records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="pagination">
          <div className="showing">
            Showing{" "}
            <select
              value={String(itemsPerPage).padStart(2, "0")}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="07">07</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
            </select>
          </div>
          <div className="page-nav">
            <button
              className="page-btn prev-next"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                className={`page-btn num-btn ${currentPage === i + 1 ? "active" : ""
                  }`}
                onClick={() => handlePageChange(i + 1)}
              >
                {String(i + 1).padStart(2, "0")}
              </button>
            ))}
            <button
              className="page-btn prev-next"
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </button>
          </div>
        </div>

        {/* Add Regularization Modal */}
        {/* Add Regularization Modal */}
        {showModal && (
          <div className="regularization-overlay">
            <div className="regularization-modal-exact">
              {/* Header */}
              <div className="regularization-header-exact">
                <h3>Add Regularization</h3>
                <button
                  className="regularization-close-exact"
                  onClick={() => setShowModal(false)}
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="regularization-body-exact">
                <div className="regularization-form-exact">
                  {/* Left Form Section */}
                  <div className="regularization-left-exact">
                    <div className="form-row-exact">
                      <label>Employee ID:</label>
                      <input type="text" value={formData.user_id} readOnly />
                    </div>

                    <div className="form-row-exact">
                      <label>Leave Type:</label>
                      <select
                        value={formData.session_type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            session_type: e.target.value,
                          })
                        }
                      >
                        <option>Full Day</option>
                        <option>Half Day (FN)</option>
                        <option>Half Day (AN)</option>
                      </select>
                    </div>

                    <div className="form-row-exact">
                      <label>Select Date:</label>
                      <div className="date-input-wrapper-exact">
                        <input
                          type="date"
                          placeholder="DD-MM-YYYY"
                          value={formData.date}
                          onChange={(e) =>
                            setFormData({ ...formData, date: e.target.value })
                          }
                        />
                        <span className="calendar-icon-exact">📅</span>
                      </div>
                    </div>

                    <div className="form-row-exact">
                      <label>Attendance</label>
                      <select
                        value={formData.attendance_type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            attendance_type: e.target.value,
                          })
                        }
                      >
                        <option>Present</option>
                        <option>Absent</option>
                      </select>
                    </div>

                    <div className="form-row-exact">
                      <label>Reason:</label>
                      <div className="textarea-wrapper-exact">
                        <textarea
                          placeholder="ex: Forgot to Clock In"
                          maxLength={30}
                          value={formData.reason}
                          onChange={(e) =>
                            setFormData({ ...formData, reason: e.target.value })
                          }
                        ></textarea>
                        <span className="char-count-exact">{(formData.reason || "").length}/30</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Image Section */}
                  <div className="regularization-right-exact">
                    <img src={illustration} alt="Regularization Illustration" />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="regularization-footer-exact">
                <button
                  className="regularization-submit-exact"
                  onClick={handleSubmitRegularization}
                >
                  Submit
                </button>
                <button
                  className="regularization-cancel-exact"
                  onClick={() => setShowModal(false)}
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
}
