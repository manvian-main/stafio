import React, { useState, useEffect, useContext } from "react";
import { FaFilter, FaCalendarAlt, FaDownload, FaSearch } from "react-icons/fa";
import "./AttendanceReport.css";
import AdminSidebar from "../AdminSidebar";
import Topbar from "../Topbar";
import apiClient from "../../../utils/apiClient";
import group10 from "../../../assets/Group10.png";
import { SettingsContext } from "../../Employee-Section/Settings-/SettingsContext";

export default function AttendanceReport() {
  const { fmtDate } = useContext(SettingsContext);
  const [attendanceData, setAttendanceData] = useState([]);
  const [currentDate, setCurrentDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployeeName, setSelectedEmployeeName] = useState("");
  const [sortDays, setSortDays] = useState(9999);
  const [sortOrder, setSortOrder] = useState("newest");

  /* PAGINATION STATES */
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  /* FILTER POPUP STATES */
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [popupName, setPopupName] = useState("");
  const [popupStatus, setPopupStatus] = useState("");
  const [popupSortDays, setPopupSortDays] = useState(9999);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [employees, setEmployees] = useState([]);

  // ✅ NEW: date picker value
  const [selectedDate, setSelectedDate] = useState("");

  /* CUSTOM DROPDOWN STATE */
  const [showRowsDropdown, setShowRowsDropdown] = useState(false);
  const rowsDropdownRef = React.useRef(null);

  /* FETCH ATTENDANCE */
  useEffect(() => {
    apiClient
      .get("/api/attendancelist")
      .then((res) => setAttendanceData(res.data))
      .catch((err) => console.error(err));
  }, []);

  /* FETCH EMPLOYEES */
  useEffect(() => {
    apiClient
      .get("/api/employeeslist")
      .then((res) => setEmployees(res.data))
      .catch((err) => console.error(err));
  }, []);

  /* CLOSE DROPDOWN ON OUTSIDE CLICK */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rowsDropdownRef.current && !rowsDropdownRef.current.contains(event.target)) {
        setShowRowsDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* DATE */
  useEffect(() => {
    const now = new Date();
    setCurrentDate(fmtDate(now) || now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }));
  }, []);

  const parseDate = (dateStr) => {
    const d = new Date(dateStr);
    return isNaN(d) ? null : d;
  };

  /* FILTER LOGIC */
  const filteredAttendance = attendanceData
    .filter((r) => r.employee?.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((r) =>
      statusFilter
        ? r.status?.toLowerCase().trim() === statusFilter.toLowerCase().trim()
        : true,
    )
    .filter((r) =>
      selectedEmployeeName ? r.employee === selectedEmployeeName : true,
    )
    .filter((r) => {
      const today = new Date();
      const rd = parseDate(r.date);
      if (!rd) return true;
      return (
        (today.getTime() - rd.getTime()) / (1000 * 60 * 60 * 24) <= sortDays
      );
    })
    .filter((r) => {
      if (!fromDate && !toDate) return true;
      const rd = parseDate(r.date);
      if (!rd) return true;
      if (fromDate && rd < new Date(fromDate)) return false;
      if (toDate && rd > new Date(toDate + "T23:59:59")) return false;
      return true;
    })
    // ✅ NEW: selectedDate filter
    .filter((r) => {
      if (!selectedDate) return true;
      const rd = parseDate(r.date);
      if (!rd) return true;
      const picked = new Date(selectedDate);
      return (
        rd.getDate() === picked.getDate() &&
        rd.getMonth() === picked.getMonth() &&
        rd.getFullYear() === picked.getFullYear()
      );
    })
    // ✅ ADD THIS PART
  .sort((a, b) => {
    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);

    if (!dateA || !dateB) return 0;

    return sortOrder === "newest"
      ? dateB - dateA   // Newest first
      : dateA - dateB;  // Oldest first
  });

  /* Reset to page 1 whenever filters change */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedEmployeeName, statusFilter, sortDays, fromDate, toDate, selectedDate]);

  /* PAGINATION DERIVED VALUES */
  const totalPages = Math.max(1, Math.ceil(filteredAttendance.length / rowsPerPage));
  const paginatedAttendance = filteredAttendance.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  /* FILTER ACTIONS */
  const handleResetFilters = () => {
    setPopupName("");
    setPopupStatus("");
    setPopupSortDays(9999);
    setFromDate("");
    setToDate("");
  };

  const handleDownload = () => {
    if (filteredAttendance.length === 0) {
      alert("No data available to download");
      return;
    }

    const headers = [
      "ID",
      "Employee",
      "Role",
      "Status",
      "Date",
      "Check-in",
      "Check-out",
      "Work hours",
    ];
    const csvRows = [
      headers.join(","),
      ...filteredAttendance.map((row) =>
        [
          row.id,
          `"${row.employee}"`,
          `"${row.role}"`,
          `"${row.status}"`,
          row.date,
          row.checkIn,
          row.checkOut,
          row.workHours,
        ].join(","),
      ),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Attendance_Report_${selectedDate || "All"}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApplyFilters = () => {
    setSearchTerm(popupName);
    setStatusFilter(popupStatus);
    setSortDays(popupSortDays);
    setShowFilterPopup(false);
  };

  return (
    <div className="att-report-layout">
      <div className="rightside-logo">
        <img src={group10} alt="logo" className="rightside-logos" />
      </div>

      <AdminSidebar />

      <div className="att-report-main">
        <Topbar />

        {/* HEADER */}
        <div className="att-report-header">
          <h2>Attendance Report</h2>
          <select
            className="att-report-dropdown"
            value={selectedEmployeeName}
            onChange={(e) => {
              setSelectedEmployeeName(e.target.value);
              setCurrentPage(1); // always start from page 1 when employee changes
            }}
          >
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.name}>
                {emp.name} ({emp.empId})
              </option>
            ))}
          </select>
        </div>

        {/* FILTER BAR */}
        <div className="att-report-filterbar">
          <div className="att-report-search-box">
            <FaSearch className="search-iconn1" size={14} />
            <input
              type="text"
              placeholder="Search..."
              className="search-input2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* FILTER BUTTON */}
          <div style={{ position: "relative" }}>
            <button
              className="att-report-filter-btn"
              onClick={() => setShowFilterPopup(!showFilterPopup)}
            >
              <FaFilter /> Filter
            </button>

            {showFilterPopup && (
              <div className="att-filter-popup">
                <h3 className="att-filter-title">Filter</h3>

                <label className="att-filter-label">Name</label>
                <input
                  className="att-filter-input"
                  value={popupName}
                  onChange={(e) => setPopupName(e.target.value)}
                />

                <div className="att-filter-row">
                  <div className="att-filter-col">
                    <label>Status</label>
                    <select
                      className="att-filter-select"
                      value={popupStatus}
                      onChange={(e) => setPopupStatus(e.target.value)}
                    >
                      <option value="">All Statuses</option>
                      <option value="On Time">On Time</option>
                      <option value="Late Login">Late Login</option>
                      <option value="Absent">Absent</option>
                    </select>
                  </div>

                  <div className="att-filter-col">
                    <label>Days</label>
                    <select
                      className="att-filter-select"
                      value={popupSortDays}
                      onChange={(e) => setPopupSortDays(Number(e.target.value))}
                    >
                      <option value={9999}>All Dates</option>
                      <option value={5}>Last 5 Days</option>
                      <option value={10}>Last 10 Days</option>
                      <option value={20}>Last 20 Days</option>
                    </select>
                  </div>
                </div>

                <div className="att-filter-row">
                  <div className="att-filter-col">
                    <label>From</label>
                    <input
                      type="date"
                      className="att-filter-select"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </div>

                  <div className="att-filter-col">
                    <label>To</label>
                    <input
                      type="date"
                      className="att-filter-select"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="att-filter-footer">
                  <button
                    className="att-filter-reset"
                    onClick={handleResetFilters}
                  >
                    Reset
                  </button>
                  <button
                    className="att-filter-apply"
                    onClick={handleApplyFilters}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SORT */}
          <select
  className="att-report-sort"
  value={sortOrder}
  onChange={(e) => setSortOrder(e.target.value)}
>
  <option value="newest">Sort By : Newest</option>
  <option value="oldest">Sort By : Oldest</option>
</select>
        </div>

        {/* TABLE */}
        <div className="att-report-table-wrapper">
          <div className="att-report-table-header">
            <h3>Attendance Overview</h3>

            {/* ✅ UPDATED: search + calendar + download */}
            <div className="header-controls">
              {/* Search bar (right side) */}
              <FaSearch className="search-iconn1" size={14} />
              <input
                type="text"
                className="att-header-search"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* Calendar working */}
              <div className="att-report-date">
                <FaCalendarAlt />
                <input
                  type="date"
                  className="att-date-input"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <button
                className="att-report-download-btn"
                onClick={handleDownload}
              >
                <FaDownload /> Download
              </button>
            </div>
          </div>

          <table className="att-report-table">
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
              {paginatedAttendance.length > 0 ? (
                paginatedAttendance.map((r, i) => {
                  const status = r.status?.toLowerCase().trim();
                  const statusClass =
                    status === "on time" ? "att-status-ontime" :
                    status === "absent"  ? "att-status-absent" :
                    status === "late login" ? "att-status-late" : "";
                  const timeClass =
                    status === "on time" ? "att-time-ontime" :
                    status === "absent"  ? "att-time-absent" :
                    status === "late login" ? "att-time-late" : "";
                  return (
                    <tr key={`${r.employee}-${r.date}-${r.checkIn}-${i}`}>
                      <td>{r.id}</td>
                      <td>{r.employee}</td>
                      <td>{r.role || "—"}</td>
                      <td><span className={statusClass}>{r.status}</span></td>
                      <td>{fmtDate(r.date) || r.date}</td>
                      <td className={timeClass}>{r.checkIn}</td>
                      <td className={timeClass}>{r.checkOut}</td>
                      <td>{r.workHours}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination — always visible */}
        <div className="att-report-pagination">
          {/* LEFT: Showing [05 ▾] */}
          <div className="att-report-showing" ref={rowsDropdownRef}>
            <span>Showing</span>
            <div className="att-showing-pill">
              <span
                className="att-showing-pill-btn"
                onClick={() => setShowRowsDropdown(!showRowsDropdown)}
              >
                {String(rowsPerPage).padStart(2, "0")} ▾
              </span>
              {showRowsDropdown && (
                <div className="rows-dropdown-popup">
                  {[5, 10, 15, 20].map((n) => (
                    <div
                      key={n}
                      className={`rows-option ${rowsPerPage === n ? "active" : ""}`}
                      onClick={() => {
                        setRowsPerPage(n);
                        setCurrentPage(1);
                        setShowRowsDropdown(false);
                      }}
                    >
                      {String(n).padStart(2, "0")}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Prev / 01 / Next */}
          <div className="att-report-page-controls">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <button className="active">
              {String(currentPage).padStart(2, "0")}
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
