import React, { useState, useEffect } from "react";
import "./MyTeamLeaveApproval.css";
import { FaFilter } from "react-icons/fa";
import AdminSidebar from "../AdminSidebar";
import Topbar from "../Topbar";
import group10 from "../../../assets/Group10.png";
import illustration from "../../../assets/Formsbro.png";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../utils/apiClient";
import tick from "../../../assets/tickicon.png";
import { getCurrentSession } from "../../../utils/sessionManager";

export default function MyTeamLeaveApproval() {
  const [leaveData, setLeaveData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [approvalReason, setApprovalReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortOrder, setSortOrder] = useState("Newest");

  const [showFilter, setShowFilter] = useState(false);
  const [tempStatus, setTempStatus] = useState("All");
  const [filterLeaveType, setFilterLeaveType] = useState("All");
  const [tempLeaveType, setTempLeaveType] = useState("All");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const navigate = useNavigate();

  const session = getCurrentSession();
  const currentAdminId = session?.user_id;

  useEffect(() => {
    const fetchMyTeamLA = async () => {
      const userId =
        localStorage.getItem("current_user_id") ||
        localStorage.getItem("employee_user_id");
      try {
        const response = await apiClient.get("/api/myteamla", {
          headers: {
            "X-User-ID": userId,
            "X-User-Role": localStorage.getItem("current_role") || "admin",
          },
        });
        setLeaveData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchMyTeamLA();
  }, []);

  // Helper to re-fetch team leave data
  const refetchLeaveData = async () => {
    const userId =
      localStorage.getItem("current_user_id") ||
      localStorage.getItem("employee_user_id");
    try {
      const response = await apiClient.get("/api/myteamla", {
        headers: {
          "X-User-ID": userId,
          "X-User-Role": localStorage.getItem("current_role") || "admin",
        },
      });
      setLeaveData(response.data);
    } catch (error) {
      console.error("Error re-fetching data:", error);
    }
  };

  // Auto-close success modal after 2 seconds
  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        setShowSuccessModal(false);
        setShowModal(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessModal]);

  const getStatusClass = (status) => {
    if (status === "Approved") return "status-approved";
    if (status === "Pending") return "status-pending";
    if (status === "Rejected") return "status-rejected";
  };

  const filteredAndSortedLeaves = leaveData
    .filter((leave) =>
      leave.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((leave) =>
      filterStatus === "All" ? true : leave.status === filterStatus,
    )
    .filter((leave) =>
      filterLeaveType === "All" ? true : leave.type === filterLeaveType,
    )
    .sort((a, b) => {
      const parseDate = (dateStr) => {
        if (!dateStr) return new Date(0);
        const parts = dateStr.split("-");
        if (parts.length === 3)
          return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        return new Date(dateStr);
      };
      const dateA = parseDate(a.request);
      const dateB = parseDate(b.request);
      return sortOrder === "Newest" ? dateB - dateA : dateA - dateB;
    });

  // Pagination computed values
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedLeaves.length / rowsPerPage));
  const paginatedLeaves = filteredAndSortedLeaves.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Reset to page 1 whenever filters / sort / search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterLeaveType, sortOrder, rowsPerPage]);

  return (
    <div className="myteam-layout">
      <div className="rightside-logo">
        <img src={group10} alt="logo" className="rightside-logos" />
      </div>

      <AdminSidebar />

      <div className="myteam-main">
        <Topbar />

        <div className="myteam-page">
          <h2 className="myteam-title">My Team Leave Approval</h2>

          <div className="myteam-controls">
            <div className="toggle-tab-container">
              <button
                className="toggle-tab-btn"
                onClick={() => navigate("/leave-approval")}
              >
                All
              </button>
              <button className="toggle-tab-btn active">My Team</button>
            </div>

            <div className="filter-sort">
              {/* FILTER BUTTON */}
              <div className="filter-wrapper">
                <button
                  className="right-btn-filter"
                  onClick={() => setShowFilter(!showFilter)}
                >
                  <FaFilter /> Filter
                </button>

                {/* FILTER POPUP */}
                {showFilter && (
                  <div className="filter-dropdown">
                    <h3 className="filter-heading">Filter</h3>

                    <div className="filter-field">
                      <label>Name</label>
                      <input
                        type="text"
                        placeholder="Enter employee name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="filter-row">
                      <div className="filter-field">
                        <label>Leave Type</label>
                        <select
                          value={tempLeaveType}
                          onChange={(e) => setTempLeaveType(e.target.value)}
                        >
                          <option value="All">All</option>
                          <option value="sick">Sick</option>
                          <option value="casual">Casual</option>
                          <option value="Annual">Annual</option>
                        </select>
                      </div>

                      <div className="filter-field">
                        <label>Status</label>
                        <select
                          value={tempStatus}
                          onChange={(e) => setTempStatus(e.target.value)}
                        >
                          <option value="All">All</option>
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </div>

                    <div className="filter-actions">
                      <button
                        className="reset-btn"
                        onClick={() => {
                          setSearchTerm("");
                          setTempStatus("All");
                          setFilterStatus("All");
                          setTempLeaveType("All");
                          setFilterLeaveType("All");
                          setShowFilter(false);
                        }}
                      >
                        Reset
                      </button>

                      <button
                        className="apply-btn"
                        onClick={() => {
                          setFilterStatus(tempStatus);
                          setFilterLeaveType(tempLeaveType);
                          setShowFilter(false);
                        }}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SORT */}
              <select
                className="right-sort-select"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="Newest">Sort By : Newest</option>
                <option value="Oldest">Sort By : Oldest</option>
              </select>
            </div>
          </div>

          <table className="myteam-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Leave Dates</th>
                <th>Date Of Request</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedLeaves.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "#9ca3af" }}>
                    No leave records found.
                  </td>
                </tr>
              ) : (
                paginatedLeaves.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="employee-info">
                        <img src={item.image} alt="" className="emp-avatar" />
                        <div>
                          <p className="emp-name">{item.name}</p>
                          <p className="emp-id">{item.empId}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      {item.type}
                      <br />
                      <span className="days">{item.days}</span>
                    </td>
                    <td>{item.date}</td>
                    <td>{item.request}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => {
                          setSelectedLeave(item);
                          setShowModal(true);
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="pagination">
            {/* LEFT: Showing [N] rows selector */}
            <div className="showing">
              Showing{" "}
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {[7, 10, 15, 20].map((n) => (
                  <option key={n} value={n}>
                    {String(n).padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>

            {/* RIGHT: Prev / page num / Next */}
            <div className="page-nav">
              <button
                className="page-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ opacity: currentPage === 1 ? 0.4 : 1 }}
              >
                Prev
              </button>
              <button className="page-btn active">
                {String(currentPage).padStart(2, "0")}
              </button>
              <button
                className="page-btn"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{ opacity: currentPage === totalPages ? 0.4 : 1 }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
        {showModal && selectedLeave && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div
              className="apply-leave-modal"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="modal-header-blue">
                <h3>Leave Approval</h3>
                <button className="close-btn" onClick={() => setShowModal(false)}>
                  ×
                </button>
              </div>

              {/* Body */}
              <div className="modal-body">
                <form className="apply-leave-form">

                  {/* Left: all form rows */}
                  <div className="form-left">

                    {/* Employee ID */}
                    <div className="form-row">
                      <label>Employee ID:</label>
                      <input type="text" value={selectedLeave.empId} readOnly />
                    </div>

                    {/* Leave Type */}
                    <div className="form-row">
                      <label>Leave Type:</label>
                      <input type="text" value={selectedLeave.type} readOnly />
                    </div>

                    {/* Date Of Leave */}
                    <div className="form-row">
                      <label>Date Of Leave:</label>
                      <div className="date-row">
                        <div className="date-item">
                          <p>From</p>
                          <input
                            type="text"
                            value={selectedLeave.from}
                            readOnly
                          />
                        </div>
                        <div className="date-item">
                          <p>To</p>
                          <input
                            type="text"
                            value={selectedLeave.to}
                            readOnly
                          />
                        </div>
                        <div className="date-item no-label">
                          <input
                            type="text"
                            value={selectedLeave.session || "Full Day"}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>

                    {/* Approved By + Upload */}
                    <div className="form-row">
                      <label>Approved By:</label>
                      <div className="approved-by-row">
                        <input
                          type="text"
                          value={selectedLeave.notify}
                          readOnly
                        />
                        <div className="document-box">
                          <span>Upload File</span>
                          <div className="upload-icon-blue">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M18 15l-6-6-6 6" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="form-row reason-row">
                      <label>Reason:</label>
                      <div className="reason-container">
                        <textarea value={selectedLeave.reason} readOnly />
                        <span className="char-counter">
                          {(selectedLeave.reason?.length || 0)}/30
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Right: illustration */}
                  <div className="form-right">
                    <img src={illustration} alt="Leave Illustration" />
                  </div>

                </form>
              </div>

              {/* Footer action buttons */}
              {selectedLeave.status === "Pending" && (
                <div className="modal-footer">
                  <button
                    type="button"
                    className="modal-approve-btn"
                    onClick={() => {
                      setActionType("Approval");
                      setShowReasonModal(true);
                    }}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="modal-reject-btn"
                    onClick={() => {
                      setActionType("Rejection");
                      setShowReasonModal(true);
                    }}
                  >
                    Reject
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

        {showReasonModal && (
          <div className="modal-overlay">
            <div className="reason-modal">
              <button
                className="close-btn"
                onClick={() => setShowReasonModal(false)}
              >
                ×
              </button>
              <h3>Reason For {actionType}</h3>
              <textarea
                placeholder="Please fill out the note for approvals"
                maxLength={250}
                value={approvalReason}
                onChange={(e) => setApprovalReason(e.target.value)}
              />
              <small>maximum character limit 250</small>
              <div className="modal-actions">
                <button
                  className="apply-btn"
                  onClick={async () => {
                    try {
                      const endpoint =
                        actionType === "Approval"
                          ? `/api/leave_requests/${selectedLeave.id}/approve`
                          : `/api/leave_requests/${selectedLeave.id}/reject`;
                      await apiClient.put(endpoint, {
                        reason: approvalReason,
                        approved_by: currentAdminId,
                      });
                      // Refresh the leave list
                      await refetchLeaveData();
                      setShowReasonModal(false);
                      setShowSuccessModal(true);
                      setApprovalReason("");
                    } catch (error) {
                      console.error(
                        "Error processing leave request:",
                        error?.response?.data?.message || error.message,
                      );
                      alert(
                        `Failed to process leave request. Please try again.\n${error?.response?.data?.message || error.message}`,
                      );
                    }
                  }}
                >
                  Submit
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setShowReasonModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {showSuccessModal && (
          <div className="modal-overlay">
            <div className="success-modal">
              <button
                className="close-btn"
                onClick={() => {
                  setShowSuccessModal(false);
                  setShowModal(false);
                }}
              >
                ×
              </button>
              <img className="tick-icon" src={tick} alt="tick-icon" />
              <h2>{actionType === "Approval" ? "Success" : "Rejected"}</h2>
              <p>
                Leave Approval {actionType === "Approval" ? "Successfully" : "Rejected"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
