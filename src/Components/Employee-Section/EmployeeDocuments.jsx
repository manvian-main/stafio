import React from "react";
import EmployeeSidebar from "./EmployeeSidebar";
import Topbar from "./Topbar";
import { Container, Card, Row, Col } from "react-bootstrap";
import { FaFilePdf, FaFileWord, FaDownload } from "react-icons/fa";
import group10 from "../../assets/Group10.png";

const EmployeeDocuments = () => {
  const documents = [
    {
      id: 1,
      name: "Offer Letter",
      type: "PDF",
      date: "2025-05-24",
      size: "1.2 MB",
    },
    {
      id: 2,
      name: "Policy Handbook",
      type: "PDF",
      date: "2025-05-24",
      size: "2.5 MB",
    },
    {
      id: 3,
      name: "Insurance Policy",
      type: "PDF",
      date: "2025-06-10",
      size: "0.8 MB",
    },
    {
      id: 4,
      name: "Increment Letter",
      type: "DOCX",
      date: "2026-01-15",
      size: "150 KB",
    },
  ];

  return (
    <div className="layout">
      <div className="rightside-logo">
        <img src={group10} alt="logo" className="rightside-logos" />
      </div>

      <div className="sidebar">
        <EmployeeSidebar />
      </div>

      <div className="main-content">
        <Topbar />
        <Container fluid className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="page-title mb-0">My Documentation</h2>
          </div>

          <Row>
            {documents.map((doc) => (
              <Col md={4} key={doc.id} className="mb-4">
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex align-items-center mb-3">
                      <div
                        className="doc-icon-wrapper me-3"
                        style={{
                          width: "50px",
                          height: "50px",
                          backgroundColor: "#E5F0F7",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "10px",
                        }}
                      >
                        {doc.type === "PDF" ? (
                          <FaFilePdf color="#e63946" size={24} />
                        ) : (
                          <FaFileWord color="#2a9d8f" size={24} />
                        )}
                      </div>
                      <div>
                        <h5 className="mb-0 text-dark fw-bold">{doc.name}</h5>
                        <small className="text-secondary">{doc.date}</small>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                      <span className="text-secondary small">{doc.size}</span>
                      <button
                        className="btn btn-link p-0 text-decoration-none"
                        style={{ color: "#19BDE8" }}
                      >
                        <FaDownload /> Download
                      </button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default EmployeeDocuments;
