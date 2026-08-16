import React, { useEffect, useState } from "react";
import "./MyHoliday.css";
import EmployeeSidebar from "../AdminSidebar";
import Topbar from "../Topbar";
import group10 from "../../../assets/Group10.png";
import axios from "axios";
import {
  FaPlusCircle,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
  FaTable,
} from "react-icons/fa";
import apiClient from "../../../utils/apiClient";

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const Myholiday = () => {
  const [holidayData, setHolidayData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState("calendar");
  const [formData, setFormData] = useState({ title: "", type: "", date: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);

  // Wall calendar month/year navigation
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth()); // 0-indexed

  const fetchHolidays = async (year) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5001/api/myholidays?year=${year}`,
      );
      setHolidayData(response.data);
    } catch (error) {
      console.error("Error fetching holidays:", error);
    }
  };

  useEffect(() => {
    fetchHolidays(calYear);
  }, [calYear]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post("/api/myholidays", formData);
      if (response.status === 201) {
        alert("Holiday added successfully!");
        setIsModalOpen(false);
        setFormData({ title: "", type: "", date: "" });
        fetchHolidays(calYear);
      }
    } catch (error) {
      console.error("Error adding holiday:", error);
      alert(error.response?.data?.message || "Error adding holiday");
    }
  };

  // Pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentHolidays = holidayData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(holidayData.length / rowsPerPage);

  // --- Wall Calendar Logic ---
  const firstDay = new Date(calYear, calMonth, 1);
  const lastDay = new Date(calYear, calMonth + 1, 0);
  const totalDays = lastDay.getDate();

  // Get day of week (0=Sun...6=Sat), convert to Mon-start (0=Mon...6=Sun)
  const startDow = (firstDay.getDay() + 6) % 7;

  // Build grid cells
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  // Map holidays by day for current month
  const holidayMap = {};
  holidayData.forEach((h) => {
    if (!h.full_date) return;
    const [hYr, hMo, hDay] = h.full_date.split("-");
    const hDate = new Date(hYr, hMo - 1, hDay);
    if (hDate.getFullYear() === calYear && hDate.getMonth() === calMonth) {
      holidayMap[hDate.getDate()] = h;
    }
  });

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else setCalMonth((m) => m - 1);
  };
  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else setCalMonth((m) => m + 1);
  };

  const upcomingHolidays = holidayData
    .filter((h) => {
      if (!h.full_date) return false;
      const [hYr, hMo, hDay] = h.full_date.split("-");
      const localDate = new Date(hYr, hMo - 1, hDay);
      return localDate >= new Date().setHours(0, 0, 0, 0);
    })
    .slice(0, 6);

  return (
    <div className="layout">
      <div className="rightside-logo">
        <img src={group10} alt="logo" className="rightside-logos" />
      </div>
      <EmployeeSidebar />
      <div className="myholiday-container">
        <Topbar />
        <div className="holiday-header">
          <div className="header-left">
            <h2 className="page-title">My Holiday Calendar</h2>
            <div className="view-toggle">
              <button
                className={`toggle-btn ${view === "calendar" ? "active" : ""}`}
                onClick={() => setView("calendar")}
              >
                <FaCalendarAlt /> Calendar
              </button>
              <button
                className={`toggle-btn ${view === "table" ? "active" : ""}`}
                onClick={() => setView("table")}
              >
                <FaTable /> Table
              </button>
            </div>
          </div>
          <button
            className="add-holiday-btn"
            onClick={() => setIsModalOpen(true)}
          >
            <FaPlusCircle className="add-holiday-icon" /> Add Holiday
          </button>
        </div>

        {view === "calendar" ? (
          <div className="universal-calendar-section">
            {/* === WALL CALENDAR === */}
            <div className="wall-calendar-card">
              {/* Nav */}
              <div className="wall-cal-nav">
                <button className="wall-nav-btn" onClick={handlePrevMonth}>
                  <FaChevronLeft />
                </button>
                <h2 className="wall-cal-title">
                  {MONTH_NAMES[calMonth]} {calYear}
                </h2>
                <button className="wall-nav-btn" onClick={handleNextMonth}>
                  <FaChevronRight />
                </button>
              </div>

              {/* Weekday headers */}
              <div className="wall-cal-grid wall-cal-headers">
                {WEEKDAYS.map((d) => (
                  <div
                    key={d}
                    className={`wall-cal-header-cell ${d === "SUN" ? "sunday-header" : ""}`}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Day tiles */}
              <div className="wall-cal-grid wall-cal-body">
                {cells.map((day, idx) => {
                  if (day === null)
                    return (
                      <div
                        key={`empty-${idx}`}
                        className="wall-day-cell wall-day-empty"
                      />
                    );
                  const colIndex = idx % 7; // 0=Mon, 6=Sun
                  const isSunday = colIndex === 6;
                  const isSaturday = colIndex === 5;
                  const isToday =
                    day === today.getDate() &&
                    calMonth === today.getMonth() &&
                    calYear === today.getFullYear();
                  const holiday = holidayMap[day];
                  const holidayClass = holiday
                    ? holiday.type === "Mandatory"
                      ? "wall-holiday-mandatory"
                      : holiday.type === "Restricted"
                        ? "wall-holiday-restricted"
                        : holiday.type === "National"
                          ? "wall-holiday-national"
                          : "wall-holiday-observance"
                    : "";
                  return (
                    <div
                      key={day}
                      className={[
                        "wall-day-cell",
                        isSunday ? "wall-sunday" : "",
                        isSaturday ? "wall-saturday" : "",
                        isToday ? "wall-today" : "",
                        holidayClass,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <span className="wall-day-number">{day}</span>
                      {holiday && (
                        <div className="wall-holiday-label">
                          <span
                            className={`wall-holiday-dot dot-${holiday.type?.toLowerCase()}`}
                          />
                          <span className="wall-holiday-name">
                            {holiday.title}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="wall-cal-legend">
                <div className="legend-item">
                  <span className="legend-dot dot-national" />
                  National Holiday
                </div>
                <div className="legend-item">
                  <span className="legend-dot dot-observance" />
                  Observance Day
                </div>
                <div className="legend-item">
                  <span className="legend-dot dot-mandatory" />
                  Mandatory (Custom)
                </div>
                <div className="legend-item">
                  <span className="legend-dot dot-restricted" />
                  Restricted (Custom)
                </div>
                <div className="legend-item">
                  <span className="legend-dot dot-today" />
                  Today
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="calendar-sidebar">
              <div className="upcoming-holidays-list">
                <h3>Upcoming Holidays</h3>
                <div className="holiday-cards-container">
                  {upcomingHolidays.length === 0 && (
                    <p className="no-holidays-text">No upcoming holidays</p>
                  )}
                  {upcomingHolidays.map((holiday) => (
                    <div
                      key={holiday.id}
                      className={`upcoming-card ${holiday.type?.toLowerCase()}`}
                    >
                      <div className="card-date">{holiday.date}</div>
                      <div className="card-title">{holiday.title}</div>
                      <div
                        className={`card-type-badge ${holiday.type?.toLowerCase()}`}
                      >
                        {holiday.type}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="table-view-section">
            <div className="holiday-table-container">
              <table className="holiday-table">
                <thead>
                  <tr>
                    <th>Sl No</th>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {currentHolidays.map((holiday, index) => (
                    <tr key={holiday.id}>
                      <td>
                        {String(indexOfFirstRow + index + 1).padStart(2, "0")}
                      </td>
                      <td>{holiday.date}</td>
                      <td>{holiday.title}</td>
                      <td>
                        <span
                          className={`type-pill ${holiday.type?.toLowerCase()}`}
                        >
                          {holiday.type || "Mandatory"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="holiday-pagination">
              <div className="showing">
                Showing
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={7}>07</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
              <div className="page-controls">
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>
                <button className="page-number active">
                  {String(currentPage).padStart(2, "0")}
                </button>
                <button
                  className="page-btn"
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(p + 1, Math.max(1, totalPages)),
                    )
                  }
                  disabled={currentPage === Math.max(1, totalPages)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Holiday Modal */}
        {isModalOpen && (
          <div className="holiday-modal-overlay">
            <div className="holiday-modal">
              <div className="holiday-modal-header">
                <h3>Add Holiday</h3>
                <button
                  className="close-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  ×
                </button>
              </div>
              <form className="holiday-modal-body" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Holiday Name :</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Holiday Type:</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="" disabled hidden>
                      Select
                    </option>
                    <option value="Mandatory">Mandatory</option>
                    <option value="Restricted">Restricted</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Select Date:</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="holiday-modal-footer">
                  <button type="submit" className="add-btn">
                    Add
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Myholiday;
