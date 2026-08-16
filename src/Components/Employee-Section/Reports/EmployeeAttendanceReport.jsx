import React, { useState, useEffect, useMemo, useContext } from "react";
import { SettingsContext } from "../Settings-/SettingsContext";
import { useNavigate } from "react-router-dom";
import EmployeeSidebar from "../EmployeeSidebar";
import Topbar from "../Topbar";
import axios from "axios";
import "./EmployeeAttendanceReport.css";

const EmployeeAttendanceReport = () => {
  const navigate = useNavigate();

  const { fmtDate } = useContext(SettingsContext);

  const [allData, setAllData] = useState([]);
  const [stats, setStats] = useState({
    working_days: 0,
    total_leaves: 0,
    late_logins: 0,
    on_time_logins: 0,
  });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortRange, setSortRange] = useState("7days");
  const [quickSearch, setQuickSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("current_user_id");

        const [attRes, statsRes] = await Promise.all([
          axios.get("http://127.0.0.1:5001/api/attendance", {
            headers: { "X-User-ID": userId },
          }),
          axios.get("http://127.0.0.1:5001/api/attendance_stats", {
            headers: { "X-User-ID": userId },
          }),
        ]);
        setAllData(attRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error("Attendance report fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const downloadCSV = () => {
    const headers = [
      "Date",
      "Check-in",
      "Check-out",
      "Status",
      "Late",
      "Overtime",
      "Work Hours",
    ];
    const rows = filteredData.map((r) => [
      formatDate(r.date),
      r.checkIn || "-",
      r.checkOut || "-",
      r.status || "-",
      r.late || "-",
      r.overtime || "-",
      r.workHours || "-",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance_report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return fmtDate(dateStr);
  };


  const resetPage = () => setCurrentPage(1);

  const filteredData = useMemo(() => {
    let data = [...allData];
    const now = new Date();

    if (sortRange === "7days") {
      const cut = new Date(now);
      cut.setDate(now.getDate() - 7);
      data = data.filter((r) => new Date(r.date) >= cut);
    } else if (sortRange === "30days") {
      const cut = new Date(now);
      cut.setDate(now.getDate() - 30);
      data = data.filter((r) => new Date(r.date) >= cut);
    }

    const statusMap = {
      present: "On Time",
      absent: "Absent",
      late: "Late Login",
    };
    if (filterStatus)
      data = data.filter((r) => r.status === statusMap[filterStatus]);
    if (filterDate) data = data.filter((r) => r.date === filterDate);

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.date?.toLowerCase().includes(q) ||
          r.status?.toLowerCase().includes(q),
      );
    }
    if (quickSearch.trim()) {
      const q = quickSearch.toLowerCase();
      data = data.filter(
        (r) =>
          r.date?.toLowerCase().includes(q) ||
          r.status?.toLowerCase().includes(q) ||
          r.checkIn?.toLowerCase().includes(q) ||
          r.checkOut?.toLowerCase().includes(q) ||
          r.workHours?.toLowerCase().includes(q) ||
          String(r.late || "")
            .toLowerCase()
            .includes(q) ||
          String(r.overtime || "")
            .toLowerCase()
            .includes(q),
      );
    }

    data.sort((a, b) => new Date(b.date) - new Date(a.date));
    return data;
  }, [allData, sortRange, filterStatus, filterDate, search, quickSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedData = filteredData.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage,
  );

  const statusClass = (s) =>
    s === "On Time"
      ? "ear__status-green"
      : s === "Absent"
        ? "ear__status-red"
        : "ear__status-yellow";

  const timeClass = (s) =>
    s === "Absent"
      ? "ear__time-red"
      : s === "Late Login"
        ? "ear__time-yellow"
        : "ear__time-blue";

  const cards = [
    { label: "Total Working Days", value: stats.working_days },
    { label: "Total Leave Taken", value: stats.total_leaves },
    { label: "Late Logins", value: stats.late_logins },
    { label: "On Time Logins", value: stats.on_time_logins },
  ];

  return (
    <div className="layout">
      <EmployeeSidebar />

      <div className="ear__page">
        <Topbar />

        <h2 className="ear__heading">Attendance Report</h2>

        {/* ── Summary Cards ── */}
        <div className="ear__cards">
          {cards.map((card, idx) => (
            <div className="ear__card" key={idx}>
              <svg className="ear__card-svg" viewBox="0 0 28 28" fill="none">
                <circle
                  cx="14"
                  cy="14"
                  r="12"
                  stroke="#28a745"
                  strokeWidth="1.8"
                />
                <polyline
                  points="8,14 12,18 20,10"
                  stroke="#28a745"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="ear__card-num">{card.value}</div>
              <div className="ear__card-lbl">{card.label}</div>
            </div>
          ))}
        </div>

        {/* ── Top Controls ── */}
        <div className="ear__topbar">
          <div className="ear__search-box">
            <svg className="ear__sb-icon" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke="#999" strokeWidth="1.7" />
              <line
                x1="13.5"
                y1="13.5"
                x2="17"
                y2="17"
                stroke="#999"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              className="ear__input ear__search-input"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
            />
          </div>

          <div className="ear__filter-box">
            <svg className="ear__fn-icon" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 4h18L13 13v7l-2-1v-6L3 4z"
                stroke="#000"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="ear__filter-lbl">Filter</span>
            <select
              className="ear__filter-overlay"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                resetPage();
              }}
            >
              <option value="">All</option>
              <option value="present">On Time</option>
              <option value="absent">Absent</option>
              <option value="late">Late Login</option>
            </select>
          </div>

          <div className="ear__sort-box">
            <select
              className="ear__sort-sel"
              value={sortRange}
              onChange={(e) => {
                setSortRange(e.target.value);
                resetPage();
              }}
            >
              <option value="7days">Sort By : Last 7 Days</option>
              <option value="30days">Sort By : Last 30 Days</option>
              <option value="all">Sort By : All Time</option>
            </select>
            <svg className="ear__sort-chevron" viewBox="0 0 20 20" fill="none">
              <polyline
                points="5,7 10,13 15,7"
                stroke="#555"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* ── Overview Table Card ── */}
        <div className="ear__overview">
          <div className="ear__overview-hdr">
            <span className="ear__overview-title">Attendance Overview</span>
            <div className="ear__overview-actions">
              <div className="ear__qs-box">
                <svg className="ear__qs-icon" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                    stroke="#bbb"
                    strokeWidth="1.8"
                  />
                  <line
                    x1="16.5"
                    y1="16.5"
                    x2="21"
                    y2="21"
                    stroke="#bbb"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Quick Search..."
                  className="ear__qs-input"
                  value={quickSearch}
                  onChange={(e) => {
                    setQuickSearch(e.target.value);
                    resetPage();
                  }}
                />
              </div>

              <div
                className="ear__dp-box"
                onClick={() =>
                  document.getElementById("ear-date-input").showPicker?.()
                }
              >
                <svg className="ear__dp-icon" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="17"
                    rx="2"
                    stroke="#aaa"
                    strokeWidth="1.7"
                  />
                  <line
                    x1="3"
                    y1="9"
                    x2="21"
                    y2="9"
                    stroke="#aaa"
                    strokeWidth="1.7"
                  />
                  <line
                    x1="8"
                    y1="2"
                    x2="8"
                    y2="6"
                    stroke="#aaa"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                  <line
                    x1="16"
                    y1="2"
                    x2="16"
                    y2="6"
                    stroke="#aaa"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="ear__dp-label">
                  {filterDate
                    ? fmtDate(filterDate)
                    : "Select date"}
                </span>
                <svg
                  className="ear__dp-chevron"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <polyline
                    points="5,7 10,13 15,7"
                    stroke="#aaa"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  id="ear-date-input"
                  type="date"
                  className="ear__dp-hidden"
                  value={filterDate}
                  onChange={(e) => {
                    setFilterDate(e.target.value);
                    resetPage();
                  }}
                />
              </div>

              <button className="ear__download-btn" onClick={downloadCSV}>
                <svg className="ear__dl-icon" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3v13M7 11l5 5 5-5"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 20h16"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Download
              </button>
            </div>
          </div>

          <div className="ear__table-wrap">
            {loading ? (
              <div className="ear__empty">Loading...</div>
            ) : (
              <table className="ear__table">
                <thead>
                  <tr className="ear__thead-tr">
                    <th>Date</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Status</th>
                    <th>Late</th>
                    <th>Overtime</th>
                    <th>Work hours</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="ear__empty">
                        No records found
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((r, i) => (
                      <tr key={i} className="ear__tbody-tr">
                        <td>{formatDate(r.date)}</td>
                        <td className={timeClass(r.status)}>{r.checkIn}</td>
                        <td className={timeClass(r.status)}>{r.checkOut}</td>
                        <td>
                          <span className={statusClass(r.status)}>
                            {r.status}
                          </span>
                        </td>
                        <td>{r.late || "-"}</td>
                        <td>{r.overtime || "-"}</td>
                        <td
                          className={
                            r.status === "Late Login" ? "ear__time-red" : ""
                          }
                        >
                          {r.workHours}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div className="ear__footer">
            <div className="ear__showing">
              <span>Showing</span>
              <select
                className="ear__showing-sel"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  resetPage();
                }}
              >
                <option value={6}>06</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            <div className="ear__pag">
              <button
                className="ear__pag-prev"
                disabled={safePage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </button>

              <button className="ear__pag-num">
                {String(safePage).padStart(2, "0")}
              </button>

              <button
                className="ear__pag-next"
                disabled={safePage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendanceReport;