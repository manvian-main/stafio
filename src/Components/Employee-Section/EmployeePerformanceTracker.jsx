import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Modal,
  Form,
  Spinner,
  ProgressBar,
} from "react-bootstrap";
import EmployeeSidebar from "./EmployeeSidebar";
import Topbar from "./Topbar";
import apiClient from "../../utils/apiClient";
import {
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaStar,
  FaPlus,
} from "react-icons/fa";
import "./EmployeePerformanceTracker.css";

const EmployeePerformanceTracker = () => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
    project_name: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userId =
        localStorage.getItem("employee_user_id") ||
        localStorage.getItem("current_user_id");

      const [tasksRes, performanceRes] = await Promise.all([
        apiClient.get(`/api/tasks?user_id=${userId}`),
        apiClient.get(`/api/performance?user_id=${userId}`),
      ]);

      setTasks(tasksRes.data);
      setPerformance(performanceRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      const userId =
        localStorage.getItem("employee_user_id") ||
        localStorage.getItem("current_user_id");

      await apiClient.post(`/api/tasks`, {
        user_id: parseInt(userId),
        ...taskForm,
      });

      setShowTaskModal(false);
      setTaskForm({
        title: "",
        description: "",
        priority: "medium",
        due_date: "",
        project_name: "",
      });
      fetchData();
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task");
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await apiClient.put(`/api/tasks/${taskId}`, {
        status: newStatus,
      });
      fetchData();
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task");
    }
  };

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const pendingTasks = tasks.filter((t) => t.status === "pending").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "in_progress",
  ).length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getPriorityBadge = (priority) => {
    const colors = { high: "danger", medium: "warning", low: "info" };
    return <Badge bg={colors[priority] || "secondary"}>{priority}</Badge>;
  };

  const getStatusBadge = (status) => {
    const colors = {
      completed: "success",
      in_progress: "primary",
      pending: "warning",
    };
    const labels = {
      completed: "Completed",
      in_progress: "In Progress",
      pending: "Pending",
    };
    return (
      <Badge bg={colors[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="d-flex">
        <div className="sidebar">
          <EmployeeSidebar />
        </div>
        <div className="performance-content flex-grow-1 p-4 text-center">
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
      <div className="performance-content flex-grow-1 p-4">
        <Topbar />
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="header-text mb-0">My Performance</h2>
          <Button variant="primary" onClick={() => setShowTaskModal(true)}>
            <FaPlus className="me-2" /> Add Task
          </Button>
        </div>

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
                    <h6 className="mb-1">Total Tasks</h6>
                    <h3 className="mb-0">{totalTasks}</h3>
                  </div>
                  <FaTasks size={40} opacity={0.6} />
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
                    <h6 className="mb-1">Completed</h6>
                    <h3 className="mb-0">{completedTasks}</h3>
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
                    <h3 className="mb-0">{pendingTasks}</h3>
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
                    <h6 className="mb-1">Completion Rate</h6>
                    <h3 className="mb-0">{completionRate}%</h3>
                  </div>
                  <FaStar size={40} opacity={0.6} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Progress Overview */}
        <Row className="mb-4">
          <Col md={12}>
            <Card className="shadow-sm">
              <Card.Header className="bg-light">
                <h5 className="mb-0">Task Progress</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <h6>Completed</h6>
                    <ProgressBar
                      now={
                        totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
                      }
                      variant="success"
                      className="mb-2"
                    />
                    <small>
                      {completedTasks} of {totalTasks} tasks
                    </small>
                  </Col>
                  <Col md={4}>
                    <h6>In Progress</h6>
                    <ProgressBar
                      now={
                        totalTasks > 0
                          ? (inProgressTasks / totalTasks) * 100
                          : 0
                      }
                      variant="primary"
                      className="mb-2"
                    />
                    <small>
                      {inProgressTasks} of {totalTasks} tasks
                    </small>
                  </Col>
                  <Col md={4}>
                    <h6>Pending</h6>
                    <ProgressBar
                      now={
                        totalTasks > 0 ? (pendingTasks / totalTasks) * 100 : 0
                      }
                      variant="warning"
                      className="mb-2"
                    />
                    <small>
                      {pendingTasks} of {totalTasks} tasks
                    </small>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tasks Table */}
        <Card className="shadow-sm mb-4">
          <Card.Header className="bg-light">
            <h5 className="mb-0">My Tasks</h5>
          </Card.Header>
          <Card.Body>
            <Table bordered hover responsive>
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length > 0 ? (
                  tasks.map((task, index) => (
                    <tr key={task.id}>
                      <td>{index + 1}</td>
                      <td>
                        <strong>{task.title}</strong>
                        {task.description && (
                          <p className="text-muted mb-0 small">
                            {task.description}
                          </p>
                        )}
                      </td>
                      <td>{task.project_name || "-"}</td>
                      <td>{getPriorityBadge(task.priority)}</td>
                      <td>{task.due_date || "-"}</td>
                      <td>{getStatusBadge(task.status)}</td>
                      <td>
                        {task.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() =>
                              handleUpdateTaskStatus(task.id, "in_progress")
                            }
                          >
                            Start
                          </Button>
                        )}
                        {task.status === "in_progress" && (
                          <Button
                            size="sm"
                            variant="outline-success"
                            onClick={() =>
                              handleUpdateTaskStatus(task.id, "completed")
                            }
                          >
                            Complete
                          </Button>
                        )}
                        {task.status === "completed" && (
                          <span className="text-success">✓ Done</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      <FaTasks size={40} className="mb-2 text-secondary" />
                      <p>No tasks assigned yet</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* Performance Reviews */}
        {performance.length > 0 && (
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Performance Reviews</h5>
            </Card.Header>
            <Card.Body>
              <Table bordered hover responsive>
                <thead className="table-light">
                  <tr>
                    <th>Period</th>
                    <th>Tasks Completed</th>
                    <th>Projects Completed</th>
                    <th>Feedback Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {performance.map((review) => (
                    <tr key={review.id}>
                      <td>
                        {review.review_period_month}/{review.review_period_year}
                      </td>
                      <td>
                        <Badge bg="primary">{review.tasks_completed}</Badge>
                      </td>
                      <td>
                        <Badge bg="info">{review.projects_completed}</Badge>
                      </td>
                      <td>
                        <Badge bg="warning" text="dark">
                          {review.feedback_score} ⭐
                        </Badge>
                      </td>
                      <td>
                        <Badge
                          bg={
                            review.status === "completed"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {review.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}
      </div>

      {/* Add Task Modal */}
      <Modal
        show={showTaskModal}
        onHide={() => setShowTaskModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Task Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter task title"
                value={taskForm.title}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, title: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Enter description"
                value={taskForm.description}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, description: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Project Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter project name"
                value={taskForm.project_name}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, project_name: e.target.value })
                }
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    value={taskForm.priority}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, priority: e.target.value })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Due Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, due_date: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTaskModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreateTask}
            disabled={!taskForm.title}
          >
            <FaPlus className="me-2" /> Create Task
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EmployeePerformanceTracker;
