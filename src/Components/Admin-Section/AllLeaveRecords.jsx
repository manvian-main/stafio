import React, { useContext, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Form,
} from "react-bootstrap";
import AdminSidebar from "./AdminSidebar";
import Topbar from "./Topbar";
import { LeaveContext } from "../../context/LeaveContext";
import group10 from "../../assets/Group10.png";

const AllLeaveRecords = () => {
  const { leaveRecords } = useContext(LeaveContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const handleExport = () => {
    const headers = [
      "Employee ID",
      "Leave Type",
      "Start Date",
      "End Date",
      "Reason",
      "Status",
      "Department",
    ];
    const rows = filteredRecords.map((r) =>
      [
        r.employeeId,
        r.leaveType,
        r.startDate,
        r.endDate,
        r.reason,
        r.status || "Pending",
        r.department || "N/A",
      ].join(","),
    );

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "all_leave_records.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRecords = (leaveRecords || []).filter((record) => {
    const matchesSearch =
      (record.employeeId?.toLowerCase() || "").includes(
        searchTerm.toLowerCase(),
      ) ||
      (record.reason?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter ? record.status === statusFilter : true;
    const matchesDepartment = departmentFilter
      ? record.department === departmentFilter
      : true;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

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
            <h2 className="fw-bold">All Leave Records</h2>
            <Button
              variant="info"
              className="text-white px-4 fw-semibold"
              style={{ borderRadius: "10px" }}
              onClick={handleExport}
            >
              Export CSV
            </Button>
          </div>

          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-secondary">
                      Search
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Search ID or Reason..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border-0 bg-light"
                      style={{ height: "45px", borderRadius: "10px" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-secondary">
                      Status
                    </Form.Label>
                    <Form.Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="border-0 bg-light"
                      style={{ height: "45px", borderRadius: "10px" }}
                    >
                      <option value="">All Status</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Pending">Pending</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-secondary">
                      Department
                    </Form.Label>
                    <Form.Select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      className="border-0 bg-light"
                      style={{ height: "45px", borderRadius: "10px" }}
                    >
                      <option value="">All Departments</option>
                      <option value="HR">HR</option>
                      <option value="IT">IT</option>
                      <option value="Sales">Sales</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <Table hover responsive className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Employee ID</th>
                    <th className="py-3">Leave Type</th>
                    <th className="py-3">Period</th>
                    <th className="py-3">Reason</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Department</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center py-5 text-secondary"
                      >
                        No leave records found.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record, index) => (
                      <tr key={index}>
                        <td className="py-3 px-4">{index + 1}</td>
                        <td className="py-3 px-4 fw-medium">
                          {record.employeeId}
                        </td>
                        <td className="py-3">{record.leaveType}</td>
                        <td className="py-3 small">
                          {record.startDate} to {record.endDate}
                        </td>
                        <td className="py-3">{record.reason}</td>
                        <td className="py-3">
                          <span
                            className={`badge ${
                              record.status === "Approved"
                                ? "bg-success"
                                : record.status === "Rejected"
                                  ? "bg-danger"
                                  : "bg-warning"
                            }`}
                          >
                            {record.status || "Pending"}
                          </span>
                        </td>
                        <td className="py-3 text-secondary">
                          {record.department || "N/A"}
                        </td>
                      </tr>
                    ))
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

export default AllLeaveRecords;
