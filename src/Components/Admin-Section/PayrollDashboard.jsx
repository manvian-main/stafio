// src/components/AdminPayrollDashboard.js
import React, { useState, useEffect } from "react";
import apiClient from "../../utils/apiClient";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Form,
  Spinner,
} from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./AdminPayrollDashboard.css";
import AdminSidebar from "./AdminSidebar";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const AdminPayrollDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [employees, setEmployees] = useState([]);

  // Fetch data on mount
  useEffect(() => {
    fetchPayrollData();
  }, []);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      const [summaryRes, payrollRes] = await Promise.all([
        apiClient.get(`/api/payroll/summary`),
        apiClient.get(`/api/payroll`),
      ]);
      setSummary(summaryRes.data);
      setEmployees(payrollRes.data);
    } catch (error) {
      console.error("Error fetching payroll data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Payroll summary cards - dynamic data
  const payrollSummary = summary
    ? [
        {
          title: "Total Employees",
          value: summary.total_employees_with_salary || 0,
          change: "with salary structure",
          color: "success",
        },
        {
          title: "Company Expense",
          value: `₹${(summary.six_month_expense || 0).toLocaleString()}`,
          change: "Last 6 months",
          color: "danger",
        },
        {
          title: "Current Month Total",
          value: `₹${(summary.current_month_total || 0).toLocaleString()}`,
          change: `${summary.paid_count || 0} paid, ${summary.pending_count || 0} pending`,
          color: "primary",
        },
        {
          title: "Upcoming Salary Date",
          value: summary.upcoming_salary_date || "N/A",
          change: "Next payout",
          color: "warning",
        },
      ]
    : [];

  // Chart data for Payroll Expenses
  const chartData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Payroll Expenses",
        data: [
          200,
          400,
          350,
          600,
          450,
          700,
          650,
          500,
          300,
          400,
          350,
          summary?.current_month_total / 1000 || 0,
        ],
        backgroundColor: "#19BDE8",
        borderRadius: 6,
      },
    ],
  };

  // Function to mark employee as Paid
  const markAsPaid = async (payrollId) => {
    try {
      await apiClient.put(`/api/payroll/${payrollId}/pay`);
      // Refresh data
      fetchPayrollData();
    } catch (error) {
      console.error("Error marking as paid:", error);
      alert("Failed to mark as paid");
    }
  };

  if (loading) {
    return (
      <div className="d-flex" style={{ marginLeft: "250px" }}>
        <AdminSidebar />
        <Container fluid className="p-4 dashboard-container text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Container>
      </div>
    );
  }

  return (
    <div className="d-flex" style={{ marginLeft: "250px" }}>
      <AdminSidebar />
      <Container fluid className="p-4 dashboard-container">
        {/* Top Navbar */}
        <Row className="align-items-center mb-4">
          <Col md={6}>
            <h3 className="dashboard-title">Hi, Admin</h3>
            <p className="dashboard-subtitle">
              Manage your Payroll with talent
            </p>
          </Col>
          <Col md={4}>
            <Form.Control
              type="search"
              placeholder="Search something here..."
              className="search-bar"
            />
          </Col>
          <Col md={2} className="text-end">
            <Button className="custom-btn">Create Reports</Button>
          </Col>
        </Row>

        {/* Payroll Summary Cards */}
        <Row className="mb-4">
          {payrollSummary.map((item, index) => (
            <Col md={3} key={index}>
              <Card className="summary-card shadow-sm">
                <Card.Body>
                  <Card.Title className="summary-title">
                    {item.title}
                  </Card.Title>
                  <h5 className="summary-value">{item.value}</h5>
                  <small className={`text-${item.color}`}>{item.change}</small>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Payroll Expenses Chart + Employment Status */}
        <Row className="mb-4">
          <Col md={8}>
            <Card className="shadow-sm chart-card">
              <Card.Header className="card-header-custom">
                Payroll Expenses
              </Card.Header>
              <Card.Body>
                <Bar data={chartData} />
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="shadow-sm chart-card">
              <Card.Header className="card-header-custom">
                Employment Status
              </Card.Header>
              <Card.Body>
                <p>
                  Total Employees: {summary?.total_employees_with_salary || 0}
                </p>
                <p>
                  <Badge bg="success">Paid: {summary?.paid_count || 0}</Badge>
                </p>
                <p>
                  <Badge bg="warning">
                    Pending: {summary?.pending_count || 0}
                  </Badge>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Employee Payroll Table */}
        <Row>
          <Col>
            <Card className="shadow-sm chart-card">
              <Card.Header className="card-header-custom">
                Employee Payroll
              </Card.Header>
              <Card.Body>
                <Table hover responsive className="custom-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Employee</th>
                      <th>Month/Year</th>
                      <th>Basic</th>
                      <th>Total Salary</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.length > 0 ? (
                      employees.map((emp, index) => (
                        <tr key={emp.id}>
                          <td>{index + 1}</td>
                          <td>{emp.employee_name}</td>
                          <td>
                            {emp.month}/{emp.year}
                          </td>
                          <td>₹{emp.basic_salary?.toLocaleString()}</td>
                          <td>₹{emp.net_salary?.toLocaleString()}</td>
                          <td>
                            <Badge
                              bg={emp.status === "paid" ? "success" : "warning"}
                            >
                              {emp.status === "paid" ? "Paid" : "Pending"}
                            </Badge>
                          </td>
                          <td>
                            {emp.status === "pending" ? (
                              <Button
                                size="sm"
                                variant="outline-success"
                                onClick={() => markAsPaid(emp.id)}
                              >
                                Mark as Paid
                              </Button>
                            ) : (
                              <Button size="sm" variant="success" disabled>
                                Paid
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">
                          No payroll records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminPayrollDashboard;
