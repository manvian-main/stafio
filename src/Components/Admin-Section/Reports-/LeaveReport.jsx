import React, { useState, useEffect } from "react";
import { FaFilter } from "react-icons/fa";
import "./LeaveReport.css";
import AdminSidebar from "../AdminSidebar";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import Topbar from "../Topbar";
import group10 from "../../../assets/Group10.png";
import AttendanceCard from "../Dashboard/AttendanceCard";
import { useLocation } from "react-router-dom";
import apiClient from "../../../utils/apiClient";

export default function LeaveReport() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedEmployeeName, setSelectedEmployeeName] = useState("");
  const [employees, setEmployees] = useState([]);
  const [leaveSummary, setLeaveSummary] = useState([]);
  const [loadingBalance, setLoadingBalance] = useState(false);

  // Fetch employees on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await apiClient.get("/api/employeeslist");
        setEmployees(res.data);
      } catch (err) {
        console.error("Error fetching employees", err);
      }
    };

    fetchEmployees();
  }, []);

  // Fetch leave balance when employee is selected
  useEffect(() => {
    if (!selectedEmployeeId) {
      setLeaveSummary([]);
      return;
    }

    const fetchLeaveBalance = async () => {
      setLoadingBalance(true);
      try {
        const res = await apiClient.get(
          `/api/employee_leave_balance/${selectedEmployeeId}`,
          {
            headers: {
              "X-User-Role": localStorage.getItem("current_role") || "admin",
              "X-User-ID": localStorage.getItem("current_user_id") || "1",
            },
          },
        );

        // Map API response to display format
        const colorMap = {
          "Casual Leave": "casual",
          "Annual Leave": "annual",
          "Sick Leave": "sick",
          LOP: "lop",
          "Earned Leave": "annual",
          "Maternity Leave": "casual",
        };

        const summary = res.data.map((item) => ({
          type: item.leaveType,
          days: `${item.remaining}/${item.allocated} Day(s)`,
          color: colorMap[item.leaveType] || "casual",
        }));

        setLeaveSummary(summary);
      } catch (err) {
        console.error("Error fetching leave balance", err);
        setLeaveSummary([]);
      } finally {
        setLoadingBalance(false);
      }
    };

    fetchLeaveBalance();
  }, [selectedEmployeeId]);

  const handleEmployeeChange = (e) => {
    const selectedId = e.target.value;
    setSelectedEmployeeId(selectedId);

    const emp = employees.find((emp) => String(emp.id) === selectedId);
    setSelectedEmployeeName(emp ? emp.name : "");
  };

  const [attendanceDataSets, setAttendanceDataSets] = useState({
    months: [],
    weeks: [],
    days: [],
  });
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // Fetch attendance data when employee is selected
  useEffect(() => {
    if (!selectedEmployeeId) {
      setAttendanceDataSets({ months: [], weeks: [], days: [] });
      return;
    }

    const fetchAttendanceData = async () => {
      setLoadingAttendance(true);
      try {
        const res = await apiClient.get("/api/attendance_graph_stats", {
          params: { user_id: selectedEmployeeId },
          headers: {
            "X-User-Role": localStorage.getItem("current_role") || "admin",
            "X-User-ID": localStorage.getItem("current_user_id") || "1",
          },
        });

        // Transform API response to match AttendanceCard format
        const monthlyData = res.data.months || [];
        const weeksData = res.data.weeks || [];
        const daysData = res.data.days || [];

        // Create monthly data
        const months = monthlyData.map((item) => ({
          label: item.label,
          value: item.value || 0,
        }));

        // Create weekly data
        const weeks = weeksData.map((item) => ({
          label: item.label,
          value: item.value || 0,
        }));

        // Create daily data
        const days = daysData.map((item) => ({
          label: item.label,
          value: item.value || 0,
        }));

        setAttendanceDataSets({ months, weeks, days });
      } catch (err) {
        console.error("Error fetching attendance data", err);
        // Set empty data on error
        setAttendanceDataSets({ months: [], weeks: [], days: [] });
      } finally {
        setLoadingAttendance(false);
      }
    };

    fetchAttendanceData();
  }, [selectedEmployeeId]);

  return (
    <div className="leave-report-layout">
      <div className="rightside-logo ">
        <img src={group10} alt="logo" className="rightside-logos" />
      </div>
      <AdminSidebar />
      <div className="leave-report-main">
        <Topbar />

        {/* Page Header */}
        <div className="leave-report-header">
          <h2>Leave Report</h2>
          <select
            className="leave-report-dropdown"
            value={selectedEmployeeId}
            onChange={handleEmployeeChange}
          >
            <option value="">Select Employee</option>

            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.empId})
              </option>
            ))}
          </select>
        </div>

        {/* Leave Summary Cards */}
        <div className="leave-summary-container">
          {loadingBalance ? (
            <div className="text-center w-100 py-4">
              <Spinner animation="border" size="sm" /> Loading leave balance...
            </div>
          ) : leaveSummary.length === 0 ? (
            <div className="text-center w-100 py-4 text-muted">
              {selectedEmployeeId
                ? "No leave data available"
                : "Select an employee to view leave balance"}
            </div>
          ) : (
            leaveSummary.map((leave, idx) => (
              <div key={idx} className={`leave-summary-card ${leave.color}`}>
                <div className="leave-icon-wrapper">
                  <div className="leave-icon">✓</div>
                </div>
                <div className="leave-content">
                  <div className="leave-days">{leave.days}</div>
                  <div className="leave-type">{leave.type}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Attendance Stats Card */}
        <div className="leave-report-card">
          <AttendanceCard
            title="Attendance"
            dataSets={attendanceDataSets}
            periodOptions={["months", "weeks", "days"]}
          />
        </div>
      </div>
    </div>
  );
}
