import React from "react";
import AdminSidebar from "./AdminSidebar";
import Topbar from "./Topbar";
import { Container, Card } from "react-bootstrap";
import group10 from "../../assets/Group10.png";

const AdminLetterGeneration = () => {
  return (
    <div className="letter-generation-layout">
      <div className="rightside-logo">
        <img src={group10} alt="logo" className="rightside-logos" />
      </div>
      <AdminSidebar />
      <div className="letter-generation-main">
        <Topbar />
        <Container fluid className="p-4 text-center">
          <Card className="border-0 shadow-sm p-5 mt-5">
            <h2 className="text-secondary">Letter Generation Module</h2>
            <p className="text-muted mt-3">
              Automate your offer letters, increment letters, and experience
              certificates here. Integrating soon with employee data.
            </p>
            <div className="mt-4">
              <span className="badge bg-primary p-2 px-4 shadow-sm">
                Module Pending
              </span>
            </div>
          </Card>
        </Container>
      </div>
    </div>
  );
};

export default AdminLetterGeneration;
