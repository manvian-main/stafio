import React, { useEffect, useState, useRef } from "react";
import {
  FaBell,
  FaChevronDown,
  FaFilePdf,
  FaDownload,
  FaSearch,
  FaCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FiEdit } from "react-icons/fi";
import stafiologoimg from "../../assets/stafiologoimg.png";
import axios from "axios";
import "./Topbar.css";
import profileimg from "../../assets/profileimg.png";

const API_BASE = "http://127.0.0.1:5001";

const Topbar = () => {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const popupRef = useRef(null);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const API_BASE_URL = "http://127.0.0.1:5001";

  useEffect(() => {
    const storedUsername = localStorage.getItem("current_username");
    if (storedUsername) setUsername(storedUsername);

    const storedUserrole = localStorage.getItem("current_role");
    if (storedUserrole) setRole(storedUserrole);

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchProfileData = async () => {
    try {
      const userId = localStorage.getItem("current_user_id");
      if (!userId) return;

      const res = await axios.get(`${API_BASE}/employee_profile/${userId}`, {
        headers: {
          "X-User-Role": localStorage.getItem("current_role"),
          "X-User-ID": userId,
        },
      });
      setProfileData(res.data);
    } catch (err) {
      console.error("Error fetching profile in Topbar:", err);
    }
  };

  useEffect(() => {
    fetchProfileData();

    const handleProfileUpdate = () => {
      fetchProfileData();
    };
    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () =>
      window.removeEventListener("profileUpdated", handleProfileUpdate);
  }, []);

  const employeePages = [
    { title: "Dashboard", path: "/employee-dashboard", type: "Module" },
    { title: "Apply Leave", path: "/apply-leave", type: "Module" },
    { title: "Attendance", path: "/employee-attendance", type: "Module" },
    { title: "Profile", path: "/profile", type: "Module" },
    {
      title: "Performance Tracker",
      path: "/performance-tracker",
      type: "Module",
    },
    { title: "Payroll", path: "/employee-payroll", type: "Module" },
    { title: "Settings", path: "/settings", type: "Module" },
    { title: "Documents", path: "/employeedocs", type: "Module" },
    { title: "My Leave", path: "/my-leave", type: "Module" },
    { title: "My Regularization", path: "/my-regularization", type: "Module" },
    { title: "My Holiday", path: "/my-holidays", type: "Module" },
    { title: "Offer Letter", path: "/employeedocs", type: "Document" },
    { title: "Degree Certificate", path: "/employeedocs", type: "Document" },
    { title: "PAN Card", path: "/employeedocs", type: "Document" },
  ];

  const filteredPages = employeePages.filter((page) =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const fetchNotifications = async () => {
    try {
      const userId = localStorage.getItem("current_user_id");
      if (!userId) {
        console.warn("No User ID found in localStorage for notifications");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
        headers: { "X-User-ID": userId },
      });

      setNotifications(response.data);
      const unread = response.data.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notifId) => {
    try {
      await axios.put(`${API_BASE_URL}/api/notifications/${notifId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.is_read) {
      markAsRead(notif.id);
    }

    const title = (notif.title || "").toLowerCase();

    // Explicit title-based mapping (takes priority over potentially broken backend notif.link strings)
    if (title.includes("leave")) {
      navigate("/my-leave");
    } else if (title.includes("regularization")) {
      navigate("/my-regularization");
    } else if (title.includes("announcement") || title.includes("broadcast")) {
      navigate("/employee-dashboard");
    } else if (title.includes("holiday")) {
      navigate("/my-holidays");
    } else if (title.includes("attendance")) {
      navigate("/employee-attendance");
    } else if (notif.link) {
      // Correct common backend link typos
      if (notif.link === "/employee/attendance") {
        navigate("/employee-attendance");
      } else {
        navigate(notif.link);
      }
    }

    setShowNotifications(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowProfilePopup(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    const handleOpenNotifications = () => {
      setShowNotifications(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("openNotifications", handleOpenNotifications);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("openNotifications", handleOpenNotifications);
    };
  }, []);

  const profile = profileData?.profile || {};
  const education = profileData?.education || {};
  const experience = profileData?.experience || {};
  const bankDetails = profileData?.bank || {};

  return (
    <div className="topbar">
      {/* Left Section: Logo + Search */}
      <div className="topbar-left">
        <div
          className="topbar-logo"
          onClick={() => navigate("/employee-dashboard")}
          style={{ cursor: "pointer" }}
        >
          <img src={stafiologoimg} alt="Logo" className="topbar-img" />
        </div>

        <div className="topbar-searches" ref={searchRef}>
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="form-controler"
            placeholder="Quick Search..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
          />
          {showSearchResults && searchQuery && (
            <div className="search-results-dropdown">
              {filteredPages.length > 0 ? (
                filteredPages.map((page, index) => (
                  <div
                    key={index}
                    className="search-result-item"
                    onClick={() => {
                      navigate(page.path);
                      setSearchQuery("");
                      setShowSearchResults(false);
                    }}
                  >
                    <span className="search-result-type">{page.type}</span>
                    <span className="search-result-title">{page.title}</span>
                  </div>
                ))
              ) : (
                <div className="search-result-item no-results">
                  No pages found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Section: Notifications + Profile */}
      <div className="topbar-right">
        <div className="notification-container" ref={notificationRef}>
          <div
            className="notification-icon"
            style={{ cursor: "pointer", position: "relative" }}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <FaBell size={20} className="topbar-bell-icon" />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </div>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notif-header">
                <h6>Notifications</h6>
                {notifications.length > 0 && unreadCount > 0 && (
                  <span className="mark-all-read" onClick={() => { }}>
                    {unreadCount} New
                  </span>
                )}
              </div>
              <div className="notif-body">
                {notifications.length === 0 ? (
                  <div className="no-notif">No notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`notif-item ${notif.is_read ? "read" : "unread"}`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className="notif-icon-circle">
                        <FaBell size={14} />
                      </div>
                      <div className="notif-info">
                        <div className="notif-title">{notif.title}</div>
                        <div className="notif-message">{notif.message}</div>
                        <div className="notif-time">
                          {new Date(notif.created_at).toLocaleString()}
                        </div>
                      </div>
                      {!notif.is_read && (
                        <FaCircle
                          size={8}
                          color="#007bff"
                          className="unread-dot"
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
              <div
                className="notif-footer"
                onClick={() => setShowNotifications(false)}
              >
                Close
              </div>
            </div>
          )}
        </div>

        <div
          className="profile-data"
          onClick={() => setShowProfilePopup((prev) => !prev)}
          ref={popupRef}
        >
          <img
            src={profile.profileImage || stafiologoimg}
            alt="User"
            className="topbar-avatar"
          />
          <div className="profile-info">
            <div className="profile-name">
              {profile.name || username || "User"}
            </div>
            <div className="profile-role">{role || "Employee"}</div>
          </div>
          <FaChevronDown size={14} className="profile-chevron" style={{ marginLeft: "5px" }} />
        </div>
      </div>

      {/* Profile Popup */}
      {showProfilePopup && (
        <div className="full-profile-popups" ref={popupRef}>
          <div className="popup-content">
            {/* Profile section */}
            <div className="profile-section">
              <div className="profile-photo">
                <img src={profile.profileImage || profileimg2} alt="Profile" />
                <h6>{profile.name || username || "User"}</h6>
                <p className="text-success">● {profile.status || "Active"}</p>
              </div>

              <div className="details-grid">
                <div>
                  <h6>Personal Details</h6>
                  <strong>Position:</strong>
                  <p> {profile.position || "-"}</p>
                  <strong>Employment Type:</strong>
                  <p> {profile.empType || "-"}</p>
                  <strong>Primary Supervisor:</strong>{" "}
                  <p>{profile.supervisor || "-"}</p>
                  <strong>Department:</strong>
                  <p> {profile.department || "-"}</p>
                  <strong>HR Manager:</strong>
                  <p> {profile.hrManager || "-"}</p>
                </div>
                <div>
                  <h6>Personal Details</h6>
                  <strong>Gender:</strong>
                  <p> {profile.gender || "-"}</p>
                  <strong>Date of Birth:</strong>
                  <p> {profile.dob || "-"}</p>
                  <strong>Blood Group:</strong>
                  <p> {profile.bloodGroup || "-"}</p>
                  <strong>Marital Status:</strong>
                  <p> {profile.maritalStatus || "-"}</p>
                  <strong>Portfolio:</strong>
                  <p> {education.portfolio || "-"}</p>
                </div>
                <div>
                  <h6>Educational Qualification</h6>
                  <strong>Institution:</strong>
                  <p> {education.institution || "-"}</p>
                  <strong>Start & End Date:</strong>
                  <p>
                    {" "}
                    {education.eduStartDate || "-"} –{" "}
                    {education.eduEndDate || "-"}
                  </p>
                  <strong>Course:</strong>
                  <p> {education.qualification || "-"}</p>
                  <strong>Specialization:</strong>
                  <p> {education.specialization || "-"}</p>
                  <strong>Skills:</strong>{" "}
                  <p>
                    {" "}
                    {Array.isArray(education.skills)
                      ? education.skills.join(", ")
                      : education.skills || "-"}
                  </p>
                </div>
              </div>

              <div className="details-grid">
                <div>
                  <h6>Address</h6>
                  <strong>Address Line:</strong>
                  <p>{profile.address || "-"}</p>
                  <strong>Location:</strong>
                  <p> {profile.location || "-"}</p>
                </div>
                <div>
                  <h6>Contact Details</h6>
                  <strong>Phone:</strong> <p>{profile.phone || "-"}</p>
                  <strong>Emergency Contact:</strong>
                  <p> {profile.emergencyContactNumber || "-"}</p>
                  <strong>Relationship:</strong>
                  <p> {profile.relationship || "-"}</p>
                  <strong>Email:</strong> <p>{profile.email || "-"}</p>
                </div>
                <div>
                  <h6>Previous Experience</h6>
                  <strong>Company:</strong>
                  <p> {experience.company || "-"}</p>
                  <strong>Start & End:</strong>
                  <p>
                    {" "}
                    {experience.expStartDate || "-"} –{" "}
                    {experience.expEndDate || "-"}
                  </p>
                  <strong>Job Title:</strong>
                  <p> {experience.jobTitle || "-"}</p>
                  <strong>Description:</strong>
                  <p> {experience.responsibilities || "-"}</p>
                </div>
              </div>

              <div className="details-grid">
                <div>
                  <h6>Bank Details</h6>
                  <strong>Bank Name:</strong>
                  <p> {bankDetails.bankName || "-"}</p>
                  <strong>Branch:</strong>
                  <p> {bankDetails.branch || "-"}</p>
                  <strong>Account Number:</strong>
                  <p> {bankDetails.accountNumber || "-"}</p>
                  <strong>IFSC Code:</strong>
                  <p> {bankDetails.ifsc || "-"}</p>
                </div>

                <div className="submitted-docs">
                  <h6>Submitted Documents</h6>
                  {profileData?.documents?.length > 0 ? (
                    profileData.documents.map((doc, idx) => (
                      <div className="doc-item" key={idx}>
                        <FaFilePdf className="text-danger me-2" /> {doc.fileName || doc.name}
                        <FaDownload className="float-end" />
                      </div>
                    ))
                  ) : (
                    <p className="text-muted small">No documents uploaded</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Topbar;
