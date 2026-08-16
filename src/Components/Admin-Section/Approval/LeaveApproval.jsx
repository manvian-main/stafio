import React, { useState, useEffect, useRef } from "react";
import {
  FaFilter,
  FaEdit,
  FaSearch,
} from "react-icons/fa";
import "./LeaveApproval.css";
import AdminSidebar from "../AdminSidebar";
import Topbar from "../Topbar";
import { useNavigate } from "react-router-dom";
import group10 from "../../../assets/Group10.png";
import illustration from "../../../assets/Formsbro.png";
import tick from "../../../assets/tickicon.png";
import apiClient from "../../../utils/apiClient";
import { getCurrentSession } from "../../../utils/sessionManager";

const LeaveApproval = () => {
  const [leaves, setLeaves] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [actionType, setActionType] = useState(""); // "Approve" | "Reject"
  const [approvalReason, setApprovalReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("Newest");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [showRowsDropdown, setShowRowsDropdown] = useState(false);
  const rowsDropdownRef = useRef(null);

  const session = getCurrentSession();
  const currentAdminId = session?.user_id;

  // Filter states
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterLeaveType, setFilterLeaveType] = useState("All");
  const [filterDate, setFilterDate] = useState("");

  const navigate = useNavigate();

  // REF for filter popup (outside click close)
  const filterPopupRef = useRef(null);

  useEffect(() => {
    const fetchLeaveapprova = async () => {
      try {
        const response = await apiClient.get("/api/leaveapproval");
        setLeaves(response.data);
      } catch (error) {
        console.error("Error fetching leave data:", error);
      }
    };

    fetchLeaveapprova();
  }, []);

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
    switch (status) {
      case "Approved":
        return "status-approved";
      case "Rejected":
        return "status-rejected";
      default:
        return "status-pending";
    }
  };

  // Outside click close for filter popup
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        showFilterPopup &&
        filterPopupRef.current &&
        !filterPopupRef.current.contains(e.target)
      ) {
        setShowFilterPopup(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showFilterPopup]);

  // Outside click close for rows dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        showRowsDropdown &&
        rowsDropdownRef.current &&
        !rowsDropdownRef.current.contains(e.target)
      ) {
        setShowRowsDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showRowsDropdown]);

  const filteredAndSortedLeaves = leaves
    // Search by name
    .filter((leave) =>
      leave.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    // Filter by status
    .filter((leave) =>
      filterStatus === "All" ? true : leave.status === filterStatus,
    )
    // Filter by leave type
    .filter((leave) =>
      filterLeaveType === "All" ? true : leave.type === filterLeaveType,
    )
    // Filter by date
    .filter((leave) => (filterDate ? leave.requestDate === filterDate : true))
    // Sort by date
    .sort((a, b) => {
      const parseDate = (dateStr) => {
        if (!dateStr) return new Date(0);
        const parts = dateStr.split("-");
        if (parts.length === 3)
          return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        return new Date(dateStr);
      };
      const dateA = parseDate(a.requestDate);
      const dateB = parseDate(b.requestDate);

      return sortOrder === "Newest" ? dateB - dateA : dateA - dateB;
    });

  const pendingCount = leaves.filter((leave) => leave.status === "Pending").length;
  const approvedCount = leaves.filter((leave) => leave.status === "Approved").length;
  const rejectedCount = leaves.filter((leave) => leave.status === "Rejected").length;

  // Computed pagination values
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedLeaves.length / rowsPerPage));
  const paginatedLeaves = filteredAndSortedLeaves.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Reset to page 1 when filters/sort/search change
  const resetPage = () => setCurrentPage(1);

  useEffect(() => {
    resetPage();
  }, [searchTerm, filterStatus, filterLeaveType, filterDate, sortOrder]);


  return (
    <div className="leave-approval-layout">
      <div className="rightside-logo">
        <img src={group10} alt="logo" className="rightside-logos" />
      </div>

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Section */}
      <div className="leave-approval-main">
        <Topbar />
        <h2 className="page-title">Leave Approval</h2>

        {/* ── HEADER: 3 summary cards LEFT | controls RIGHT ── */}
        <div className="leave-header">
          {/* 3-card single-box with vertical dividers — matches design */}
          <div className="leave-summary">
            {/* Card 1 — Pending */}
            <div className="summary-card-leave">
              {/* SVG dots-clock spinner — matches design exactly */}
              <span className="dots-spinner-icon">
                <svg viewBox="0 0 32 32" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* All 8 dots on exact circle r=12, centre=(16,16), every 45° */}
                  {/* 12 o'clock  0°   */}
                  <circle cx="16" cy="4" r="1.4" fill="#f59e0b" opacity="0.25" />
                  {/* 1:30       45°   */}
                  <circle cx="24.49" cy="7.51" r="1.6" fill="#f59e0b" opacity="0.38" />
                  {/* 3 o'clock  90°   */}
                  <circle cx="28" cy="16" r="2.0" fill="#f59e0b" opacity="0.55" />
                  {/* 4:30      135°   */}
                  <circle cx="24.49" cy="24.49" r="2.4" fill="#f59e0b" opacity="0.70" />
                  {/* 6 o'clock 180°   */}
                  <circle cx="16" cy="28" r="2.8" fill="#f59e0b" opacity="1.00" />
                  {/* 7:30      225°   */}
                  <circle cx="7.51" cy="24.49" r="2.4" fill="#f59e0b" opacity="0.70" />
                  {/* 9 o'clock 270°   */}
                  <circle cx="4" cy="16" r="2.0" fill="#f59e0b" opacity="0.45" />
                  {/* 10:30     315°   */}
                  <circle cx="7.51" cy="7.51" r="1.6" fill="#f59e0b" opacity="0.30" />
                </svg>
              </span>
              <div className="card-text-block">
                <strong>
                  {pendingCount < 10 ? `0${pendingCount}` : pendingCount}{" "}
                  Request Pending
                </strong>
                <span className="sub-text">Awaiting Approval</span>
              </div>
            </div>

            {/* Card 2 — Approved: outlined green circle + checkmark */}
            <div className="summary-card-leave">
              <span className="summary-svg-icon">
                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="13" stroke="#22c55e" strokeWidth="1.8" />
                  <path d="M10 16.5L14.5 21L22 12" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div className="card-text-block">
                <strong>
                  {approvedCount < 10 ? `0${approvedCount}` : approvedCount}{" "}
                  Request Approved
                </strong>
                <span className="sub-text">In this Month</span>
              </div>
            </div>

            {/* Card 3 — Rejected: outlined red circle + bold X */}
            <div className="summary-card-leave">
              <span className="summary-svg-icon">
                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="13" stroke="#ef4444" strokeWidth="2" />
                  <path d="M11 11L21 21M21 11L11 21" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </span>
              <div className="card-text-block">
                <strong>
                  {rejectedCount < 10 ? `0${rejectedCount}` : rejectedCount}{" "}
                  Request Rejected
                </strong>
                <span className="sub-text">In this month</span>
              </div>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="right-leave-actions">
            <div className="right-top-buttons">
              <button className="right-tab-btn right-tab-btn--active">
                All
              </button>
              <button
                onClick={() => navigate("/myTeam-LeaveApproval")}
                className="right-tab-btn right-tab-btn--cyan"
              >
                My Team
              </button>
            </div>

            {/* Search + Filter + Sort */}
            <div className="right-bottom-button">
              <div className="search-wrapper">
                <FaSearch className="search-icon-inside" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="right-search-input-new"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* FILTER WRAPPER (IMPORTANT) */}
              <div className="filter-wrapper" ref={filterPopupRef}>
                <button
                  className="right-btn-filter-new"
                  onClick={() => setShowFilterPopup((prev) => !prev)}
                >
                  <FaFilter /> Filter
                </button>

                {/* FILTER POPUP */}
                {showFilterPopup && (
                  <div className="filter-dropdown">
                    <h4 className="filter-title">Filter</h4>

                    <div className="filter-grid">
                      {/* Name */}
                      <div className="filter-field">
                        <label>Name</label>
                        <input
                          type="text"
                          placeholder="Please enter name"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>

                      {/* Leave Type */}
                      <div className="filter-field">
                        <label>Leave Type</label>
                        <select
                          value={filterLeaveType}
                          onChange={(e) => setFilterLeaveType(e.target.value)}
                        >
                          <option value="All">All</option>
                          <option value="sick">Sick</option>
                          <option value="casual">Casual</option>
                          <option value="Annual">Annual</option>
                        </select>
                      </div>

                      {/* Status */}
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

                    <div className="filter-actions">
                      <button
                        className="reset-btn"
                        onClick={() => {
                          setSearchTerm("");
                          setFilterLeaveType("All");
                          setFilterStatus("All");
                          setFilterDate("");
                        }}
                      >
                        Reset
                      </button>

                      <button
                        className="apply-btn"
                        onClick={() => setShowFilterPopup(false)}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SORT */}
              <select
                className="right-sort-select-new"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="Newest">Sort By : Newest</option>
                <option value="Oldest">Sort By : Oldest</option>
              </select>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <table className="leave-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>Leave Dates</th>
              <th>Date Of Request</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLeaves.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "#9ca3af" }}>
                  No leave records found.
                </td>
              </tr>
            ) : (
              paginatedLeaves.map((leave, index) => (
                <tr key={index}>
                  <td>
                    <div className="employee-info">
                      <div className="emp-avatar">
                        <img
                          src={leave.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            leave.name,
                          )}&background=random`}
                          alt={leave.name}
                        />
                      </div>
                      <div>
                        <p className="emp-name">{leave.name}</p>
                        <span className="emp-id">{leave.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="leave-type-name">{leave.type}</span>
                    <div className="leave-type-days">{leave.days}</div>
                  </td>
                  <td>{leave.dates}</td>
                  <td>
                    <div className="req-date-text">{leave.requestDate}</div>
                    <span className={`status-badge ${getStatusClass(leave.status)}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => {
                        setSelectedLeave(leave);
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

        {/* PAGINATION */}
        <div className="pagination">
          <div className="showing">
            Showing
            <select
              value={String(rowsPerPage).padStart(2, "0")}
              onChange={(e) => {
                setRowsPerPage(parseInt(e.target.value));
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
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <button className="page-btn num-btn active">
              {String(currentPage).padStart(2, "0")}
            </button>
            <button
              className="page-btn prev-next"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>

        {/* LEAVE DETAILS MODAL */}
        {showModal && selectedLeave && (
          <div
            className="approve-modal-overlay"
            onClick={() => setShowModal(false)}
          >
            <div
              className="approve-leave-modal"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="approve-modal-header-blue">
                <h3>Leave Approval</h3>
                <button
                  className="close-btn"
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
              </div>

              {/* Body */}
              <div className="approve-form-modal-body">
                <form className="approve-leave-form">
                  <div className="form-left">
                    <div className="form-row">
                      <label>Employee ID:</label>
                      <input type="text" value={selectedLeave.id} readOnly />
                    </div>

                    <div className="form-row">
                      <label>Leave Type:</label>
                      <input
                        type="text"
                        value={selectedLeave.type}
                        readOnly
                      />
                    </div>

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

                        <div className="date-item">
                          <p>Session</p>
                          <input
                            type="text"
                            value={selectedLeave.session}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-row">
                      <label>Notify Others:</label>
                      <div className="notify-row">
                        <input
                          type="text"
                          value={selectedLeave.notify}
                          readOnly
                        />
                        <input
                          type="text"
                          className="document-input"
                          value={selectedLeave.document || "No File Uploaded"}
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="form-row reason-row">
                      <label>Reason:</label>
                      <textarea value={selectedLeave.reason} readOnly />
                    </div>
                  </div>

                  {/* Right illustration */}
                  <div className="form-right">
                    <img src={illustration} alt="Leave Illustration" />
                  </div>
                </form>
              </div>

              {/* Footer action buttons — only if Pending */}
              {selectedLeave.status === "Pending" && (
                <div className="la-modal-footer">
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
          <div className="reason-modal-overlay">
            <div className="reason-modal">
              <button
                className="reason-close-btn"
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
              <div className="reason-modal-actions">
                <button
                  className="reason-apply-btn"
                  onClick={async () => {
                    try {
                      const endpoint =
                        actionType === "Approval"
                          ? `/api/leave_requests/${selectedLeave.request_id}/approve`
                          : `/api/leave_requests/${selectedLeave.request_id}/reject`;
                      await apiClient.put(endpoint, {
                        reason: approvalReason,
                        approved_by: currentAdminId,
                      });
                      // Refresh the leave list
                      const response =
                        await apiClient.get("/api/leaveapproval");
                      setLeaves(response.data);
                      setShowReasonModal(false);
                      setShowSuccessModal(true);
                      setApprovalReason("");
                    } catch (error) {
                      console.error(
                        "Error processing leave request:",
                        error.response.data.message,
                      );
                      alert(
                        `Failed to process leave request. Please try again.\n ${error.response.data.message}`,
                      );
                    }
                  }}
                >
                  Submit
                </button>
                <button
                  className="reason-cancel-btn"
                  onClick={() => setShowReasonModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS MODAL */}
        {showSuccessModal && (
          <div className="success-modal-overlay">
            <div className="success-modal">
              <button
                className="success-close-btn"
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
};

export default LeaveApproval;
