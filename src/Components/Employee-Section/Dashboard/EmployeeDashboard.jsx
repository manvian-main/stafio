import React, { useEffect, useState, useRef, useContext } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { BsPeople } from "react-icons/bs";
import { IoTimeOutline } from "react-icons/io5";
import {
  MdOutlineAccessTime,
  MdOutlineLogout,
  MdOutlineBedtime,
} from "react-icons/md";
import { TbCalendarTime } from "react-icons/tb";
import {
  BsPlusCircle,
  BsEye,
  BsPencilSquare,
  BsCalendarCheck,
  BsEnvelope,
  BsFlag,
} from "react-icons/bs";
import { FaChevronRight, FaAngleDown } from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import EmployeeSidebar from "../EmployeeSidebar";
import Topbar from "../Topbar";
import NotificationBar from "../NotificationBar";
import Vector3 from "../../../assets/Vector3.svg";
import arrow3 from "../../../assets/arrow3.png";
import maleteam from "../../../assets/maleteam.png";
import clock from "../../../assets/clock.gif";
import apiClient from "../../../utils/apiClient";
import axios from "axios";
import "./EmployeeDashboard.css";
import EmployeeAttendanceCard from "./EmployeeAttendanceCard";
import { SettingsContext } from "../Settings-/SettingsContext";

// ─── Config ────────────────────────────────────────────────────────────────
const BASE_URL = "http://127.0.0.1:5001";

const MEETING_LINK = "https://meet.google.com/shm-kuvn-xqb";
const MEETING_START_HOUR = 9;
const MEETING_START_MIN = 0;
const ALERT_BEFORE_MINUTES = 10;

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatTime = (date) =>
  date instanceof Date
    ? date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    : date;

const calcWorkingTime = (punchInDate, totalBreakMs = 0) => {
  if (!punchInDate) return "00:00:00";
  const totalMs = Math.max(
    0,
    Date.now() - punchInDate.getTime() - totalBreakMs,
  );
  const totalSec = Math.floor(totalMs / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
};

const getCurrentTimeInMinutes = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};
const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// ─── Component ──────────────────────────────────────────────────────────────
const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { fmtDate } = useContext(SettingsContext);

  // ── Auth / session ────────────────────────────────────────────────────
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(null);

  // ✅ Load userId from localStorage
  useEffect(() => {
    const storedId = localStorage.getItem("employee_user_id") || localStorage.getItem("current_user_id");
    if (storedId && !userId) setUserId(storedId);
  }, [userId]);

  // ✅ Fetch username from backend
  useEffect(() => {
    const storedUsername = localStorage.getItem("employee_username") || localStorage.getItem("current_username"); // or "employeeUsername"
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  // ✅ Break times
  const [lunchBreakStr, setLunchBreakStr] = useState("1:00 PM - 2:00 PM");
  const [coffeeBreakStr, setCoffeeBreakStr] = useState("4:00 PM - 4:15 PM");
  const [breakSchedules, setBreakSchedules] = useState([
    { id: "lunch", label: "Lunch Break", start: "13:00", end: "14:00" },
    { id: "coffee", label: "Coffee Break", start: "16:00", end: "16:15" },
  ]);

  useEffect(() => {
    const fetchBreakTimes = async () => {
      try {
        const res = await apiClient.get("/api/settings/break_times");
        if (res.data) {
          const lunch = res.data.lunch_break || "1:00 PM - 2:00 PM";
          const coffee = res.data.coffee_break || "4:00 PM - 4:15 PM";
          const custom = res.data.custom_breaks || [];

          setLunchBreakStr(lunch);
          setCoffeeBreakStr(coffee);

          const parseTime = (str) => {
            if (!str) return "00:00";
            const match = str.match(/(\d+):(\d+)\s*(AM|PM)/i);
            if (!match) {
              const basicMatch = str.match(/(\d+):(\d+)/);
              return basicMatch
                ? `${basicMatch[1].padStart(2, "0")}:${basicMatch[2]}`
                : "00:00";
            }
            let [_, h, m, p] = match;
            h = parseInt(h);
            if (p.toUpperCase() === "PM" && h < 12) h += 12;
            if (p.toUpperCase() === "AM" && h === 12) h = 0;
            return `${String(h).padStart(2, "0")}:${m}`;
          };

          const lunchParts = lunch.split("-");
          const coffeeParts = coffee.split("-");

          const newSchedules = [
            {
              id: "lunch",
              label: "Lunch Break",
              start: parseTime(lunchParts[0]),
              end: parseTime(lunchParts[1]),
              range: lunch,
            },
            {
              id: "coffee",
              label: "Coffee Break",
              start: parseTime(coffeeParts[0]),
              end: parseTime(coffeeParts[1]),
              range: coffee,
            },
          ];

          custom.forEach((b, idx) => {
            const parts = (b.time || "").split("-");
            newSchedules.push({
              id: `custom_${idx}`,
              label: b.name || "Custom Break",
              start: parseTime(parts[0]),
              end: parseTime(parts[1]),
              range: b.time || "",
            });
          });

          setBreakSchedules(newSchedules);
        }
      } catch (err) {
        console.error("Error fetching break times:", err);
      }
    };
    fetchBreakTimes();
  }, []);

  // ✅ Punch In/Out
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [punchInTime, setPunchInTime] = useState(null);
  const [totalHours, setTotalHours] = useState("0:00:00");
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  // ── Punch state ───────────────────────────────────────────────────────
  const [isBreak, setIsBreak] = useState(false);
  const [activeBreak, setActiveBreak] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [showBreakDropdown, setShowBreakDropdown] = useState(false);
  const [breakAlertMsg, setBreakAlertMsg] = useState("");

  // ── API loading / error ───────────────────────────────────────────────
  const [punchLoading, setPunchLoading] = useState(false);
  const [punchError, setPunchError] = useState("");

  // ── Refs ──────────────────────────────────────────────────────────────
  const timerRef = useRef(null);
  const breakTimerRef = useRef(null);
  const breakDropdownRef = useRef(null);
  const breakStartRef = useRef(null);
  const totalBreakMsRef = useRef(0);

  // ── Dashboard stats ───────────────────────────────────────────────────
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // ── Meeting ───────────────────────────────────────────────────────────
  const [meetingTimeLeft, setMeetingTimeLeft] = useState("");
  const [hasJoined, setHasJoined] = useState(false);

  // ── Leave Notification ────────────────────────────────────────────────
  const [leaveNotification, setLeaveNotification] = useState(null);
  const [showLeaveNotif, setShowLeaveNotif] = useState(false);

  // ── Axios header helper ───────────────────────────────────────────────
  const apiHeaders = () => ({
    "X-User-ID": userId,
    "Content-Type": "application/json",
  });

  // ─────────────────────────────────────────────────────────────────────
  // 1. Session restore
  // ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const storedId = localStorage.getItem("employee_user_id");
    const storedUsername = localStorage.getItem("employee_username");
    if (storedId) setUserId(storedId);
    if (storedUsername) setUsername(storedUsername);
  }, []);

  // ─────────────────────────────────────────────────────────────────────
  // 2. Restore today's attendance on load / refresh
  // ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    const fetchTodayAttendance = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/attendance/today`, {
          headers: { "X-User-ID": userId },
        });

        const data = res.data;
        if (!data || !data.check_in) return;

        const checkInDate = new Date(data.check_in.replace(" GMT", ""));
        setPunchInTime(checkInDate);

        if (data.check_out) {
          setIsPunchedIn(false);
          setTotalHours(data.work_hours || "00:00:00");
          return;
        }

        setIsPunchedIn(true);

        const restoredBreakMs = (data.total_break_minutes || 0) * 60 * 1000;
        totalBreakMsRef.current = restoredBreakMs;

        if (data.active_break) {
          setIsBreak(true);
          const breakStart = new Date();
          breakStartRef.current = breakStart;
          setTotalHours(calcWorkingTime(checkInDate, restoredBreakMs));

          const savedBreakId = sessionStorage.getItem("active_break_id");
          const savedBreakLabel = sessionStorage.getItem("active_break_label");
          const savedBreakStart = sessionStorage.getItem("break_started_at");

          if (savedBreakStart) {
            const breakStartedAt = new Date(savedBreakStart);
            const elapsedMs = Date.now() - breakStartedAt.getTime();
            const durationMin = parseInt(sessionStorage.getItem("break_duration_min")) || 15;
            const durationMs = durationMin * 60 * 1000;
            const remainingMs = durationMs - elapsedMs;

            const alertMsg = `Your ${savedBreakLabel || "Break"} of ${durationMin} minutes has ended. Please resume work.`;
            setBreakAlertMsg(alertMsg);

            clearTimeout(breakTimerRef.current);
            if (remainingMs > 0) {
              breakTimerRef.current = setTimeout(
                () => setShowAlert(true),
                remainingMs,
              );
            } else {
              setShowAlert(true);
            }
          }
        } else {
          setTotalHours(calcWorkingTime(checkInDate, restoredBreakMs));
          startWorkingTimer(checkInDate);
        }
      } catch (err) {
        console.error("Could not restore today's attendance:", err);
      }
    };

    fetchTodayAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ─────────────────────────────────────────────────────────────────────
  // 3. Live clock
  // ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      );
      setCurrentDate(
        fmtDate(now) || now.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ─────────────────────────────────────────────────────────────────────
  // 4. Working hours timer helpers
  // ─────────────────────────────────────────────────────────────────────
  const startWorkingTimer = (punchIn) => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTotalHours(calcWorkingTime(punchIn, totalBreakMsRef.current));
    }, 1000);
  };

  const stopWorkingTimer = () => clearInterval(timerRef.current);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearTimeout(breakTimerRef.current);
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────
  // 5. Close break dropdown on outside click
  // ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (
        breakDropdownRef.current &&
        !breakDropdownRef.current.contains(e.target)
      ) {
        setShowBreakDropdown(false);
      }
    };
    if (showBreakDropdown) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showBreakDropdown]);

  // ─────────────────────────────────────────────────────────────────────
  // 6. Meeting countdown
  // ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const meetingStart = new Date();
      meetingStart.setHours(MEETING_START_HOUR, MEETING_START_MIN, 0, 0);
      const alertStart = new Date(meetingStart);
      alertStart.setMinutes(alertStart.getMinutes() - ALERT_BEFORE_MINUTES);

      if (now >= alertStart && now < meetingStart) {
        const diffSec = Math.floor((meetingStart - now) / 1000);
        const mins = String(Math.floor(diffSec / 60)).padStart(2, "0");
        const secs = String(diffSec % 60).padStart(2, "0");
        setMeetingTimeLeft(`${mins}:${secs} Min Left`);
      } else if (now >= meetingStart && !hasJoined) {
        setMeetingTimeLeft("Join the meet");
      } else if (hasJoined) {
        setMeetingTimeLeft("Meeting Ended");
      } else {
        setMeetingTimeLeft("02 Min Left");
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [hasJoined]);

  // ─────────────────────────────────────────────────────────────────────
  // 7. Dashboard stats + Leave Notification
  // ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    const fetchDashboard = async () => {
      setDashboardLoading(true);
      try {
        const response = await apiClient.get("/dashboard");
        setDashboardData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setDashboardLoading(false); // ✅ Always runs
      }
    };

    // ── Fetch leave notification ──────────────────────────────────────
    const fetchLeaveNotification = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/leave_notification`, {
          headers: { "X-User-ID": userId },
        });
        if (res.data.notification) {
          setLeaveNotification(res.data.notification);
          setShowLeaveNotif(true);
          console.log(res.data.notification);
        }
      } catch (err) {
        console.error("Leave notification fetch error:", err);
      }
    };

    fetchDashboard();
    fetchLeaveNotification();
  }, [userId]);

  // ─────────────────────────────────────────────────────────────────────
  // 8. Punch In
  // ─────────────────────────────────────────────────────────────────────
  const handlePunchIn = async (e) => {
    e.preventDefault();
    if (!userId) {
      setPunchError("User session not found. Please log in again.");
      return;
    }

    setPunchLoading(true);
    setPunchError("");

    try {
      await axios.post(
        `${BASE_URL}/api/attendance/punch-in`,
        {},
        { headers: apiHeaders() },
      );

      const now = new Date();
      setPunchInTime(now);
      totalBreakMsRef.current = 0;
      setTotalHours("00:00:00");
      setIsPunchedIn(true);
      startWorkingTimer(now);
    } catch (err) {
      setPunchError(
        err.response?.data?.message || "Punch in failed. Please try again.",
      );
    } finally {
      setPunchLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // 9. Punch Out
  // ─────────────────────────────────────────────────────────────────────
  const handlePunchOut = async () => {
    if (!userId) return;

    setPunchLoading(true);
    setPunchError("");

    try {
      const res = await axios.post(
        `${BASE_URL}/api/attendance/punch-out`,
        {},
        { headers: apiHeaders() },
      );

      stopWorkingTimer();
      clearTimeout(breakTimerRef.current);

      const finalHours =
        res.data?.work_hours ||
        calcWorkingTime(punchInTime, totalBreakMsRef.current);
      setTotalHours(finalHours);

      setIsBreak(false);
      setActiveBreak(null);
      setIsPunchedIn(false);
      totalBreakMsRef.current = 0;
    } catch (err) {
      setPunchError(
        err.response?.data?.message || "Punch out failed. Please try again.",
      );
    } finally {
      setPunchLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // 10. Start Break
  // ─────────────────────────────────────────────────────────────────────
  const handleStartBreak = async (breakItem = null) => {
    if (!userId) return;

    setPunchLoading(true);
    setPunchError("");

    try {
      await axios.post(
        `${BASE_URL}/api/attendance/start-break`,
        {},
        { headers: apiHeaders() },
      );

      const breakStart = new Date();
      stopWorkingTimer();
      setIsBreak(true);
      setActiveBreak(breakItem);
      breakStartRef.current = breakStart;
      setShowBreakDropdown(false);

      sessionStorage.setItem("active_break_id", breakItem?.id || "custom");
      sessionStorage.setItem(
        "active_break_label",
        breakItem?.label || "Custom Break",
      );
      sessionStorage.setItem("break_started_at", breakStart.toISOString());

      // Calculate duration dynamically from break schedule start/end times
      const durationMin = (breakItem?.start && breakItem?.end)
        ? toMinutes(breakItem.end) - toMinutes(breakItem.start)
        : 15;
      const durationMs = durationMin * 60 * 1000;

      // Persist duration for page refresh restore
      sessionStorage.setItem("break_duration_min", String(durationMin));

      const alertMsg = `Your ${breakItem?.label || "Break"} of ${durationMin} minutes has ended. Please resume work.`;
      setBreakAlertMsg(alertMsg);

      clearTimeout(breakTimerRef.current);
      if (durationMs > 0) {
        breakTimerRef.current = setTimeout(() => setShowAlert(true), durationMs);
      } else {
        setShowAlert(true);
      }
    } catch (err) {
      setPunchError(err.response?.data?.message || "Could not start break.");
    } finally {
      setPunchLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // 11. End Break
  // ─────────────────────────────────────────────────────────────────────
  const handleEndBreak = async () => {
    if (!userId) return;

    setPunchLoading(true);
    setPunchError("");

    try {
      await axios.post(
        `${BASE_URL}/api/attendance/end-break`,
        {},
        { headers: apiHeaders() },
      );

      if (breakStartRef.current) {
        totalBreakMsRef.current += Date.now() - breakStartRef.current.getTime();
      }

      clearTimeout(breakTimerRef.current);
      setShowAlert(false);
      setIsBreak(false);
      setActiveBreak(null);
      breakStartRef.current = null;

      sessionStorage.removeItem("active_break_id");
      sessionStorage.removeItem("active_break_label");
      sessionStorage.removeItem("break_started_at");
      sessionStorage.removeItem("break_duration_min");

      startWorkingTimer(punchInTime);
    } catch (err) {
      setPunchError(err.response?.data?.message || "Could not end break.");
    } finally {
      setPunchLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="dashboard-wrapper d-flex">
      <div className="sidebar">
        <EmployeeSidebar />
      </div>
      <div className="main-content flex-grow-1">
        <Topbar />
        <Container fluid className="p-4">
          {/* Welcome */}
          <Row className="mb-4 align-items-center">
            <div className="username">
              <h1>Hello, {username || "User"}!</h1>
            </div>

            {/* ── Leave Notification Banner ── */}
            {showLeaveNotif && leaveNotification && (
              <div className="leave-notif-banner">
                <span className="leave-notif-text">
                  Your{" "}
                  <span
                    className="leave-notif-link"
                    onClick={() => navigate("/my-leave")}
                  >
                    Leave Request
                  </span>{" "}
                  on &quot;{leaveNotification.start_date}&quot; has been{" "}
                  <span
                    className={
                      leaveNotification.status === "approved"
                        ? "leave-notif-status-approved"
                        : "leave-notif-status-rejected"
                    }
                  >
                    {leaveNotification.status === "approved"
                      ? "Approved!!!"
                      : "Rejected"}
                  </span>
                </span>
                <button
                  className="leave-notif-close"
                  onClick={() => setShowLeaveNotif(false)}
                  aria-label="Close notification"
                >
                  ✕
                </button>
              </div>
            )}
          </Row>

          {/* Meeting / Punch Card */}
          <Row className="mb-4">
            <Col md={12}>
              <div className="meeting-card d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <img src={Vector3} alt="Vector3" className="vector-img" />
                  <div className="meeting-left">
                    {/* ── STATE 1 : Not punched in ── */}
                    {!isPunchedIn ? (
                      <>
                        <h2>
                          {currentTime} , {currentDate}
                        </h2>

                        <a
                          href={MEETING_LINK}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="meeting-box"
                          onClick={() => setHasJoined(true)}
                          style={{
                            cursor: "pointer",
                            textDecoration: "none",
                            color: "inherit",
                          }}
                        >
                          <div className="meeting-info">
                            <h4>Standup Meeting</h4>
                            <p>{meetingTimeLeft}</p>
                          </div>
                          <div className="meeting-time">07</div>
                          <div className="chevron-box">
                            <FaChevronRight />
                          </div>
                        </a>

                        {punchError && (
                          <p
                            style={{
                              color: "#ff4d4d",
                              fontSize: "13px",
                              marginTop: "6px",
                            }}
                          >
                            {punchError}
                          </p>
                        )}

                        <button
                          className="btn-punch"
                          onClick={handlePunchIn}
                          disabled={punchLoading}
                        >
                          {punchLoading ? "Checking In…" : "Check In"}
                        </button>
                      </>
                    ) : (
                      /* ── STATE 2 : Punched in ── */
                      <>
                        <h2>
                          {currentTime} , {currentDate}
                        </h2>
                        <p>
                          Lunch Break {lunchBreakStr} & Coffee Break{" "}
                          {coffeeBreakStr}
                        </p>
                        <div className="punch-info-box">
                          <div className="info-item">
                            <span>Check In :</span>{" "}
                            <strong>
                              {punchInTime ? formatTime(punchInTime) : "—"}
                            </strong>
                          </div>
                          <div className="info-item">
                            <span>Total Hours :</span>{" "}
                            <strong>{totalHours}</strong>
                          </div>
                        </div>

                        {punchError && (
                          <p
                            style={{
                              color: "#ff4d4d",
                              fontSize: "13px",
                              marginTop: "6px",
                            }}
                          >
                            {punchError}
                          </p>
                        )}

                        <div className="button-row">
                          <button
                            className="btn-punch-out"
                            onClick={handlePunchOut}
                            disabled={punchLoading}
                          >
                            {punchLoading ? "Please wait…" : "Check Out"}
                          </button>

                          <div className="break-relative-container">
                            {isBreak ? (
                              <button
                                className="btn-start-break"
                                onClick={handleEndBreak}
                                disabled={punchLoading}
                              >
                                End Break
                              </button>
                            ) : (
                              <button
                                className="btn-start-break"
                                onClick={() =>
                                  setShowBreakDropdown((prev) => !prev)
                                }
                                disabled={punchLoading}
                              >
                                Start Break <FaAngleDown style={{ marginLeft: "8px", fontSize: "14px" }} />

                              </button>
                            )}

                            {showBreakDropdown && !isBreak && (
                              <div
                                className="break-dropdown"
                                ref={breakDropdownRef}
                              >
                                <p className="dropdown-title">Scheduled Breaks</p>

                                <div className="break-items-list">
                                  {breakSchedules.map((b) => {
                                    const nowMin = getCurrentTimeInMinutes();
                                    const isCurrent =
                                      nowMin >= toMinutes(b.start) &&
                                      nowMin <= toMinutes(b.end);
                                    return (
                                      <div
                                        key={b.id}
                                        className={`break-item ${isCurrent ? "active-break" : ""}`}
                                        onClick={() => handleStartBreak(b)}
                                      >
                                        <strong>{b.label}</strong>
                                        <span>
                                          {b.range ||
                                            (b.id === "lunch"
                                              ? lunchBreakStr
                                              : coffeeBreakStr)}
                                        </span>
                                      </div>
                                    );
                                  })}

                                  <div
                                    className="break-item custom-break"
                                    onClick={() =>
                                      handleStartBreak({
                                        id: "custom",
                                        label: "Custom Break",
                                      })
                                    }
                                  >
                                    ➕ Custom Break
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {showAlert && (
                          <div style={alertStyle}>
                            <span>⚠️</span>
                            <span>
                              {breakAlertMsg ||
                                "Your break time has ended. Please resume work."}
                            </span>
                            <button
                              style={closeBtnStyle}
                              onClick={() => setShowAlert(false)}
                            >
                              ✖
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Right illustration */}
                <div className="meeting-right">
                  <img src={arrow3} alt="Illustration" className="arrow3" />
                  <img src={maleteam} alt="Illustration" className="maleteam" />
                  <img src={clock} alt="Illustration" className="clock" />
                </div>
              </div>
            </Col>
          </Row>

          {/* Leave Summary Cards */}
          <Row className="notice mb-4">
            <Col md={8}>
              <Row>
                {/* ── CARD 1: Total Leaves — action: Apply Leave ── */}
                <Col md={4} lg={4} className="mb-3">
                  <Card className="summary-card"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/my-leave")}
                  >
                    <div className="summary-top">
                      <h2>
                        {dashboardLoading
                          ? "…"
                          : (dashboardData?.total_leaves ?? 0)}
                      </h2>
                      <div className="summary-icons">
                        <BsPeople />
                      </div>
                    </div>
                    <h6>Total Leaves</h6>
                    <div
                      className="summary-action"
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate("/my-leave")}
                    >
                      <div className="summary-action-icon">
                        <BsPlusCircle />
                      </div>{" "}
                      Apply Leave
                    </div>
                  </Card>
                </Col>

                {/* ── CARD 2: Taken — action: Check Leave Details ── */}
                <Col md={4} lg={4} className="mb-3">
                  <Card className="summary-card"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/my-leave")}
                  >
                    <div className="summary-top">
                      <h2>
                        {dashboardLoading
                          ? "…"
                          : (dashboardData?.leaves_taken ?? 0)}
                      </h2>
                      <div className="summary-icons">
                        <IoTimeOutline />
                      </div>
                    </div>
                    <h6>Taken</h6>
                    <div
                      className="summary-action"
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate("/my-leave")}
                    >
                      <div className="summary-action-icon">
                        <BsEye />
                      </div>{" "}
                      Check Leave Details
                    </div>
                  </Card>
                </Col>

                {/* ── CARD 3: Absent — action: Add Regularization ── */}
                <Col md={4} lg={4} className="mb-3">
                  <Card className="summary-card"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/my-regularization")}
                  >
                    <div className="summary-top">
                      <h2>
                        {dashboardLoading
                          ? "…"
                          : (dashboardData?.absent_days ?? 0)}
                      </h2>
                      <div className="summary-icons">
                        <MdOutlineAccessTime />
                      </div>
                    </div>
                    <h6>Absent</h6>
                    <div
                      className="summary-action"
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate("/my-regularization")}
                    >
                      <div className="summary-action-icon">
                        <BsPencilSquare />
                      </div>{" "}
                      Add Regularization
                    </div>
                  </Card>
                </Col>

                {/* ── CARD 4: Worked Days — action: Check Attendance Overview ── */}
                <Col md={4} lg={4} className="mb-3">
                  <Card className="summary-card"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/employee-attendance")}
                  >
                    <div className="summary-top">
                      <h2>
                        {dashboardLoading
                          ? "…"
                          : (dashboardData?.worked_days ?? 0)}
                      </h2>
                      <div className="summary-icons">
                        <MdOutlineLogout />
                      </div>
                    </div>
                    <h6>Worked Days</h6>
                    <div
                      className="summary-action"
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate("/employee-attendance")}
                    >
                      <div className="summary-action-icon">
                        <BsCalendarCheck />
                      </div>{" "}
                      Check Attendance Overview
                    </div>
                  </Card>
                </Col>

                {/* ── CARD 5: Completed Projects — no action ── */}
                <Col md={4} lg={4} className="mb-3">
                  <Card className="summary-card">
                    <div className="summary-top">
                      <h2>
                        {dashboardLoading
                          ? "…"
                          : (dashboardData?.completed_projects ?? 0)}
                      </h2>
                      <div className="summary-icons">
                        <MdOutlineBedtime />
                      </div>
                    </div>
                    <h6>Completed Projects</h6>
                    <div className="summary-action">
                      <div className="summary-action-icon">
                        <BsEnvelope />
                      </div>{" "}
                      Sent Offer Letter
                    </div>
                  </Card>
                </Col>

                {/* ── CARD 6: This Week Holiday — no action ── */}
                <Col md={4} lg={4} className="mb-3">
                  <Card className="summary-card"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/my-holidays")}
                  >
                    <div className="summary-top">
                      <h2>
                        {dashboardLoading
                          ? "…"
                          : (dashboardData?.this_week_holiday ?? 0)}
                      </h2>
                      <div className="summary-icons">
                        <TbCalendarTime />
                      </div>
                    </div>
                    <h6>This Week Holiday</h6>
                    <div className="summary-action">
                      <div className="summary-action-icon">
                        <BsFlag />
                      </div>{" "}
                      Independence Day (Fri, 15 Aug)
                    </div>
                  </Card>
                </Col>
              </Row>
            </Col>

            <Col md={4}>
              <EmployeeAttendanceCard userId={userId} />
            </Col>
          </Row>

          <Row>
            <Col md={8}>
              <NotificationBar />
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

// ─── Inline styles (existing - not touched) ────────────────────────────────
const alertStyle = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "#f47c3c",
  color: "white",
  padding: "16px 24px",
  borderRadius: "8px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  fontSize: "16px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  zIndex: 9999,
  width: "30%",
};

const closeBtnStyle = {
  background: "transparent",
  color: "white",
  border: "none",
  fontSize: "18px",
  cursor: "pointer",
  marginLeft: "10px",
};
