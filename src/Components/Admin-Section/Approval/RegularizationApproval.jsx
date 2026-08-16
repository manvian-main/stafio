import React, { useState, useEffect, useRef } from "react";
import "./RegularizationApproval.css";
import { FaFilter, FaSearch } from "react-icons/fa";
import AdminSidebar from "../AdminSidebar";
import Topbar from "../Topbar";
import { useNavigate } from "react-router-dom";
import group10 from "../../../assets/Group10.png";
import timemgnt from "../../../assets/Timemgnt.png";
import apiClient from "../../../utils/apiClient";

export default function RegularizationApproval() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [attendanceType, setAttendanceType] = useState("All");
  const [sortOrder, setSortOrder] = useState("Newest");
  const [showFilter, setShowFilter] = useState(false);

  // View Details Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showApproveReasonModal, setShowApproveReasonModal] = useState(false);
  const [showRejectReasonModal, setShowRejectReasonModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRejectedResultModal, setShowRejectedResultModal] = useState(false);
  const [modalReason, setModalReason] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filterRef = useRef(null);
  const navigate = useNavigate();

  // Fetch data
  useEffect(() => {
    const fetchRegularizationApproval = async () => {
      try {
        const response = await apiClient.get("/api/regularizationapproval");
        setData(response.data);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };
    fetchRegularizationApproval();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, attendanceType, sortOrder]);

  // Close filter popup on outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Modal handlers
  const handleViewDetails = (leave) => {
    setSelectedLeave(leave);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLeave(null);
    setShowApproveReasonModal(false);
    setShowRejectReasonModal(false);
    setShowSuccessModal(false);
    setShowRejectedResultModal(false);
    setModalReason("");
  };

  const handleApproveClick = () => setShowApproveReasonModal(true);
  const handleRejectClick = () => setShowRejectReasonModal(true);

  const handleApproveSubmit = async () => {
    if (selectedLeave) {
      try {
        const userId = localStorage.getItem("current_user_id");
        const userRole = localStorage.getItem("current_role") || "admin";
        await apiClient.put(
          `/api/admin/regularization/${selectedLeave.id}`,
          { status: "Approved", reason: modalReason },
          { headers: { "X-User-ID": userId, "X-User-Role": userRole } },
        );
        const currentUserName =
          localStorage.getItem("current_user_name") || "Admin"; // Fallback if name not in storage
        setData((prev) =>
          prev.map((item) =>
            item.id === selectedLeave.id
              ? {
                ...item,
                status: "Approved",
                approvedBy: item.approvedBy || currentUserName,
                approvalReason: modalReason,
              }
              : item,
          ),
        );
      } catch (error) {
        console.error("Error approving regularization:", error);
      }
    }
    setShowApproveReasonModal(false);
    setShowSuccessModal(true);
    setTimeout(() => handleCloseModal(), 2000);
  };

  const handleRejectSubmit = async () => {
    if (selectedLeave) {
      try {
        const userId = localStorage.getItem("current_user_id");
        const userRole = localStorage.getItem("current_role") || "admin";
        await apiClient.put(
          `/api/admin/regularization/${selectedLeave.id}`,
          { status: "Rejected", reason: modalReason },
          { headers: { "X-User-ID": userId, "X-User-Role": userRole } },
        );
        const currentUserName =
          localStorage.getItem("current_user_name") || "Admin";
        setData((prev) =>
          prev.map((item) =>
            item.id === selectedLeave.id
              ? {
                ...item,
                status: "Rejected",
                approvedBy: item.approvedBy || currentUserName,
                rejectionReason: modalReason,
              }
              : item,
          ),
        );
      } catch (error) {
        console.error("Error rejecting regularization:", error);
      }
    }
    setShowRejectReasonModal(false);
    setShowRejectedResultModal(true);
    setTimeout(() => handleCloseModal(), 2000);
  };

  // Filter + sort logic
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    const parts = dateStr.split("-");
    if (parts.length === 3)
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    return new Date(dateStr);
  };

  const filteredAndSortedLeaves = data
    .filter((leave) =>
      leave.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((leave) =>
      attendanceType === "All" ? true : leave.attendance === attendanceType,
    )
    .filter((leave) =>
      filterStatus === "All" ? true : leave.status === filterStatus,
    )
    .sort((a, b) => {
      const dateA = parseDate(a.requestDate);
      const dateB = parseDate(b.requestDate);
      return sortOrder === "Newest" ? dateB - dateA : dateA - dateB;
    });

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  const currentLeaves = filteredAndSortedLeaves.slice(
    indexOfFirstRow,
    indexOfLastRow,
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedLeaves.length / rowsPerPage),
  );

  return (
    <div className="regularization-approval-layout">
      <div className="rightside-logo">
        <img src={group10} alt="logo" className="rightside-logos" />
      </div>

      <AdminSidebar />

      <div className="regularization-approval-main">
        <Topbar />

        <div className="regularization-containerApproval">
          <div className="regularization-header">
            <div className="header-top">
              <h2>Regularization Approval</h2>
            </div>

            <div className="header-bottom">
              <div className="left-tabs">
                <button className="tab-btn">All</button>
                <button
                  className="tab-btn active"
                  onClick={() => navigate("/ra-myteam")}
                >
                  My Team
                </button>
              </div>

              <div className="right-controls">
                <div className="right-search-wrapper">
                  <FaSearch className="search-icon-inside" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="right-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Filter Icon + Popup */}
                <div className="filter-wrapper" ref={filterRef}>
                  <button
                    className="filter-icon-btn"
                    onClick={() => setShowFilter(!showFilter)}
                  >
                    <FaFilter />
                  </button>

                  {showFilter && (
                    <div className="filter-popup">
                      <h4>Filter</h4>

                      <label>Name</label>
                      <input
                        type="text"
                        placeholder="Please enter name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />

                      <div className="filter-row">
                        <div>
                          <label>Attendance Type</label>
                          <select
                            value={attendanceType}
                            onChange={(e) => setAttendanceType(e.target.value)}
                          >
                            <option value="All">All</option>
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                          </select>
                        </div>

                        <div>
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
                            setAttendanceType("All");
                            setFilterStatus("All");
                          }}
                        >
                          Reset
                        </button>
                        <button
                          className="apply-btn"
                          onClick={() => setShowFilter(false)}
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>

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
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="regularization-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Regularization Date</th>
                  <th>Attendance Type</th>
                  <th>Date Of Request</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentLeaves.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div className="emp-info">
                        <img src={emp.img} alt={emp.name} />
                        <div>
                          <p className="emp-name">{emp.name}</p>
                          <span>{emp.empId}</span>
                        </div>
                      </div>
                    </td>
                    <td>{emp.regDate}</td>
                    <td>{emp.attendance}</td>
                    <td>
                      <div className="request-status">
                        <span>{emp.requestDate}</span>
                        <p
                          className={`status-badge ${emp.status === "Pending"
                              ? "pending"
                              : emp.status === "Rejected"
                                ? "rejected"
                                : "approved"
                            }`}
                        >
                          {emp.status}
                        </p>
                      </div>
                    </td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => handleViewDetails(emp)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <div className="showing">
              Showing {currentLeaves.length} of {filteredAndSortedLeaves.length}
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                disabled={filteredAndSortedLeaves.length === 0}
              >
                <option value={5}>05</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
            <div className="page-btns">
              <button
                className="prev"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage <= 1}
              >
                Prev
              </button>

              <span className="page active">
                {String(currentPage).padStart(2, "0")}
              </span>

              <button
                className="next"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage >= totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── View Details Modal ── */}
      {isModalOpen && selectedLeave && (
        <div className="ra-modal-overlay">
          <div className="ra-modal-content">
            <div className="ra-modal-header">
              <h2>Regularization Approval</h2>
              <button className="ra-close-btn" onClick={handleCloseModal}>
                &times;
              </button>
            </div>
            <div className="ra-modal-body">
              <div className="ra-form-section">
                <div className="ra-form-group">
                  <label>Employee ID:</label>
                  <input
                    type="text"
                    value={`${selectedLeave.name} (${selectedLeave.empId})`}
                    readOnly
                  />
                </div>
                <div className="ra-form-group">
                  <label>Leave Type:</label>
                  <select disabled className="ra-select">
                    <option>
                      {selectedLeave.regDate?.split("/")[1] || "Full Day"}
                    </option>
                  </select>
                </div>
                <div className="ra-form-group">
                  <label>Select Date:</label>
                  <div className="ra-date-input-wrapper">
                    <input
                      type="text"
                      value={
                        selectedLeave.regDate?.split("/")[0] || "DD-MM-YYYY"
                      }
                      readOnly
                    />
                    <span className="ra-date-icon">📅</span>
                  </div>
                </div>
                <div className="ra-form-group">
                  <label>Attendance Type:</label>
                  <input
                    type="text"
                    value={selectedLeave.attendance || ""}
                    readOnly
                  />
                </div>
                <div className="ra-form-group">
                  <label>Status:</label>
                  <input
                    type="text"
                    value={selectedLeave.status || ""}
                    readOnly
                  />
                </div>
                <div className="ra-form-group">
                  <label>Approved By:</label>
                  <input
                    type="text"
                    value={selectedLeave.approvedBy || "N/A"}
                    readOnly
                  />
                </div>
                <div className="ra-form-group ra-reason-group">
                  <label>Reason:</label>
                  <div className="ra-reason-wrapper">
                    <textarea value={selectedLeave.reason || ""} readOnly />
                    <span className="ra-char-count">
                      {selectedLeave.reason?.length || 0}/30
                    </span>
                  </div>
                </div>
              </div>
              <div className="ra-illustration-section">
                <img src={timemgnt} alt="Time Management" />
              </div>
            </div>
            <div className="ra-modal-footer">
              <span className="ra-watermark"></span>
              {selectedLeave &&
                selectedLeave.status &&
                selectedLeave.status.toLowerCase() === "pending" ? (
                <div className="ra-footer-btns">
                  <button
                    className="ra-approve-pill-btn"
                    onClick={handleApproveClick}
                  >
                    Approve
                  </button>
                  <button
                    className="ra-reject-pill-btn"
                    onClick={handleRejectClick}
                  >
                    Reject
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* ── Approve Reason Modal ── */}
      {showApproveReasonModal && (
        <div className="ra-modal-overlay ra-nested-overlay">
          <div className="ra-small-modal">
            <button
              className="ra-small-close"
              onClick={() => setShowApproveReasonModal(false)}
            >
              &times;
            </button>
            <h3>Reason For Approval</h3>
            <div className="ra-small-body">
              <textarea
                placeholder="Please fill out the note for approvals"
                value={modalReason}
                maxLength={250}
                onChange={(e) => setModalReason(e.target.value)}
              />
              <p className="ra-char-hint">maximum character limit 250</p>
              <div className="ra-small-footer">
                <button className="ra-submit-btn" onClick={handleApproveSubmit}>
                  Submit
                </button>
                <button
                  className="ra-cancel-btn"
                  onClick={() => setShowApproveReasonModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Reason Modal ── */}
      {showRejectReasonModal && (
        <div className="ra-modal-overlay ra-nested-overlay">
          <div className="ra-small-modal">
            <button
              className="ra-small-close"
              onClick={() => setShowRejectReasonModal(false)}
            >
              &times;
            </button>
            <h3>Reason For Rejection</h3>
            <div className="ra-small-body">
              <textarea
                placeholder="Please fill out the note for rejection"
                value={modalReason}
                maxLength={250}
                onChange={(e) => setModalReason(e.target.value)}
              />
              <p className="ra-char-hint">maximum character limit 250</p>
              <div className="ra-small-footer">
                <button className="ra-submit-btn" onClick={handleRejectSubmit}>
                  Submit
                </button>
                <button
                  className="ra-cancel-btn"
                  onClick={() => setShowRejectReasonModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Success Modal ── */}
      {showSuccessModal && (
        <div className="ra-modal-overlay ra-nested-overlay">
          <div className="ra-result-modal ra-success-box">
            <button className="ra-small-close" onClick={handleCloseModal}>
              &times;
            </button>
            <div className="ra-result-content">
              <h2>Success</h2>
              <p>Leave Approved Successfully</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Rejected Result Modal ── */}
      {showRejectedResultModal && (
        <div className="ra-modal-overlay ra-nested-overlay">
          <div className="ra-result-modal ra-reject-box">
            <button className="ra-small-close" onClick={handleCloseModal}>
              &times;
            </button>
            <div className="ra-result-content">
              <h2>Rejected</h2>
              <p>Leave Approval Rejected</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
