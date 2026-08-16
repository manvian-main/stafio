import React, { useEffect, useState, useRef } from "react";
import {
  FaBell,
  FaChevronDown,
  FaPlus,
  FaTimes,
  FaFilePdf,
  FaDownload,
  FaEdit,
  FaShareAlt,
  FaSearch,
} from "react-icons/fa";
import { MdEvent } from "react-icons/md";
import { AiOutlineLike } from "react-icons/ai";
import profileimg2 from "../../assets/profileimg2.png";
import stafiologoimg from "../../assets/stafiologoimg.png";
import "./Topbar.css";
import topbarsettings from "../../assets/topbarsettings.png";
import { Navigate, useNavigate } from "react-router-dom";
import { searchData } from "./searchData";
import apiClient from "../../utils/apiClient";
import { FiEdit } from "react-icons/fi";
import { getCurrentSession } from "../../utils/sessionManager";

// ProfilePopup Component - fetches data from backend
const ProfilePopup = ({ onClose, username }) => {
  const [profileData, setProfileData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState(null);

  // Helper: format YYYY-MM-DD to DD-MM-YYYY for display
  const formatDateDisplay = (dateStr) => {
    if (!dateStr || dateStr === "0001-01-01") return "-";
    if (/^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/.test(dateStr)) return dateStr;
    const parts = dateStr.split("-");
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  // Helper: ensure date is in YYYY-MM-DD format for <input type="date"> and backend
  const toInputDateFormat = (dateStr) => {
    if (!dateStr || dateStr === "0001-01-01") return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const parts = dateStr.split(/[\/\-]/);
    if (parts.length === 3 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const getAuthHeaders = () => {
    return {
      "X-User-Role": localStorage.getItem("current_role"),
      "X-User-ID":
        localStorage.getItem("current_user_id") ||
        localStorage.getItem("employee_user_id"),
    };
  };

  const fetchProfile = async () => {
    try {
      const userId =
        localStorage.getItem("current_user_id") ||
        localStorage.getItem("empId") ||
        localStorage.getItem("employee_user_id");
      if (!userId) {
        setLoading(false);
        return;
      }
      const res = await apiClient.get(`/admin_profile/${userId}`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      const data = { ...res.data };
      if (
        data.education &&
        data.education.skills &&
        typeof data.education.skills === "string"
      ) {
        try {
          const parsed = JSON.parse(data.education.skills);
          data.education = {
            ...data.education,
            skills: Array.isArray(parsed) ? parsed : [],
          };
        } catch (e) {
          data.education = { ...data.education, skills: [] };
        }
      }

      if (data.profile && data.profile.dob) {
        data.profile = {
          ...data.profile,
          dob: toInputDateFormat(data.profile.dob),
        };
      }
      if (data.education) {
        data.education = {
          ...data.education,
          eduStartDate: toInputDateFormat(data.education.eduStartDate),
          eduEndDate: toInputDateFormat(data.education.eduEndDate),
        };
      }
      if (data.experience) {
        data.experience = {
          ...data.experience,
          expStartDate: toInputDateFormat(data.experience.expStartDate),
          expEndDate: toInputDateFormat(data.experience.expEndDate),
        };
      }

      setProfileData(data);
      setEditableData(data);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProfile();
    window.addEventListener("profileUpdated", fetchProfile);
    return () => window.removeEventListener("profileUpdated", fetchProfile);
  }, []);

  const profile = profileData?.profile || {};
  const education = profileData?.education || {};
  const experience = profileData?.experience || {};
  const bank = profileData?.bank || {};

  const handleChange = (section, field, value) => {
    setEditableData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleUpdate = async () => {
    try {
      const userId =
        localStorage.getItem("current_user_id") ||
        localStorage.getItem("employee_user_id");

      const dataToSend = JSON.parse(JSON.stringify(editableData));
      if (dataToSend.profile && dataToSend.profile.dob) {
        dataToSend.profile.dob = toInputDateFormat(dataToSend.profile.dob);
      }
      if (dataToSend.education) {
        if (dataToSend.education.eduStartDate) {
          dataToSend.education.eduStartDate = toInputDateFormat(
            dataToSend.education.eduStartDate,
          );
        }
        if (dataToSend.education.eduEndDate) {
          dataToSend.education.eduEndDate = toInputDateFormat(
            dataToSend.education.eduEndDate,
          );
        }
      }
      if (dataToSend.experience) {
        if (dataToSend.experience.expStartDate) {
          dataToSend.experience.expStartDate = toInputDateFormat(
            dataToSend.experience.expStartDate,
          );
        }
        if (dataToSend.experience.expEndDate) {
          dataToSend.experience.expEndDate = toInputDateFormat(
            dataToSend.experience.expEndDate,
          );
        }
      }
      if (dataToSend.education && Array.isArray(dataToSend.education.skills)) {
        dataToSend.education.skills = JSON.stringify(
          dataToSend.education.skills,
        );
      }

      await apiClient.put(`/admin_profile/${userId}`, dataToSend, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });

      // Re-fetch after update
      const res = await apiClient.get(`/admin_profile/${userId}`, {
        headers: {
          ...getAuthHeaders(),
        },
      });

      const data = { ...res.data };
      if (
        data.education &&
        data.education.skills &&
        typeof data.education.skills === "string"
      ) {
        try {
          const parsed = JSON.parse(data.education.skills);
          data.education = {
            ...data.education,
            skills: Array.isArray(parsed) ? parsed : [],
          };
        } catch (e) {
          data.education = { ...data.education, skills: [] };
        }
      }
      if (data.profile && data.profile.dob) {
        data.profile = {
          ...data.profile,
          dob: toInputDateFormat(data.profile.dob),
        };
      }
      if (data.education) {
        data.education = {
          ...data.education,
          eduStartDate: toInputDateFormat(data.education.eduStartDate),
          eduEndDate: toInputDateFormat(data.education.eduEndDate),
        };
      }
      if (data.experience) {
        data.experience = {
          ...data.experience,
          expStartDate: toInputDateFormat(data.experience.expStartDate),
          expEndDate: toInputDateFormat(data.experience.expEndDate),
        };
      }

      setProfileData(data);
      setEditableData(data);
      setIsEditing(false);
      alert("Profile Updated Successfully");
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update profile");
    }
  };

  return (
    <div className="full-profile-popups">
      <div className="popup-header">
        <h5>
          Profile Details
          {!isEditing ? (
            <FaEdit
              style={{ cursor: "pointer", marginLeft: "15px" }}
              onClick={() => setIsEditing(true)}
            />
          ) : (
            <button
              className="btn btn-success btn-sm ms-2"
              onClick={handleUpdate}
            >
              Save
            </button>
          )}
        </h5>
        <button className="btn-close" onClick={onClose}>
          x
        </button>
      </div>

      <div className="popup-content">
        {loading ? (
          <div className="text-center py-5">Loading...</div>
        ) : (
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
                {isEditing ? (
                  <input
                    value={editableData?.profile?.position || ""}
                    onChange={(e) =>
                      handleChange("profile", "position", e.target.value)
                    }
                  />
                ) : (
                  <p>{profile.position || "-"}</p>
                )}
                <strong>Employment Type:</strong>
                {isEditing ? (
                  <input
                    value={editableData?.profile?.empType || ""}
                    onChange={(e) =>
                      handleChange("profile", "empType", e.target.value)
                    }
                  />
                ) : (
                  <p>{editableData?.profile?.empType || "-"}</p>
                )}
                <strong>
                  {isEditing ? "Supervisor ID" : "Primary Supervisor"}
                </strong>
                {isEditing ? (
                  <input
                    value={editableData?.profile?.supervisor_id || ""}
                    onChange={(e) =>
                      handleChange("profile", "supervisor_id", e.target.value)
                    }
                  />
                ) : (
                  <p>{profile.supervisor || "-"}</p>
                )}
                <strong>Department:</strong>
                {isEditing ? (
                  <input
                    value={editableData?.profile?.department || ""}
                    onChange={(e) =>
                      handleChange("profile", "department", e.target.value)
                    }
                  />
                ) : (
                  <p>{profile.department || "-"}</p>
                )}
                <strong>{isEditing ? "HR Manager ID" : "HR Manager"}</strong>
                {isEditing ? (
                  <input
                    value={editableData?.profile?.hr_manager_id || ""}
                    onChange={(e) =>
                      handleChange("profile", "hr_manager_id", e.target.value)
                    }
                  />
                ) : (
                  <p>{profile.hrManager || "-"}</p>
                )}
              </div>
              <div>
                <h6>Personal Details</h6>
                <strong>Gender:</strong>
                {isEditing ? (
                  <input
                    value={editableData?.profile?.gender || ""}
                    onChange={(e) =>
                      handleChange("profile", "gender", e.target.value)
                    }
                  />
                ) : (
                  <p>{profile.gender || "-"}</p>
                )}
                <strong>Date of Birth:</strong>
                {isEditing ? (
                  <input
                    type="date"
                    value={toInputDateFormat(editableData?.profile?.dob) || ""}
                    onChange={(e) =>
                      handleChange("profile", "dob", e.target.value)
                    }
                  />
                ) : (
                  <p>{formatDateDisplay(profile.dob) || "-"}</p>
                )}
                <strong>Blood Group:</strong>
                <p>{profile.bloodGroup || "-"}</p>
                <strong>Marital Status:</strong>
                <p>{profile.maritalStatus || "-"}</p>
                <strong>Portfolio:</strong>
                <p>
                  {isEditing ? (
                    <input
                      value={editableData?.education?.portfolio || ""}
                      onChange={(e) =>
                        handleChange("education", "portfolio", e.target.value)
                      }
                    />
                  ) : (
                    <p>{education.portfolio || "-"}</p>
                  )}
                </p>
              </div>
              <div>
                <h6>Educational Qualification</h6>
                <strong>Institution:</strong>
                {isEditing ? (
                  <input
                    value={editableData?.education?.institution || ""}
                    onChange={(e) =>
                      handleChange("education", "institution", e.target.value)
                    }
                  />
                ) : (
                  <p>{education.institution || "-"}</p>
                )}
                <strong>Start & End Date:</strong>
                {isEditing ? (
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      type="date"
                      value={
                        toInputDateFormat(
                          editableData?.education?.eduStartDate,
                        ) || ""
                      }
                      onChange={(e) =>
                        handleChange(
                          "education",
                          "eduStartDate",
                          e.target.value,
                        )
                      }
                    />
                    <input
                      type="date"
                      value={
                        toInputDateFormat(
                          editableData?.education?.eduEndDate,
                        ) || ""
                      }
                      onChange={(e) =>
                        handleChange("education", "eduEndDate", e.target.value)
                      }
                    />
                  </div>
                ) : (
                  <p>
                    {education.eduStartDate && education.eduEndDate
                      ? `${formatDateDisplay(education.eduStartDate)} & ${formatDateDisplay(education.eduEndDate)}`
                      : "-"}
                  </p>
                )}
                <strong>Course:</strong>
                {isEditing ? (
                  <input
                    value={editableData?.education?.qualification || ""}
                    onChange={(e) =>
                      handleChange("education", "qualification", e.target.value)
                    }
                  />
                ) : (
                  <p>{education.qualification || "-"}</p>
                )}
                <strong>Specialization:</strong>
                {isEditing ? (
                  <input
                    value={editableData?.education?.specialization || ""}
                    onChange={(e) =>
                      handleChange(
                        "education",
                        "specialization",
                        e.target.value,
                      )
                    }
                  />
                ) : (
                  <p>{education.specialization || "-"}</p>
                )}
                <strong>Skills:</strong>
                <p>
                  {Array.isArray(education.skills)
                    ? education.skills.join(", ")
                    : education.skills || "-"}
                </p>
              </div>
            </div>

            <div className="details-grid">
              <div>
                <h6>Address</h6>
                <strong>Address:</strong>
                {isEditing ? (
                  <input
                    value={editableData?.profile?.address || ""}
                    onChange={(e) =>
                      handleChange("profile", "address", e.target.value)
                    }
                  />
                ) : (
                  <p>{profile.address || "-"}</p>
                )}
                <strong>Location:</strong>
                {isEditing ? (
                  <input
                    value={editableData?.profile?.location || ""}
                    onChange={(e) =>
                      handleChange("profile", "location", e.target.value)
                    }
                  />
                ) : (
                  <p>{profile.location || "-"}</p>
                )}
              </div>
              <div>
                <h6>Contact Details</h6>
                <strong>Phone:</strong>
                {isEditing ? (
                  <input
                    value={editableData?.profile?.phone || ""}
                    onChange={(e) =>
                      handleChange("profile", "phone", e.target.value)
                    }
                  />
                ) : (
                  <p>{profile.phone || "-"}</p>
                )}
                <strong>Email:</strong>
                <p>{profile.email || "-"}</p>
              </div>
              <div>
                <h6>Previous Experience</h6>
                <strong>Company:</strong>
                {isEditing ? (
                  <input
                    value={editableData?.experience?.company || ""}
                    onChange={(e) =>
                      handleChange("experience", "company", e.target.value)
                    }
                  />
                ) : (
                  <p>{experience.company || "-"}</p>
                )}
                <strong>Start & End:</strong>
                {isEditing ? (
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      type="date"
                      value={
                        toInputDateFormat(
                          editableData?.experience?.expStartDate,
                        ) || ""
                      }
                      onChange={(e) =>
                        handleChange(
                          "experience",
                          "expStartDate",
                          e.target.value,
                        )
                      }
                    />
                    <input
                      type="date"
                      value={
                        toInputDateFormat(
                          editableData?.experience?.expEndDate,
                        ) || ""
                      }
                      onChange={(e) =>
                        handleChange("experience", "expEndDate", e.target.value)
                      }
                    />
                  </div>
                ) : (
                  <p>
                    {experience.expStartDate &&
                      experience.expEndDate &&
                      experience.expStartDate !== "0001-01-01" &&
                      experience.expEndDate !== "0001-01-01"
                      ? `${formatDateDisplay(experience.expStartDate)} – ${formatDateDisplay(experience.expEndDate)}`
                      : "-"}
                  </p>
                )}
                <strong>Job Title:</strong>
                {isEditing ? (
                  <input
                    value={editableData?.experience?.jobTitle || ""}
                    onChange={(e) =>
                      handleChange("experience", "jobTitle", e.target.value)
                    }
                  />
                ) : (
                  <p>{experience.jobTitle || "-"}</p>
                )}
                <strong>Description:</strong>
                {isEditing ? (
                  <textarea
                    value={editableData?.experience?.responsibilities || ""}
                    onChange={(e) =>
                      handleChange(
                        "experience",
                        "responsibilities",
                        e.target.value,
                      )
                    }
                  />
                ) : (
                  <p>{experience.responsibilities || "-"}</p>
                )}
              </div>
            </div>

            <div className="details-grid">
              <div>
                <h6>Bank Details</h6>
                <strong>Bank Name:</strong>
                {isEditing ? (
                  <input
                    value={editableData?.bank?.bankName || ""}
                    onChange={(e) =>
                      handleChange("bank", "bankName", e.target.value)
                    }
                  />
                ) : (
                  <p>{bank.bankName || "-"}</p>
                )}
                <strong>Branch:</strong>
                {isEditing ? (
                  <input
                    value={editableData?.bank?.branch || ""}
                    onChange={(e) =>
                      handleChange("bank", "branch", e.target.value)
                    }
                  />
                ) : (
                  <p>{bank.branch || "-"}</p>
                )}
                <strong>Account Number:</strong>
                {isEditing ? (
                  <input
                    value={editableData?.bank?.accountNumber || ""}
                    onChange={(e) =>
                      handleChange("bank", "accountNumber", e.target.value)
                    }
                  />
                ) : (
                  <p>{bank.accountNumber || "-"}</p>
                )}
                <strong>IFSC Code:</strong>
                {isEditing ? (
                  <input
                    value={editableData?.bank?.ifsc || ""}
                    onChange={(e) =>
                      handleChange("bank", "ifsc", e.target.value)
                    }
                  />
                ) : (
                  <p>{bank.ifsc || "-"}</p>
                )}
              </div>
              <div className="submitted-docs">
                <h6>Submitted Documents</h6>
                {profileData?.documents?.length > 0 ? (
                  profileData.documents.map((doc, idx) => (
                    <div className="doc-item" key={idx}>
                      <i className="bi bi-file-earmark-pdf me-2 text-danger"></i>
                      {doc.fileName}
                    </div>
                  ))
                ) : (
                  <div className="doc-item">No documents uploaded</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Topbar = () => {
  const [adminusername, setAdminusername] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [query, setQuery] = useState("");
  const [searchItems, setSearchItems] = useState(searchData);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const popupRef = useRef(null);

  const [formData, setFormData] = useState({
    date: "",
    eventName: "",
    time: "",
    eventType: "",
    message: "",
    employee: "",
    name: "",
    email: "",
    designation: "",
  });

  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [showReactions, setShowReactions] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const dateInputRef = useRef(null);

  const fetchAnnouncements = async () => {
    try {
      const res = await apiClient.get("/api/admin/announcements", {
        headers: {
          "X-User-Role": localStorage.getItem("current_role"),
          "X-User-ID": localStorage.getItem("current_user_id") || localStorage.getItem("employee_user_id"),
        },
      });
      // map backend data to the format used in topbar
      const formatted = res.data.map(item => ({
        id: item.id,
        date: item.event_date || "",
        eventName: item.title || item.event_name || "",
        time: item.event_time || "",
        eventType: item.event_type || "",
        message: item.message || "",
        name: item.author_name || item.sent_by_name || "",
        email: item.author_email || "",
        designation: item.author_designation || "",
        reactions_count: item.reactions_count || 0
      }));
      setAnnouncements(formatted);
    } catch (err) {
      console.error("Error fetching announcements:", err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    const handleAnnouncementUpdated = () => fetchAnnouncements();
    window.addEventListener("announcementUpdated", handleAnnouncementUpdated);
    // FIX 5: Poll every 60 seconds (was 5s) — announcements don't need
    // real-time updates. Aggressive 5s polling was amplifying the 401 loop
    // because each poll fired a new Axios request with its own _retry flag.
    const interval = setInterval(fetchAnnouncements, 60000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("announcementUpdated", handleAnnouncementUpdated);
    };
  }, []);

  useEffect(() => {
    const session = getCurrentSession();
    if (session) {
      setAdminusername(session.username);
      setUsername(session.username);
      setRole(session.role);
    }
  }, []);

  // Listen for event to open announcements popup
  useEffect(() => {
    const handleOpenAnnouncements = () => {
      setShowPopup(true);
      setShowAddForm(false);
    };
    window.addEventListener("openAnnouncements", handleOpenAnnouncements);
    return () => window.removeEventListener("openAnnouncements", handleOpenAnnouncements);
  }, []);

  const fetchProfileData = async () => {
    try {
      const userId =
        localStorage.getItem("current_user_id") ||
        sessionStorage.getItem("current_user_id") ||
        localStorage.getItem("employee_user_id");
      if (userId) {
        const res = await apiClient.get(`/admin_profile/${userId}`, {
          headers: {
            "X-User-Role":
              localStorage.getItem("current_role") ||
              sessionStorage.getItem("current_role") ||
              localStorage.getItem("employee_role"),
            "X-User-ID": userId,
          },
        });
        setProfileData(res.data);
      }
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

  // Removed localStorage sync effect

  const togglePopup = () => {
    setShowPopup(!showPopup);
    setShowAddForm(false);
  };

  const handleAddNewClick = () => {
    setShowAddForm(true);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
        setShowAddForm(false);
      }
    };

    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup]);

  const handleCancel = () => {
    setShowAddForm(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.message.trim()) {
      alert("Please enter a message.");
      return;
    }

    try {
      const payload = {
        event_date: formData.date || null,
        event_name: formData.eventName,
        event_time: formData.time,
        event_type: formData.eventType,
        message: formData.message,
        author_name: formData.name,
        author_email: formData.email,
        author_designation: formData.designation
      };

      await apiClient.post("/api/admin/announcements", payload, {
        headers: {
          "X-User-Role": localStorage.getItem("current_role"),
          "X-User-ID": localStorage.getItem("current_user_id") || localStorage.getItem("employee_user_id"),
        }
      });

      window.dispatchEvent(new Event("announcementUpdated"));

      setFormData({
        date: "",
        eventName: "",
        time: "",
        eventType: "",
        message: "",
        employee: "",
        name: "",
        email: "",
        designation: "",
      });
      setShowAddForm(false);
    } catch (err) {
      console.error("Error submitting announcement", err);
      alert("Failed to submit announcement.");
    }
  };

  const navigate = useNavigate();

  const handleSelect = (item) => {
    setQuery("");

    if (item.type === "employee") {
      navigate("/employees-list", {
        state: {
          highlightName: item.label,
          empId: item.subLabel,
        },
      });
    } else {
      navigate(item.path);
    }
  };

  const filteredResults = searchItems.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.subLabel?.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await apiClient.get("/api/employeeslist");

        const employeeItems = res.data.map((emp) => ({
          type: "employee",
          label: emp.name,
          subLabel: emp.empId,
          path: `/employees-list/${emp.empId}`,
        }));

        setSearchItems([...searchData, ...employeeItems]);
      } catch (err) {
        console.error("Search fetch error:", err);
      }
    };

    fetchEmployees();
  }, []);

  return (
    <>
      <div className="topbar">
        {/* Left Section: Logo + Search */}
        <div className="topbar-left">
          <div
            className="topbar-logo"
            onClick={() => navigate("/admin-dashboard")}
            style={{ cursor: "pointer" }}
          >
            <img src={stafiologoimg} alt="Logo" className="topbar-img" />
          </div>

          {/* Search box — next to logo */}
          <div className="topbar-searches position-relative">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="form-controler"
              placeholder="Quick Search..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
            />

            {query && (
              <div className="search-dropdown">
                {filteredResults.length > 0 ? (
                  filteredResults.map((item, index) => (
                    <div
                      key={index}
                      className="search-item"
                      onClick={() => handleSelect(item)}
                    >
                      <span className="search-type">{item.type}</span>
                      <span>{item.label}</span>
                    </div>
                  ))
                ) : (
                  <div className="search-item no-result">No results found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Bell + Settings + Profile */}
        <div className="topbar-right">
          <div
            className="notification-icon"
            onClick={togglePopup}
            style={{ cursor: "pointer" }}
          >
            <FaBell size={20} className="notification-bell" />
          </div>

          <div className="settings-icon">
            <img
              src={topbarsettings}
              alt="Settings"
              className="topbar-settings"
              onClick={() => navigate("/admin-settings")}
            />
          </div>

          <div
            className="profile-wrapper d-flex align-items-center gap-2"
            onClick={() => setShowProfilePopup((prev) => !prev)}
            style={{ cursor: "pointer" }}
          >
            <img
              src={profileData?.profile?.profileImage || stafiologoimg}
              alt="User"
              className="topbar-avatar"
            />
            <div className="profile-info">
              <div className="profile-name">{username || "User"}</div>
              <div className="profile-role">{role || "admin"}</div>
            </div>
            <FaChevronDown
              size={14}
              className="profile-chevron"
              style={{ marginLeft: "5px" }}
            />
          </div>
        </div>
      </div>

      {/* Announcement Popup */}
      {showPopup && !showAddForm && (
        <div className="announcement-popup shadow-lg" ref={popupRef}>
          <div className="popup-header d-flex align-items-center justify-content-between">
            <div className="announcement-left">
              <div
                className="announcement-dropdown"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <span className="fw-semi-bold fs-5">Announcement</span>
                <span className="filter-text">{selectedFilter}</span>
                <FaChevronDown />
              </div>

              {filterOpen && (
                <div className="dropdown-menu-custom">
                  <div
                    onClick={() => {
                      setSelectedFilter("All");
                      setFilterOpen(false);
                    }}
                  >
                    All
                  </div>
                  <div
                    onClick={() => {
                      setSelectedFilter("New");
                      setFilterOpen(false);
                    }}
                  >
                    New
                  </div>
                  <div
                    onClick={() => {
                      setSelectedFilter("Old");
                      setFilterOpen(false);
                    }}
                  >
                    Old
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT SIDE */}
            <div className="announcement-right">
              <div className="announce-calendar-box">
                <input
                  ref={dateInputRef}
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="custom-date-input"
                />
                <FaChevronDown
                  className="fachevron-box"
                  onClick={() => {
                    if (dateInputRef.current) {
                      dateInputRef.current.showPicker();
                    }
                  }}
                />
              </div>

              <div
                className="add-new-link"
                onClick={() => {
                  setShowPopup(false);
                  setShowAddForm(true);
                }}
              >
                <FaPlus className="plus-icon" /> Add New
              </div>
            </div>
          </div>

          <hr />

          <div className="popup-content">
            {announcements.length === 0 ? (
              <div className="text-center text-muted py-5">
                No announcements yet.
              </div>
            ) : (
              <ul className="announcement-list">
                {announcements.map((a, i) => (
                  <li key={i} className="announcement-item">
                    <div className="announcement-name">
                      {a.name || "Unknown"}
                    </div>

                    <div className="announcement-meta">
                      {a.designation || "No Designation"}
                    </div>

                    <div className="announcement-eventname">{a.eventName}</div>

                    <div
                      className="announcement-message"
                      style={{ marginBottom: "20px" }}
                    >
                      {a.message}
                    </div>
                    <hr />

                    <div className="announcement-actions">
                      <div
                        className="react-btn"
                        onMouseEnter={() => setShowReactions(i)}
                        onMouseLeave={() => setShowReactions(null)}
                      >
                        <AiOutlineLike /> React
                        {showReactions === i && (
                          <div className="reaction-popup">
                            <span>👍</span>
                            <span>❤️</span>
                            <span>😂</span>
                            <span>🎉</span>
                            <span>👏</span>
                          </div>
                        )}
                      </div>

                      <div className="action-btn">
                        <FaShareAlt /> Share
                      </div>

                      <div className="action-btn">
                        <MdEvent /> Event
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Add New Announcement Modal */}
      {showAddForm && (
        <div className="add-announcement-overlay">
          <div className="add-form-container">
            <div className="form-header">
              <h5>Add New Announcement</h5>
              <FaTimes
                className="close-icon"
                onClick={() => setShowAddForm(false)}
              />
            </div>

            <form onSubmit={handleSubmit} className="announcement-form">
              <div className="form-grid">
                <div>
                  <label>Event Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label>Event Name</label>
                  <input
                    type="text"
                    name="eventName"
                    placeholder="Enter name of event"
                    value={formData.eventName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label>Time Of The Event</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label>Event Type</label>
                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Holiday">Holiday</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="full-width">
                  <label>Message</label>
                  <textarea
                    name="message"
                    placeholder="Type message"
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div>
                  <label>Mention Any Employee</label>
                  <input
                    type="text"
                    name="employee"
                    placeholder="Enter employee name"
                    value={formData.employee}
                    onChange={handleChange}
                  />
                </div>

                <hr />
                <h6 className="fw-bold">Your Details</h6>

                <div>
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label>Designation</label>
                  <input
                    type="text"
                    name="designation"
                    placeholder="Enter your designation"
                    value={formData.designation}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-buttons">
                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Profile Popup */}
      {showProfilePopup && (
        <ProfilePopup
          onClose={() => setShowProfilePopup(false)}
          username={adminusername}
        />
      )}
    </>
  );
};

export default Topbar;