import React, { useEffect, useState, useRef } from "react";
import { Card } from "react-bootstrap";
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
import axios from "axios";

const BASE_URL = "http://127.0.0.1:5001";

// View types
const VIEW_TYPES = [
  { label: "Month", key: "months" },
  { label: "Week", key: "weeks" },
  { label: "Day", key: "days" },
];

// Custom % label — only on the highest bar
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

const EmployeeAttendanceCard = React.memo(function EmployeeAttendanceCard({
  userId,
}) {
  const [attendanceData, setAttendanceData] = useState({ months: [], weeks: [], days: [] });
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState("months"); // Default to Month view
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef(null);

  // Close filter dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    };
    if (showFilter) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showFilter]);

  useEffect(() => {
    if (!userId) return;
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/api/attendance_graph_stats`, {
          params: { user_id: userId },
        });
        setAttendanceData(res.data);
      } catch (err) {
        console.error("Attendance chart fetch error:", err);
        setAttendanceData({ months: [], weeks: [], days: [] });
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [userId]);

  // Current view label
  const currentViewLabel = VIEW_TYPES.find(v => v.key === viewType)?.label || "Month";
  
  // Data for the chart
  const filteredData = attendanceData[viewType] || [];
  const maxValue = Math.max(...filteredData.map((d) => d.value), 0);

  return (
    <Card className="employee-attendance-card">
      <Card.Body>
        {/* Header row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <Card.Title style={{ margin: 0 }}>Attendance ({currentViewLabel})</Card.Title>

          {/* Filter icon + dropdown */}
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

            {/* Dropdown */}
            {showFilter && (
              <div
                style={{
                  position: "absolute",
                  top: "40px",
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

        {/* Chart */}
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
          <ResponsiveContainer width="100%" height={230}>
            <BarChart
              data={filteredData}
              margin={{ top: 22, right: 8, left: -25, bottom: 0 }}
              barCategoryGap="28%"
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
                angle={viewType === 'months' ? -35 : 0}
                textAnchor={viewType === 'months' ? 'end' : 'middle'}
                height={viewType === 'months' ? 45 : 30}
                interval={0}
                dx={viewType === 'months' ? 8 : 0}
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

              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={24}>
                <LabelList
                  dataKey="value"
                  position="top"
                  content={(props) => (
                    <CustomLabel {...props} maxValue={maxValue} />
                  )}
                />
                {filteredData.map((entry, index) => (
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
      </Card.Body>
    </Card>
  );
});

export default EmployeeAttendanceCard;
