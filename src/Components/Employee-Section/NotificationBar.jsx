import React, { useState, useEffect } from "react";
import { FaTimes, FaRocket } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./NotificationBar.css";

const NotificationBar = () => {
  const [visible, setVisible] = useState(true);
  const [latestAnnouncement, setLatestAnnouncement] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadLatestAnnouncement = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5001/api/broadcast");
        if (res.ok) {
          const parsed = await res.json();
          if (parsed.length > 0) {
            const newAnn = parsed[0];
            setLatestAnnouncement((prev) => {
              if (!prev || prev.id !== newAnn.id || prev.message !== newAnn.message) {
                setVisible(true);
                return newAnn;
              }
              return prev;
            });
          }
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };

    // Load initially
    loadLatestAnnouncement();

    // Poll every 5 seconds for cross-browser updates
    const interval = setInterval(loadLatestAnnouncement, 5000);

    // 🔥 Listen for updates locally
    window.addEventListener("announcementUpdated", loadLatestAnnouncement);

    return () => {
      clearInterval(interval);
      window.removeEventListener("announcementUpdated", loadLatestAnnouncement);
    };
  }, []);

  const handleViewAll = () => {
    const role = localStorage.getItem("current_role");
    if (role === "admin") {
      window.dispatchEvent(new Event("openAnnouncements"));
    } else {
      window.dispatchEvent(new Event("openNotifications"));
    }
  };

  if (!visible || !latestAnnouncement) return null;

  return (
    <div className="notification">
      <div className="icon">
        <FaRocket size={28} />
      </div>

      <div className="content">
        <div className="notification-container">
          <h4 className="event-name">
            {latestAnnouncement.eventName || latestAnnouncement.title}
          </h4>
          <p className="event-message">{latestAnnouncement.message}</p>
        </div>

        <div className="actions">
          <span className="dismiss" onClick={() => setVisible(false)}>
            Dismiss
          </span>
          <span className="viewAll" onClick={handleViewAll}>
            View All
          </span>
        </div>
      </div>

      <div className="close" onClick={() => setVisible(false)}>
        <FaTimes />
      </div>
    </div>
  );
};

export default NotificationBar;
