import React, { useState, useEffect, useRef, useContext } from "react";
import { FaFilter, FaCalendarAlt, FaTimes } from "react-icons/fa";
import "./Attendance.css";
import AdminSidebar from "../AdminSidebar";
import Topbar from "../Topbar";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../utils/apiClient";
import group10 from "../../../assets/Group10.png";
import { SettingsContext } from "../../Employee-Section/Settings-/SettingsContext";

const Attendance = () => {
  const { fmtDate } = useContext(SettingsContext);
  const [attendanceData, setAttendanceData] = useState([]);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  // ✅ ONLY CHANGE: date picker state
  const [selectedDate, setSelectedDate] = useState("");
  const dateInputRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // days filter
  const [sortDays, setSortDays] = useState(7);

  // NEW: sort order
  const [sortOrder, setSortOrder] = useState("newest"); // newest | oldest

  const [showFilterModal, setShowFilterModal] = useState(false);

  // Filter modal states
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDays, setFilterDays] = useState("Last 7 Days");

  // Calendar (From / To)
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");

  // Applied From/To Dates
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");

  const filterButtonRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Fetch attendance data with filters from backend
  const fetchAttendanceData = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("name", searchTerm);
      if (statusFilter && statusFilter !== "All") params.append("status", statusFilter);
      if (sortOrder) params.append("order", sortOrder);

      // Preference: 1. Specific From/To range from modal, 2. Header selectedDate, 3. Default "Last N Days"
      if (appliedFromDate || appliedToDate) {
        if (appliedFromDate) params.append("from_date", appliedFromDate);
        if (appliedToDate) params.append("to_date", appliedToDate);
      } else if (selectedDate) {
        params.append("from_date", selectedDate);
        params.append("to_date", selectedDate);
      } else if (sortDays) {
        params.append("days", sortDays);
      }

      const response = await apiClient.get(`/api/attendancelist?${params.toString()}`);
      setAttendanceData(response.data);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [
    searchTerm,
    statusFilter,
    selectedDate,
    sortDays,
    sortOrder,
    appliedFromDate,
    appliedToDate,
  ]);

  // ✅ ONLY CHANGE: set today as default date (local time)
  // useEffect(() => {
  //   const now = new Date();
  //   const year = now.getFullYear();
  //   const month = String(now.getMonth() + 1).padStart(2, "0");
  //   const day = String(now.getDate()).padStart(2, "0");
  //   setSelectedDate(`${year}-${month}-${day}`);
  // }, []);

  // ✅ ONLY CHANGE: format date like "07 Feb 2026"
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Convert string date (like "2025-02-07") to Date object safely
  const toDateObj = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d;
  };

  // Convert record.date (backend) safely
  const parseRecordDate = (recordDate) => {
    const d = new Date(recordDate);
    if (isNaN(d.getTime())) return null;
    return d;
  };

  const handleApplyFilter = () => {
    setSearchTerm(filterName);
    setStatusFilter(filterStatus);
    setAppliedFromDate(filterFromDate);
    setAppliedToDate(filterToDate);

    // If modal date range is applied, clear the header's specific date filter
    if (filterFromDate || filterToDate) {
      setSelectedDate("");
    }

    const daysMap = {
      "Last 5 Days": 5,
      "Last 7 Days": 7,
      "Last 10 Days": 10,
      "Last 20 Days": 20,
    };

    setSortDays(daysMap[filterDays] || 7);
    setShowFilterModal(false);
  };

  const handleResetFilter = () => {
    setFilterName("");
    setFilterStatus("All");
    setFilterDays("Last 7 Days");
    setFilterFromDate("");
    setFilterToDate("");

    setSearchTerm("");
    setStatusFilter("All");
    setAppliedFromDate("");
    setAppliedToDate("");
    setSortDays(7);
    setSortOrder("newest");

    // ✅ ONLY CHANGE: reset date also (local time)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    setSelectedDate(`${year}-${month}-${day}`);
  };

  const filteredAttendance = attendanceData; // Backend handles filtering now

  const totalPages = Math.ceil(filteredAttendance.length / pageSize);

  const paginatedData = filteredAttendance.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    statusFilter,
    selectedDate,
    sortDays,
    sortOrder,
    appliedFromDate,
    appliedToDate,
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages]);

  return (
    <div className="attendance-layout">
      <div className="rightside-logo ">
        <img src={group10} alt="logo" className="rightside-logos" />
      </div>

      <AdminSidebar />

      <div className="attendance-main">
        <Topbar />

        <div className="attendance-header">
          <h2>Attendance</h2>

          <div className="attendance-controls">
            <button
              ref={filterButtonRef}
              className="attendance-filter-button"
              onClick={() => setShowFilterModal(!showFilterModal)}
            >
              <FaFilter /> Filter
            </button>

            {/* ✅ NEW SORT DROPDOWN */}
            <select
              className="sort-dropdown"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Sort By : Newest</option>
              <option value="oldest">Sort By : Oldest</option>
            </select>
          </div>
        </div>

        <div className="attendance-section">
          <div className="section-header">
            <h3>Attendance Overview</h3>

            <div className="section-controls">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search by employee..."
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="date-picker">
                <FaCalendarAlt />
                <span>{selectedDate ? fmtDate(selectedDate) : "Select Date"}</span>

                <input
                  ref={dateInputRef}
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  onClick={(e) => {
                    if (e.target.showPicker) {
                      e.target.showPicker();
                    }
                  }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer",
                    zIndex: 10,
                  }}
                  title="Select Date"
                />
              </div>

              <button
                className="who-is-on-leave-btn"
                onClick={() => navigate("/who-is-on-leave")}
              >
                Who Is On Leave
              </button>
            </div>
          </div>

          <table className="attendance-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee</th>
                <th>Role</th>
                <th>Status</th>
                <th>Date</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Work hours</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((record, index) => (
                  <tr key={index}>
                    <td>{record.id}</td>
                    <td>{record.employee}</td>
                    <td>{record.role}</td>

                    <td>
                      <span
                        className={`status ${record.status
                          ?.toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td>{fmtDate(record.date) || record.date}</td>
                    <td className="time-cell">{record.checkIn}</td>
                    <td className="time-cell">{record.checkOut}</td>
                    <td>{record.workHours}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination1">
          <div className="showing-info">
            <span>
              Showing {paginatedData.length} of {filteredAttendance.length}
            </span>
            <select
              className="page-size-select1"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1); // reset page
              }}
            >
              <option value={5}>05</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
          </div>

          <div className="pagination-controls">
            <button
              className="page-btn"
              disabled={currentPage === 1 || totalPages === 0}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Prev
            </button>

            <button className="page-btn active">
              {String(currentPage).padStart(2, "0")}
            </button>

            <button
              className="page-btn"
              disabled={currentPage >= totalPages || totalPages === 0}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Filter Dropdown */}
      {showFilterModal && (
        <>
          <div
            className="filter-dropdown-overlay"
            onClick={() => setShowFilterModal(false)}
          />

          <div className="filter-dropdown-container">
            <div className="filter-dropdown-header">
              <h3>Filter</h3>

              <button
                className="filter-dropdown-close"
                onClick={() => setShowFilterModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="filter-dropdown-body">
              <div className="filter-dropdown-field">
                <label>Name</label>
                <input
                  type="text"
                  placeholder="Enter employee name"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                />
              </div>

              <div className="filter-dropdown-row">
                <div className="filter-dropdown-field">
                  <label>Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="All">All</option>
                    <option value="On Time">On Time</option>
                    <option value="Late Login">Late Login</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>

                <div className="filter-dropdown-field">
                  <label>Days</label>
                  <select
                    value={filterDays}
                    onChange={(e) => setFilterDays(e.target.value)}
                  >
                    <option value="Last 5 Days">Last 5 Days</option>
                    <option value="Last 7 Days">Last 7 Days</option>
                    <option value="Last 10 Days">Last 10 Days</option>
                    <option value="Last 20 Days">Last 20 Days</option>
                  </select>
                </div>
              </div>

              {/* ✅ WORKING CALENDAR FILTER */}
              <div className="filter-dropdown-row">
                <div className="filter-dropdown-field">
                  <label>From</label>
                  <input
                    type="date"
                    value={filterFromDate}
                    onChange={(e) => setFilterFromDate(e.target.value)}
                  />
                </div>

                <div className="filter-dropdown-field">
                  <label>To</label>
                  <input
                    type="date"
                    value={filterToDate}
                    onChange={(e) => setFilterToDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="filter-dropdown-footer">
              <button
                className="filter-dropdown-reset"
                onClick={handleResetFilter}
              >
                Reset
              </button>

              <button
                className="filter-dropdown-apply"
                onClick={handleApplyFilter}
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Attendance;
