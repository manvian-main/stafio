import React, { useState, useEffect, useRef, useContext } from "react";
import { SettingsContext } from "../Settings-/SettingsContext";
import "./MyLeave.css";
import LeaveRequestForm from "../leave/ApplyLeave";
import { FaCheckCircle, FaFilter, FaEdit, FaTimesCircle } from "react-icons/fa";
import EmployeeSidebar from ".././EmployeeSidebar";
import Topbar from ".././Topbar";
import { useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import apiClient from "../../../utils/apiClient";

export default function MyLeave() {
  const { t, fmtDate } = useContext(SettingsContext);
  const navigate = useNavigate();
  const [leaveData, setLeaveData] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  // Filter states
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterLeaveType, setFilterLeaveType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const [editingLeave, setEditingLeave] = useState(null);

  const filterRef = useRef(null);
  const filterButtonRef = useRef(null);

  const handleEdit = (leave) => {
    setEditingLeave({
      id: leave.id,

      // ⚠️ IMPORTANT: map correct fields
      leave_type_id: leave.leave_type_id,
      start_date: leave.start_date,
      end_date: leave.end_date,
      reason: leave.reason,
      day_type: leave.day_type,
      num_days: leave.num_days,
    });

    setShowApplyModal(true);
  };

  const fetchLeaveData = async () => {
    try {
      const userId =
        localStorage.getItem("employee_user_id") ||
        localStorage.getItem("current_user_id");

      // Fetch leave requests
      const response = await apiClient.get("/api/myleave", {
        headers: { "X-User-ID": userId },
      });
      setLeaveData(response.data);

      // Fetch leave balance
      const balanceResponse = await apiClient.get("/api/leave_balance", {
        headers: { "X-User-ID": userId },
      });
      setLeaveBalance(balanceResponse.data);
    } catch (error) {
      console.error("Error fetching leave data:", error);
    }
  };

  useEffect(() => {
    fetchLeaveData();
  }, []);

  useEffect(() => {
    const handleRefresh = () => {
      fetchLeaveData();
    };

    window.addEventListener("leaveRequestUpdated", handleRefresh);

    return () => {
      window.removeEventListener("leaveRequestUpdated", handleRefresh);
    };
  }, []);

  const handleDelete = async (leaveId, status) => {
    if (status !== "Pending") return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this leave?",
    );
    if (!confirmDelete) return;

    try {
      const userId = localStorage.getItem("current_user_id");
      const role = localStorage.getItem("current_role");

      const res = await apiClient.delete(`/leave_requests/${leaveId}`, {
        headers: {
          "X-User-ID": userId,
          "X-User-Role": role,
        },
      });

      alert(res.data.message);
      window.dispatchEvent(new Event("leaveRequestUpdated"));
    } catch (err) {
      alert(err?.response?.data?.message || "Error deleting leave");
    }
  };

  const filteredAndSortedLeaves = leaveData.filter((leave) => {
    const matchesStatus =
      filterStatus === "All" ||
      leave.status?.toLowerCase() === filterStatus.toLowerCase();

    // 👇 Extract leave type from date
    const leaveTypeFromDate = leave.date?.split("/")[1]?.trim();

    const matchesLeaveType =
      filterLeaveType === "All" || leaveTypeFromDate === filterLeaveType;

    return matchesStatus && matchesLeaveType;
  });

  const handleResetFilter = () => {
    setFilterName("");
    setFilterLeaveType("All");
    setFilterStatus("All");
  };

  const handleApplyFilter = () => {
    setCurrentPage(1);
    setShowFilterPopup(false);
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  const currentRows = filteredAndSortedLeaves.slice(
    indexOfFirstRow,
    indexOfLastRow,
  );

  const totalPages = Math.ceil(filteredAndSortedLeaves.length / rowsPerPage);

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

  const handleCloseModal = () => {
    setShowApplyModal(false);
    setEditingLeave(null); // ✅ IMPORTANT FIX
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <EmployeeSidebar />

      {/* Main Content Area */}
      <div className="myleave-container">
        <Topbar />

        {/* Page Title */}
        <h2 className="page-title">{t("myLeaves")}</h2>

        {/* Leave Summary Section */}
        <div className="leave-header">
          {/* Summary Cards - Now Dynamic */}
          <div className="leave-summary">
            {leaveBalance.length > 0 ? (
              leaveBalance.slice(0, 3).map((balance) => (
                <div className="emp-summary-card" key={balance.id}>
                  <FaCheckCircle className="summary-icon" />
                  <p>
                    <strong>
                      {balance.remaining}/{balance.total} {t("days")}
                    </strong>
                    <br />
                    {balance.name}
                  </p>
                </div>
              ))
            ) : (
              <>
                <div className="emp-summary-card">
                  <FaCheckCircle className="summary-icon" />
                  <p>
                    <strong>Loading...</strong>
                    <br />
                    Leave Balance
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="leave-actions">
            <div className="top-buttons">
              <button
                className="btn-apply"
                onClick={() => {
                  setEditingLeave(null); // ✅ reset edit mode
                  setShowApplyModal(true);
                }}
              >
                Apply Leave
              </button>
              <button
                className="btn-regularization"
                onClick={() => navigate("/my-regularization")}
              >
                {t("regularization")}
              </button>
            </div>
            <div
              className="bottom-button"
              style={{ position: "relative", display: "inline-block" }}
            >
              <button
                className="btn-filter"
                ref={filterButtonRef}
                onClick={() => setShowFilterPopup(!showFilterPopup)}
              >
                <FaFilter /> {t("filter")}
              </button>

              {/* Filter Dropdown */}
              {showFilterPopup && (
                <div ref={filterRef} className="empl-app-filter-dropdown-box">
                  {/* Header */}
                  <div className="empl-app-filter-popup-header">
                    <h3>{t("filter")}</h3>
                    <button
                      className="empl-app-filter-popup-close"
                      onClick={() => setShowFilterPopup(false)}
                    >
                      <IoClose />
                    </button>
                  </div>
                  {/* Body */}
                  <div className="empl-app-filter-popup-body">
                    {/* Name Field */}
                    <div className="filter-field">
                      <label>{t("name")}</label>
                      <input
                        type="text"
                        placeholder={t("enterName")}
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                      />
                    </div>
                    {/* Leave Type and Status Row */}
                    <div className="filter-row">
                      <div className="filter-field">
                        <label>{t("leaveType")}</label>
                        <select
                          value={filterLeaveType}
                          onChange={(e) => setFilterLeaveType(e.target.value)}
                        >
                          <option value="All">All</option>
                          <option value="Full Day">Full Day</option>
                          <option value="Half Day">Half Day</option>
                        </select>
                      </div>
                      <div className="filter-field">
                        <label>{t("status")}</label>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                        >
                          <option value="All">{t("all")}</option>
                          <option value="Pending">{t("pending")}</option>
                          <option value="Approved">{t("approved")}</option>
                          <option value="Rejected">{t("rejected")}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  {/* Footer */}
                  <div className="empl-app-filter-popup-footer">
                    <button
                      className="filter-reset-btn"
                      onClick={handleResetFilter}
                    >
                      {t("reset")}
                    </button>
                    <button
                      className="filter-apply-btn"
                      onClick={handleApplyFilter}
                    >
                      {t("apply")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Leave Table */}
        <div className="leave-table">
          <table>
            <thead>
              <tr>
                <th>Sl No</th>
                <th>Leave Type</th>
                <th>Leave Dates</th>
                <th>Reason</th>
                <th>Date Of Request</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {leaveData.length > 0 ? (
                currentRows.map((leave, index) => (
                  <tr key={leave.id}>
                    <td>
                      {String(indexOfFirstRow + index + 1).padStart(2, "0")}
                    </td>
                    <td>{leave.type}</td>
                    <td>{leave.date}</td>
                    <td>{leave.reason}</td>
                    <td>
                      {leave.requestDate}
                      <span className="status">{leave.status}</span>
                    </td>
                    <td className="action-icons">
                      <FaEdit
                        className={`edit-icon ${leave.status !== "Pending" ? "disabled" : ""}`}
                        onClick={() => {
                          if (leave.status === "Pending") {
                            handleEdit(leave);
                          }
                        }}
                      />
                      <FaTimesCircle
                        className={`delete-icon ${leave.status !== "Pending" ? "disabled" : ""}`}
                        onClick={() => handleDelete(leave.id, leave.status)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    No leave records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <span>Showing</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1); // reset to first page
            }}
          >
            <option value={7}>07</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
          <div className="page-controls">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <button className="active">
              {String(currentPage).padStart(2, "0")}
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>

        {/* //apply leave modal */}
        {showApplyModal && (
          <div className="apply-modal-overlay" onClick={handleCloseModal}>
            <div className="apply-modal" onClick={(e) => e.stopPropagation()}>
              <div className="apply-modal-header">
                <h3>Apply Leave</h3>

                <button className="close-btn" onClick={handleCloseModal}>
                  ×
                </button>
              </div>

              <div className="apply-modal-body">
                <LeaveRequestForm
                  onClose={handleCloseModal}
                  leaveBalance={leaveBalance}
                  editData={editingLeave}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
