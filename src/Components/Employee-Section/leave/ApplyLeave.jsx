import React, { useState, useEffect } from "react";
import "./ApplyLeave.css";
import illustration from "../../../assets/Formsbro.png";
import { FaUpload } from "react-icons/fa";
import apiClient from "../../../utils/apiClient";

const LeaveRequestForm = ({ onClose, leaveBalance, editData }) => {
  const [employeeId, setEmployeeId] = useState("");
  const [leaveTypes, setLeaveTypes] = useState([]);

  const [formData, setFormData] = useState({
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: "",
    notify_to: "",
    day_type: "full_day",
    num_days: 0,
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        leave_type_id: editData.leave_type_id || "",
        start_date: editData.start_date || "",
        end_date: editData.end_date || "",
        reason: editData.reason || "",
        notify_to: editData.notify_to || "",
        day_type: editData.day_type || "full_day",
        num_days: editData.num_days || 0,
      });
    }
  }, [editData]);

  useEffect(() => {
    const userId = localStorage.getItem("current_user_id");
    setEmployeeId(userId);
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const res = await apiClient.get("/api/leave_types");
      setLeaveTypes(res.data);
    } catch (error) {
      console.error("Error fetching leave types:", error);
    }
  };

  const calculateDays = (start, end, type) => {
    if (!start || !end) return 0;

    const startDate = new Date(start);
    const endDate = new Date(end);

    const diffTime = endDate - startDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24) + 1;

    return type === "half_day" ? diffDays * 0.5 : diffDays;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedData = {
      ...formData,
      [name]: value,
    };

    if (name === "start_date" || name === "end_date" || name === "day_type") {
      updatedData.num_days = calculateDays(
        name === "start_date" ? value : updatedData.start_date,
        name === "end_date" ? value : updatedData.end_date,
        name === "day_type" ? value : updatedData.day_type,
      );
    }

    setFormData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem("current_user_id");

    const role = localStorage.getItem("current_role");

    // ✅ FIND selected leave type balance
    const selectedBalance = leaveBalance.find(
      (b) => b.id === parseInt(formData.leave_type_id),
    );

    if (!selectedBalance) {
      alert("Invalid leave type selected");
      return;
    }

    // ✅ CHECK BALANCE
    if (selectedBalance.remaining <= 0) {
      alert(`No ${selectedBalance.name} balance available`);
      return;
    }

    // ✅ CHECK REQUESTED DAYS
    if (formData.num_days > selectedBalance.remaining) {
      alert(
        `Only ${selectedBalance.remaining} day(s) available for ${selectedBalance.name}`,
      );
      return;
    }

    try {
      let res;

      if (editData) {
        // ✅ UPDATE existing leave
        res = await apiClient.put(
          `/leave_requests/${editData.id}`,
          {
            ...formData,
            user_id: userId,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "X-User-Role": role,
              "X-User-ID": userId,
            },
          },
        );
      } else {
        // ✅ CREATE new leave
        res = await apiClient.post(
          "/leave_requests",
          {
            ...formData,
            user_id: userId,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "X-User-Role": role,
              "X-User-ID": userId,
            },
          },
        );
      }

      alert(res.data.message);
      window.dispatchEvent(new Event("leaveRequestUpdated"));
      onClose();
    } catch (err) {
      alert(err?.response?.data?.message || "Error applying leave");
    }
  };
  const selectedBalance = leaveBalance.find(
    (b) => b.id === parseInt(formData.leave_type_id),
  );

  return (
    <div className="apply-leave-wrapper">
      <form className="apply-leave-form-emp" onSubmit={handleSubmit}>
        <div className="form-left">
          <div className="form-row_pop">
            <label>Employee ID</label>
            <input type="text" value={employeeId} readOnly />
          </div>

          <div className="form-row_pop">
            <label>Leave Type</label>
            <select
              name="leave_type_id"
              value={formData.leave_type_id}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              {leaveTypes.map((type) => {
                const balance = leaveBalance.find((b) => b.id === type.id);

                return (
                  <option
                    key={type.id}
                    value={type.id}
                    disabled={balance && balance.remaining <= 0}
                  >
                    {type.name} {balance ? `(${balance.remaining} left)` : ""}
                  </option>
                );
              })}
            </select>
            {/* ✅ ADD THIS HERE (below dropdown) */}
            {selectedBalance && selectedBalance.remaining <= 0 && (
              <p className="error-text">
                No balance available for {selectedBalance.name}
              </p>
            )}
          </div>

          <div className="form-row_pop align-top">
            <label>Select Date</label>

            <div className="date-container">
              <div className="date-label-row">
                <span>From</span>
                <span>To</span>
                <span></span>
              </div>

              <div className="app-leave-date-row">
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />

                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                />

                <select
                  name="day_type"
                  value={formData.day_type}
                  onChange={handleChange}
                >
                  <option value="full_day">Full Day</option>
                  <option value="half_day">Half Day</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-row_pop">
            <label>Notify Others</label>

            <div className="app-leave-notify-row">
              <select
                name="notify_to"
                value={formData.notify_to}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option>Team Lead</option>
                <option>HR</option>
              </select>

              <button type="button" className="apply-leave-upload-btn">
                <FaUpload /> Upload File
              </button>
            </div>
          </div>

          <div className="form-row_pop align-top">
            <label>Reason</label>

            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="ex: I am travelling to"
              required
            />
          </div>
        </div>

        <div className="form-right">
          <img src={illustration} alt="Leave Illustration" />
        </div>
      </form>

      <div className="app-leave-modal-actions">
        <button
          type="submit"
          className="apply-leave-btn"
          onClick={handleSubmit}
        >
          {editData ? "Update Leave" : "Apply"}
        </button>

        <button
          type="button"
          className="app-leave-cancel-btn"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default LeaveRequestForm;
