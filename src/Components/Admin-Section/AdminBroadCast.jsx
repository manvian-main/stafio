import React from "react";
import AdminSidebar from "./AdminSidebar";
import Topbar from "./Topbar";
import { Container, Card } from "react-bootstrap";
import group10 from "../../assets/Group10.png";

const AdminBroadCast = () => {
  return (
    <div className="admin-broadcast-layout">
      <div className="rightside-logo">
        <img src={group10} alt="logo" className="rightside-logos" />
      </div>
      <AdminSidebar />
      <div className="admin-broadcast-main">
        <Topbar />
        <Container fluid className="p-4 text-center">
          <Card className="border-0 shadow-sm p-5 mt-5">
            <h2 className="text-secondary">Admin Broadcast Center</h2>
            <p className="text-muted mt-3">
              This module is under development. Soon you will be able to
              broadcast announcements and notifications across the organization.
            </p>
            <div className="mt-4">
              <span className="badge bg-info p-2 px-4 shadow-sm">
                Coming Soon
              </span>
            </div>
          </Card>
        </Container>
      </div>
    </div>
  );
};

export default AdminBroadCast;