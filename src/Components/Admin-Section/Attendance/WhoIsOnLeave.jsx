import React, { useEffect, useRef, useState } from "react";
import { FaFilter, FaCalendarAlt } from "react-icons/fa";
import apiClient from "../../../utils/apiClient";
import { formatDate } from "../../../utils/dateFormat";
import "./WhoIsOnLeave.css";
import AdminSidebar from "../AdminSidebar";
import Topbar from "../Topbar";
import { useNavigate } from "react-router-dom";
import group10 from "../../../assets/Group10.png";

const WhoIsOnLeave = () => {
  const [currentTime, setCurrentTime] = useState("");
  const [leaveList, setLeaveList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Calendar state
  const [selectedDate, setSelectedDate] = useState("");

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // ✅ Date input ref
  const dateRef = useRef(null);

  // ✅ Filter popup state
  const [showFilter, setShowFilter] = useState(false);

  // ✅ Filter input states (inside popup — uncommitted)
  const [filterSearch, setFilterSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDuration, setFilterDuration] = useState("");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");

  // ✅ Applied filter states (committed after Apply is clicked)
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedType, setAppliedType] = useState("");
  const [appliedDuration, setAppliedDuration] = useState("");
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");

  const filterRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Fetch leave data from backend
  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/api/who_is_on_leave`);
        setLeaveList(response.data);
      } catch (error) {
        console.error("Error fetching leave data:", error);
        setLeaveList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaveData();
  }, []);

  // ✅ Set today as default date
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    setSelectedDate(`${year}-${month}-${day}`);
  }, []);

  // ✅ Format date like "07 Feb 2026"
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ✅ Parse any date string to comparable Date object
  // Handles: "YYYY-MM-DD", "DD Mon YYYY" (e.g. "13 Mar 2026")
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    // Try direct parse (works for YYYY-MM-DD)
    let d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
    // Try DD Mon YYYY
    const parts = dateStr.trim().split(" ");
    if (parts.length === 3) {
      d = new Date(`${parts[1]} ${parts[0]} ${parts[2]}`);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  };

  // ✅ Update time every second
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    };
    updateDate();
    const timer = setInterval(updateDate, 1000);
    return () => clearInterval(timer);
  }, []);

  // ✅ Close filter on outside click
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleClearFilters = () => {
    setFilterSearch("");
    setFilterType("");
    setFilterDuration("");
    setFilterFromDate("");
    setFilterToDate("");
    setAppliedSearch("");
    setAppliedType("");
    setAppliedDuration("");
    setAppliedFromDate("");
    setAppliedToDate("");
    setShowFilter(false);
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    setAppliedSearch(filterSearch);
    setAppliedType(filterType);
    setAppliedDuration(filterDuration);
    setAppliedFromDate(filterFromDate);
    setAppliedToDate(filterToDate);
    setCurrentPage(1);
    setShowFilter(false);
  };

  // ✅ Full filtering logic — applies all committed filters
  const filteredList = leaveList.filter((item) => {
    // Quick search (live, not committed)
    if (
      searchTerm &&
      !item.employee?.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;

    // Applied search (from filter popup)
    if (
      appliedSearch &&
      !item.employee?.toLowerCase().includes(appliedSearch.toLowerCase())
    )
      return false;

    // Applied leave type — backend sends "casual"/"sick"/"earned"
    // Dropdown values are "casual"/"sick"/"earned" (match exact)
    if (appliedType) {
      const itemType = item.type?.toLowerCase() ?? "";
      const filterT = appliedType.toLowerCase();
      // Match either "casual" in "casual leave" OR directly
      if (!itemType.includes(filterT) && !filterT.includes(itemType))
        return false;
    }

    // Applied duration (e.g. "0.5 Days", "1 Day", "2 Days")
    if (appliedDuration) {
      const daysVal = parseFloat(item.days);
      const durVal = parseFloat(appliedDuration);
      if (!isNaN(daysVal) && !isNaN(durVal)) {
        if (daysVal !== durVal) return false;
      }
    }

    // Applied from/to date range (inclusive overlap)
    if (appliedFromDate || appliedToDate) {
      const itemFrom = parseDate(item.from);
      const itemTo = parseDate(item.to);
      if (appliedFromDate) {
        const filterFrom = parseDate(appliedFromDate);
        if (filterFrom && itemTo && itemTo < filterFrom) return false;
      }
      if (appliedToDate) {
        const filterTo = parseDate(appliedToDate);
        if (filterTo && itemFrom && itemFrom > filterTo) return false;
      }
    } else if (selectedDate) {
      // Calendar date: show leaves overlapping the selected date
      // i.e. item.from <= selectedDate <= item.to
      const selD = parseDate(selectedDate);
      const itemFrom = parseDate(item.from);
      const itemTo = parseDate(item.to);
      if (selD && itemFrom && itemTo) {
        // Normalise to midnight for fair day-level comparison
        selD.setHours(0, 0, 0, 0);
        itemFrom.setHours(0, 0, 0, 0);
        itemTo.setHours(0, 0, 0, 0);
        if (selD < itemFrom || selD > itemTo) return false;
      }
    }

    return true;
  });

  // ✅ Pagination calculations
  const totalPages = Math.ceil(filteredList.length / pageSize);

  const paginatedList = filteredList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ✅ Reset to page 1 when any filter/search/pageSize changes
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearch, appliedType, appliedDuration, appliedFromDate, appliedToDate, searchTerm, selectedDate, pageSize]);

  // ✅ Guard against stale page
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages]);

  return (
    <div className="who-is-on-leave-layout">
      <div className="rightside-logo">
        <img src={group10} alt="logo" className="rightside-logos" />
      </div>

      <AdminSidebar />

      <div className="who-is-on-leave-main">
        <Topbar />

        {/* ===== Header ===== */}
        <div className="whoisleave-header">
          <h2>Leave List</h2>

          <div className="whoisleave-filter-wrapper" ref={filterRef}>
            <button
              className="whoisleave-filter-btn"
              onClick={() => setShowFilter(!showFilter)}
            >
              <FaFilter /> Filter
            </button>

            {showFilter && (
              <div className="whoisleave-filter-popup">
                <div className="filter-popup-header">
                  <h3>Filter By</h3>
                  <button
                    className="filter-close-btn"
                    onClick={() => setShowFilter(false)}
                  >
                    ×
                  </button>
                </div>

                <div className="filter-popup-body">
                  <div className="filter-group">
                    <label>Search</label>
                    <input
                      type="text"
                      placeholder="Search employee..."
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                    />
                  </div>

                  <div className="filter-row">
                    <div className="filter-group">
                      <label>Leave Type</label>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                      >
                        <option value="">All</option>
                        <option value="casual">Casual Leave</option>
                        <option value="sick">Sick Leave</option>
                        <option value="earned">Earned Leave</option>
                        <option value="half day">Half Day</option>
                        <option value="maternity">Maternity Leave</option>
                        <option value="paternity">Paternity Leave</option>
                      </select>
                    </div>

                    <div className="filter-group">
                      <label>Duration</label>
                      <select
                        value={filterDuration}
                        onChange={(e) => setFilterDuration(e.target.value)}
                      >
                        <option value="">All</option>
                        <option value="0.5">0.5 Day</option>
                        <option value="1">1 Day</option>
                        <option value="2">2 Days</option>
                        <option value="3">3 Days</option>
                        <option value="4">4 Days</option>
                        <option value="5">5 Days</option>
                        <option value="6">6 Days</option>
                        <option value="7">7 Days</option>
                      </select>
                    </div>
                  </div>

                  <div className="filter-row">
                    <div className="filter-group">
                      <label>From</label>
                      <div className="date-input-wrapper">
                        <input
                          type="date"
                          value={filterFromDate}
                          onChange={(e) => setFilterFromDate(e.target.value)}
                        />
                        <FaCalendarAlt className="date-icon" />
                      </div>
                    </div>

                    <div className="filter-group">
                      <label>To</label>
                      <div className="date-input-wrapper">
                        <input
                          type="date"
                          value={filterToDate}
                          onChange={(e) => setFilterToDate(e.target.value)}
                        />
                        <FaCalendarAlt className="date-icon" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="filter-actions">
                  <button className="filter-clear" onClick={handleClearFilters}>
                    Reset
                  </button>
                  <button className="filter-apply" onClick={handleApplyFilters}>
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== Section ===== */}
        <div className="whoisleave-section">
          <div className="whoisleave-section-header">
            <h3>Employees On Leave</h3>

            <div className="whoisleave-controls">
              <input
                type="text"
                placeholder="🔍 Quick Search..."
                className="whoisleave-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* ✅ NATIVE DATE PICKER OVERLAY */}
              <div
                className="whoisleave-date-picker"
                style={{ position: "relative" }}
              >
                <FaCalendarAlt className="calendar-icon" />
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    marginLeft: "8px",
                  }}
                >
                  {formatDate(selectedDate) || formatDisplayDate(selectedDate)}
                </span>
                <input
                  ref={dateRef}
                  type="date"
                  className="whoisleave-date-input"
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
                    border: "none",
                  }}
                  title="Select Date"
                />
              </div>

              <button
                className="whoisleave-view-btn"
                onClick={() => navigate("/attendance")}
              >
                View Attendance
              </button>
            </div>
          </div>

          <table className="whoisleave-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>From</th>
                <th>To</th>
                <th>No Of Days</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    Loading...
                  </td>
                </tr>
              ) : paginatedList.length > 0 ? (
                paginatedList.map((item, index) => (
                  <tr key={index}>
                    <td>{item.id}</td>
                    <td>{item.employee}</td>
                    <td>{item.type}</td>
                    <td>{formatDate(item.from) || item.from}</td>
                    <td>{formatDate(item.to) || item.to}</td>
                    <td className="whoisleave-days">{item.days}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ===== Pagination ===== */}
        <div className="whoisleave-pagination">
          <div className="whoisleave-showing">
            <span>
              Showing {paginatedList.length} of {filteredList.length}
            </span>
            <select
              className="whoisleave-page-select"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>05</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </select>
          </div>

          <div className="whoisleave-page-controls">
            <button
              className="whoisleave-page-btn"
              disabled={currentPage === 1 || totalPages === 0}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Prev
            </button>
            <button className="whoisleave-page-btn active">
              {String(currentPage).padStart(2, "0")}
            </button>
            <button
              className="whoisleave-page-btn"
              disabled={currentPage >= totalPages || totalPages === 0}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhoIsOnLeave;
