import React, { useState, useEffect, useRef } from "react";
import EmployeeSidebar from "../EmployeeSidebar";
import Topbar from "../Topbar";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { BsSliders } from "react-icons/bs";
import "./EmployeeLeaveReport.css";

/* ── Half-year ranges — matching EmployeeAttendanceCard exactly ── */
const VIEW_TYPES = [
  { label: "Month", key: "months" },
  { label: "Week", key: "weeks" },
  { label: "Day", key: "days" },
];

/* ── Custom % label — only on the highest bar ── */
const CustomLabel = ({ x, y, width, value, maxValue }) => {
  if (value !== maxValue || value === 0) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 7}
      fill="#444"
      textAnchor="middle"
      fontSize={12}
      fontWeight={600}
    >
      {value}%
    </text>
  );
};

/* ─── Main Component ─── */
const EmployeeLeaveReport = () => {
  const [balances, setBalances] = useState([]);
  const [attendanceData, setAttendanceData] = useState({ months: [], weeks: [], days: [] });
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [viewType, setViewType] = useState("months"); // Default to Month view
  const filterRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId =
          localStorage.getItem("employee_user_id") ||
          sessionStorage.getItem("current_user_id");

        const [balRes, graphRes] = await Promise.all([
          axios.get("http://127.0.0.1:5001/api/leave_balance", {
            headers: { "X-User-ID": userId },
          }),
          axios.get("http://127.0.0.1:5001/api/attendance_graph_stats", {
            params: { user_id: userId },
            headers: { "X-User-ID": userId },
          }),
        ]);
        setBalances(balRes.data);
        setAttendanceData(graphRes.data);
      } catch (err) {
        console.error("Leave report fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    };
    if (showFilter) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showFilter]);

  /* Get data for current view */
  const chartData = attendanceData[viewType] || [];
  const maxValue = Math.max(...chartData.map((d) => d.value), 0);
  const currentViewLabel = VIEW_TYPES.find(v => v.key === viewType)?.label || "Month";

  return (
    <div className="layout">
      <EmployeeSidebar />

      <div className="elr__page">
        <Topbar />

        <h2 className="elr__heading">Leave Report</h2>

        {/* ── Leave Balance Cards ── */}
        {loading ? (
          <div className="elr__loading">Loading...</div>
        ) : (
          <div className="elr__cards">
            {balances.map((lb, idx) => (
              <div className="elr__card" key={idx}>
                <svg className="elr__card-svg" viewBox="0 0 28 28" fill="none">
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
                <div className="elr__card-num">
                  {lb.used}/{lb.total}
                  <span className="elr__card-unit"> Day(s)</span>
                </div>
                <div className="elr__card-lbl">{lb.name}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Monthly Leave Report Chart ── */}
        <div className="elr__chart-card">
          {/* Header */}
          <div className="elr__chart-hdr">
            <span className="elr__chart-title">Attendance ({currentViewLabel})</span>

            <div ref={filterRef} style={{ position: "relative" }}>
              <div
                onClick={() => setShowFilter((p) => !p)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <BsSliders size={18} color={showFilter ? "#19BDE8" : "#888"} />
              </div>

              {showFilter && (
                <div
                  style={{
                    position: "absolute",
                    top: "30px",
                    right: 0,
                    background: "#fff",
                    borderRadius: "10px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                    padding: "6px",
                    zIndex: 999,
                    minWidth: "120px",
                  }}
                >
                  {VIEW_TYPES.map((v) => (
                    <div
                      key={v.key}
                      onClick={() => {
                        setViewType(v.key);
                        setShowFilter(false);
                      }}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: viewType === v.key ? 600 : 400,
                        color: viewType === v.key ? "#19BDE8" : "#444",
                        background: viewType === v.key ? "#e6f7fc" : "transparent",
                        transition: "background 0.15s",
                      }}
                    >
                      {v.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recharts Bar Chart */}
          {loading ? (
            <div
              style={{
                height: 220,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#aaa",
                fontSize: 14,
              }}
            >
              Loading...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={chartData}
                margin={{ top: 22, right: 8, left: -20, bottom: 0 }}
                barCategoryGap={viewType === "days" ? "15%" : "28%"}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="#edf1f7"
                  strokeDasharray=""
                />

                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#777", fontWeight: 500 }}
                  angle={viewType === "months" ? -35 : 0}
                  textAnchor={viewType === "months" ? "end" : "middle"}
                  height={viewType === "months" ? 45 : 30}
                  interval={0}
                  dx={viewType === "months" ? 8 : 0}
                  dy={4}
                />

                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#aaa" }}
                  ticks={[0, 20, 40, 60, 80, 100]}
                />

                <Tooltip
                  formatter={(v) => [`${v}%`, "Attendance"]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "none",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    fontSize: 13,
                  }}
                  cursor={{ fill: "rgba(25,189,232,0.06)" }}
                />

                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={viewType === "days" ? 35 : 28}>
                  <LabelList
                    dataKey="value"
                    position="top"
                    content={(props) => (
                      <CustomLabel {...props} maxValue={maxValue} />
                    )}
                  />
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.value === maxValue && entry.value > 0
                          ? "#19BDE8"
                          : "#D6EEF8"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeLeaveReport;
