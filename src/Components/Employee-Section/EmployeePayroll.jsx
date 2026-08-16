import React, { useState, useEffect } from "react";
import { Row, Col, Card, Table, Badge, Spinner, Button } from "react-bootstrap";
import EmployeeSidebar from "./EmployeeSidebar";
import Topbar from "./Topbar";
import apiClient from "../../utils/apiClient";
import {
  FaMoneyBillWave,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import "./EmployeePayroll.css";

const EmployeePayroll = () => {
  const [loading, setLoading] = useState(true);
  const [payrollData, setPayrollData] = useState([]);
  const [salaryStructure, setSalaryStructure] = useState(null);

  useEffect(() => {
    fetchPayrollData();
  }, []);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      const userId =
        localStorage.getItem("employee_user_id") ||
        localStorage.getItem("current_user_id");

      const [payrollRes, salaryRes] = await Promise.all([
        apiClient.get(`/api/payroll/${userId}`),
        apiClient.get(`/api/salary_structure/${userId}`),
      ]);

      setPayrollData(payrollRes.data);
      setSalaryStructure(salaryRes.data);
    } catch (error) {
      console.error("Error fetching payroll data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary stats
  const totalEarnings = payrollData
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + (p.net_salary || 0), 0);

  const paidCount = payrollData.filter((p) => p.status === "paid").length;
  const pendingCount = payrollData.filter((p) => p.status === "pending").length;
  const latestPayroll = payrollData[0];

  const getMonthName = (monthNum) => {
    const months = [
      "",
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
    return months[monthNum] || "";
  };

  if (loading) {
    return (
      <div className="d-flex">
        <div className="sidebar">
          <EmployeeSidebar />
        </div>
        <div className="payroll-content flex-grow-1 p-4 text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="sidebar">
        <EmployeeSidebar />
      </div>

      {/* Main Content */}
      <div className="payroll-content flex-grow-1 p-4">
        <Topbar />
        <h2 className="mb-4 header-text">My Payroll</h2>

        {/* Summary Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card
              className="summary-card shadow-sm border-0"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              <Card.Body className="text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Total Earnings</h6>
                    <h3 className="mb-0">₹{totalEarnings.toLocaleString()}</h3>
                  </div>
                  <FaMoneyBillWave size={40} opacity={0.6} />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card
              className="summary-card shadow-sm border-0"
              style={{
                background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
              }}
            >
              <Card.Body className="text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Paid Months</h6>
                    <h3 className="mb-0">{paidCount}</h3>
                  </div>
                  <FaCheckCircle size={40} opacity={0.6} />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card
              className="summary-card shadow-sm border-0"
              style={{
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              }}
            >
              <Card.Body className="text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Pending</h6>
                    <h3 className="mb-0">{pendingCount}</h3>
                  </div>
                  <FaClock size={40} opacity={0.6} />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card
              className="summary-card shadow-sm border-0"
              style={{
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              }}
            >
              <Card.Body className="text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Latest</h6>
                    <h3 className="mb-0">
                      {latestPayroll
                        ? `${getMonthName(latestPayroll.month)} ${latestPayroll.year}`
                        : "N/A"}
                    </h3>
                  </div>
                  <FaCalendarAlt size={40} opacity={0.6} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Salary Structure Card */}
        {salaryStructure && (
          <Row className="mb-4">
            <Col md={12}>
              <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">My Salary Structure</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4}>
                      <h6 className="text-muted">Earnings</h6>
                      <Table borderless size="sm">
                        <tbody>
                          <tr>
                            <td>Basic Salary</td>
                            <td className="text-end">
                              ₹{salaryStructure.basic_salary?.toLocaleString()}
                            </td>
                          </tr>
                          <tr>
                            <td>HRA</td>
                            <td className="text-end">
                              ₹{salaryStructure.hra?.toLocaleString()}
                            </td>
                          </tr>
                          <tr>
                            <td>Conveyance</td>
                            <td className="text-end">
                              ₹{salaryStructure.conveyance?.toLocaleString()}
                            </td>
                          </tr>
                          <tr>
                            <td>Medical Allowance</td>
                            <td className="text-end">
                              ₹
                              {salaryStructure.medical_allowance?.toLocaleString()}
                            </td>
                          </tr>
                          <tr>
                            <td>Special Allowance</td>
                            <td className="text-end">
                              ₹
                              {salaryStructure.special_allowance?.toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </Col>
                    <Col md={4}>
                      <h6 className="text-muted">Deductions</h6>
                      <Table borderless size="sm">
                        <tbody>
                          <tr>
                            <td>PF Deduction</td>
                            <td className="text-end text-danger">
                              ₹{salaryStructure.pf_deduction?.toLocaleString()}
                            </td>
                          </tr>
                          <tr>
                            <td>Tax Deduction</td>
                            <td className="text-end text-danger">
                              ₹{salaryStructure.tax_deduction?.toLocaleString()}
                            </td>
                          </tr>
                          <tr>
                            <td>Other Deductions</td>
                            <td className="text-end text-danger">
                              ₹
                              {salaryStructure.other_deductions?.toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </Col>
                    <Col md={4}>
                      <h6 className="text-muted">Net Pay</h6>
                      <h2 className="text-success">
                        ₹
                        {(
                          (salaryStructure.basic_salary || 0) +
                          (salaryStructure.hra || 0) +
                          (salaryStructure.conveyance || 0) +
                          (salaryStructure.medical_allowance || 0) +
                          (salaryStructure.special_allowance || 0) -
                          (salaryStructure.pf_deduction || 0) -
                          (salaryStructure.tax_deduction || 0) -
                          (salaryStructure.other_deductions || 0)
                        ).toLocaleString()}
                      </h2>
                      <small className="text-muted">
                        Effective from: {salaryStructure.effective_from}
                      </small>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Payroll History Table */}
        <Card className="shadow-sm">
          <Card.Header className="bg-light">
            <h5 className="mb-0">Payroll History</h5>
          </Card.Header>
          <Card.Body>
            <Table bordered hover responsive>
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Month/Year</th>
                  <th>Basic Salary</th>
                  <th>Allowances</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                  <th>Payment Date</th>
                </tr>
              </thead>
              <tbody>
                {payrollData.length > 0 ? (
                  payrollData.map((record, index) => (
                    <tr key={record.id}>
                      <td>{index + 1}</td>
                      <td>
                        {getMonthName(record.month)} {record.year}
                      </td>
                      <td>₹{record.basic_salary?.toLocaleString()}</td>
                      <td className="text-success">
                        +₹{record.total_allowances?.toLocaleString()}
                      </td>
                      <td className="text-danger">
                        -₹{record.total_deductions?.toLocaleString()}
                      </td>
                      <td className="fw-bold">
                        ₹{record.net_salary?.toLocaleString()}
                      </td>
                      <td>
                        <Badge
                          bg={record.status === "paid" ? "success" : "warning"}
                        >
                          {record.status === "paid" ? "Paid" : "Pending"}
                        </Badge>
                      </td>
                      <td>{record.payment_date || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center text-muted">
                      No payroll records found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default EmployeePayroll;
