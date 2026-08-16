import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Table,
  Card,
  Spinner,
} from "react-bootstrap";
import AdminSidebar from "./AdminSidebar";
import Topbar from "./Topbar";
import group10 from "../../assets/Group10.png";

const DepartmentLeaveView = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch leave records when department changes
  useEffect(() => {
    const fetchLeaveRecords = async () => {
      setLoading(true);
      try {
        let url = `/api/all_leave_records`;

        if (selectedDepartment !== "All") {
          url = `/api/leave_by_department?department=${encodeURIComponent(selectedDepartment)}`;
        }

        const response = await apiClient.get(url, {
          headers: {
            "X-User-Role": "admin",
            "X-User-ID": localStorage.getItem("userId") || "1",
          },
        });
        setLeaveRecords(response.data);
      } catch (error) {
        console.error("Error fetching leave records:", error);
        setLeaveRecords([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaveRecords();
  }, [selectedDepartment]);

  return (
    <div className="report-layout">
      <div className="rightside-logo">
        <img src={group10} alt="logo" className="rightside-logos" />
      </div>
      <AdminSidebar />
      <div className="report-main">
        <Topbar />
        <Container fluid className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold">Department Leave Records</h2>
            <div style={{ width: "250px" }}>
              <Form.Select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="border-0 shadow-sm"
                style={{
                  height: "45px",
                  borderRadius: "10px",
                  background: "#fff",
                }}
              >
                {departments.map((dept, idx) => (
                  <option key={idx} value={dept}>
                    {dept === "All" ? "All Departments" : dept}
                  </option>
                ))}
              </Form.Select>
            </div>
          </div>

          <Card className="border-0 shadow-sm overflow-hidden">
            <Card.Body className="p-0">
              <Table hover responsive className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="py-3 px-4">Employee ID</th>
                    <th className="py-3">Name</th>
                    <th className="py-3">Department</th>
                    <th className="py-3">Leave Type</th>
                    <th className="py-3">Period</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record, index) => (
                      <tr key={index}>
                        <td className="py-3 px-4 fw-medium text-primary">
                          {record.employeeId}
                        </td>
                        <td className="py-3">{record.name}</td>
                        <td className="py-3">
                          <span className="badge bg-light text-dark px-3 py-2 border">
                            {record.department}
                          </span>
                        </td>
                        <td className="py-3">{record.leaveType}</td>
                        <td className="py-3 small text-secondary">
                          {record.startDate} — {record.endDate}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`badge ${record.status === "Approved" ? "bg-success" : "bg-warning"} px-3 py-2`}
                          >
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-5 text-secondary"
                      >
                        No records found for the selected department.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Container>
      </div>
    </div>
  );
};

export default DepartmentLeaveView;
