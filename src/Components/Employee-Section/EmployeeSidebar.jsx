import React, { useEffect, useState, useContext } from "react";
import { SettingsContext } from "./Settings-/SettingsContext";
import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import "./EmployeeSidebar.css";
import stafioimg from "../../assets/stafioimg.png";
import booking from "../../assets/booking.png";
import Group from "../../assets/Group.png";
import Group1 from "../../assets/Group1.png";
import Group2 from "../../assets/Group2.png";
import Group5 from "../../assets/Group5.png";
import Vector from "../../assets/Vector.png";
import Vector1 from "../../assets/Vector1.svg";
import Vector2 from "../../assets/Vector2.svg";
import { useLocation } from "react-router-dom";

// LeaveMenu
export const LeaveMenu = () => {
  const { t } = useContext(SettingsContext);
  const location = useLocation();
  const isLeavePageActive =
    location.pathname.startsWith("/my-leave") ||
    location.pathname.startsWith("/my-regularization") ||
    location.pathname.startsWith("/my-holidays");
  const [open, setOpen] = useState(false);

  const leavePaths = ["/my-leave", "/my-regularization", "/my-holidays"];
  const isLeaveActive = leavePaths.includes(location.pathname);

  useEffect(() => {
    if (isLeaveActive) setOpen(true);
  }, [isLeaveActive]);

  const handleLeaveClick = () => {
    setOpen(!open);
  };

  return (
    <div className="leave-menu">
      {/* Main Leave Nav */}
      <div
        className={`sidebar-link d-flex align-items-center justify-content-between ${
          isLeaveActive ? "active" : ""
        }`}
        onClick={handleLeaveClick}
      >
        <div className="d-flex align-items-center">
          <img
            src={Group1}
            alt="Leave Icon"
            className={`me-2 sidebar-icon ${isLeavePageActive ? "active" : ""}`}
          />
          <div className="leave">{t("leave")}</div>
        </div>
        <div className="chev-container">
          {open ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
        </div>
      </div>

      {/* Submenu Links */}
      {open && (
        <div className="submenu ms-4 mt-2">
          <NavLink
            to="/my-leave"
            className={({ isActive }) =>
              `submenu-link ${isActive ? "active" : ""}`
            }
          >
            {t("myLeaves")}
          </NavLink>
          <NavLink
            to="/my-regularization"
            className={({ isActive }) =>
              `submenu-link ${isActive ? "active" : ""}`
            }
          >
            {t("myRegularization")}
          </NavLink>
          <NavLink
            to="/my-holidays"
            className={({ isActive }) =>
              `submenu-link ${isActive ? "active" : ""}`
            }
          >
            {t("myHolidays")}
          </NavLink>
        </div>
      )}
    </div>
  );
};

// ReportsMenu — mirrors AdminSidebar's ReportMenu using Group5 icon
export const ReportsMenu = () => {
  const { t } = useContext(SettingsContext);
  const location = useLocation();
  const isReportsPageActive =
    location.pathname.startsWith("/employee-attendance-report") ||
    location.pathname.startsWith("/employee-leave-report");
  const [open, setOpen] = useState(false);

  const reportPaths = ["/employee-attendance-report", "/employee-leave-report"];
  const isReportActive = reportPaths.includes(location.pathname);

  useEffect(() => {
    if (isReportActive) setOpen(true);
  }, [isReportActive]);

  const handleReportClick = () => {
    setOpen(!open);
  };

  return (
    <div className="report-menu">
      {/* Main Report Nav */}
      <div
        className={`sidebar-link d-flex align-items-center justify-content-between ${
          isReportActive ? "active" : ""
        }`}
        onClick={handleReportClick}
      >
        <div className="d-flex align-items-center">
          <img
            src={Group5}
            alt="Report Icon"
            className={`me-2 sidebar-icon ${isReportsPageActive ? "active" : ""}`}
          />
          <div className="report">{t("reports")}</div>
        </div>
        <div className="chev-container">
          {open ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
        </div>
      </div>

      {/* Submenu Links */}
      {open && (
        <div className="submenu ms-4 mt-2">
          <NavLink
            to="/employee-attendance-report"
            className={({ isActive }) =>
              `submenu-link ${isActive ? "active" : ""}`
            }
          >
            {t("attendanceReport")}
          </NavLink>
          <NavLink
            to="/employee-leave-report"
            className={({ isActive }) =>
              `submenu-link ${isActive ? "active" : ""}`
            }
          >
            {t("leaveReport")}
          </NavLink>
        </div>
      )}
    </div>
  );
};

const EmployeeSidebar = () => {
  const { t } = useContext(SettingsContext);
  const location = useLocation();
  const isEmployeeDashboardActive = location.pathname === "/employee-dashboard";
  const isAttendancesActive = location.pathname === "/employee-attendance";
  const isSettingsPageActive = location.pathname === "/settings";

  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowSidebar(true), 100);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("remember_employee");
    localStorage.removeItem("employee_email");
    localStorage.removeItem("employee_password");
    window.location.href = "/employee-login";
  };

  return (
    <div
      className={`employee-sidebar d-flex flex-column ${
        showSidebar ? "show" : ""
      }`}
    >
      {/* Sidebar Header */}
      <div className="employee-sidebar-header text-center">
        <img src={stafioimg} alt="StafiO Logo" className="sidebar-logo" />
      </div>

      <div className="sidebar-scroll-content">
        {/* Sidebar Links */}
        <Nav className="flex-column">
          <Nav.Link
            as={NavLink}
            to="/employee-dashboard"
            className="sidebar-link"
          >
            <img
              src={Group}
              alt="Dashboard Logo"
              className={`me-2 sidebar-icon ${
                isEmployeeDashboardActive ? "active" : ""
              }`}
            />
            {t("dashboard")}
          </Nav.Link>

          {/* Leave Menu */}
          <NavLink to="/my-leave" className="sidebar-leave-link">
            <LeaveMenu />
          </NavLink>

          {/* Reports Menu */}
          <NavLink
            to="/employee-attendance-report"
            className="sidebar-leave-link"
          >
            <ReportsMenu />
          </NavLink>

          <Nav.Link
            as={NavLink}
            to="/employee-attendance"
            className="sidebar-link"
          >
            <img
              src={Group2}
              alt="Attendance Logo"
              className={`me-2 sidebar-icon ${
                isAttendancesActive ? "active" : ""
              }`}
            />
            {t("attendance")}
          </Nav.Link>

          <Nav.Link as={NavLink} to="/profile" className="sidebar-link">
            <img
              src={Vector}
              alt="Profile Logo"
              className="me-2"
              style={{ width: "20px", height: "20px" }}
            />
            {t("profile")}
          </Nav.Link>

          <Nav.Link as={NavLink} to="/settings" className="sidebar-link">
            <img
              src={Vector2}
              alt="Settings Logo"
              className={`me-2 sidebar-icon ${
                isSettingsPageActive ? "active" : ""
              }`}
            />
            {t("settings")}
          </Nav.Link>
        </Nav>

        {/* Logout Button */}
        <div className="sidebar-logout" onClick={handleLogout}>
          <img
            src={Vector1}
            alt="Logout Icon"
            className="me-2"
            style={{ width: "20px", height: "20px" }}
          />
          {t("logout")}
        </div>
      </div>
    </div>
  );
};

export default EmployeeSidebar;
