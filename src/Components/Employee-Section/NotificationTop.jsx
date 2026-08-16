import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import "./NotificationTop.css";

const NotificationBar = () => {
  const [visible, setVisible] = useState(true);
  const [latestAnnouncement, setLatestAnnouncement] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5001/api/broadcast");
        if (res.ok) {
          const parsed = await res.json();
          if (parsed.length > 0) {
            const newAnn = parsed[0];
            setLatestAnnouncement(prev => {
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

    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!visible || !latestAnnouncement) return null;

  return (
    <div className="notification-top">
      <div className="notification-content">
        <div className="notification-space">
          <p className="event-names">
            {latestAnnouncement.eventName || latestAnnouncement.title}
          </p>
          <span>---</span>
          <p className="event-messages">{latestAnnouncement.message}</p>
        </div>
        <div className="close" onClick={() => setVisible(false)}>
          <FaTimes />
        </div>
      </div>
    </div>
  );
};

export default NotificationBar;
