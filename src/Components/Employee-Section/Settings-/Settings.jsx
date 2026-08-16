import React, { useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Settings.css";
import EmployeeSidebar from "../EmployeeSidebar";
import Topbar from "../Topbar";
import { SettingsContext } from "./SettingsContext";
import { Border } from "react-bootstrap-icons";
import { BiFontSize } from "react-icons/bi";
import profileimg from "../../../assets/profileimg.png";
import profileimg2 from "../../../assets/profileimg2.png";
import { BsUpload } from "react-icons/bs";

const API_BASE = "http://127.0.0.1:5001";

export default function Settings() {
  const {
    theme, setTheme,
    language, setLanguage,
    font, setFont,
    dateFormat, setDateFormat
  } = useContext(SettingsContext);
  const [activeTab, setActiveTab] = useState("general");
  const [errors, setErrors] = useState({});

  const [basicForm, setBasicForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    role: "",
  });

  const [basicErrors, setBasicErrors] = useState({});

  const [profileImage, setProfileImage] = useState(profileimg);
  const profileInputRef = useRef(null);

  // Function to show "General settings updated" message
  const showGeneralSuccess = () => {
    setSaveMessage("General settings updated successfully!");
    const timer = setTimeout(() => setSaveMessage(""), 3000);
    return () => clearTimeout(timer);
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Simple language translation object
  const translations = {
    english: {
      title: "System Settings",
      subtitle: "Setup and edit system settings and preferences",
      general: "General Settings",
      general1: "General",
      basic: "Basic Info",
      systemLanguage: "System Language",
      dashboardTheme: "Dashboard Theme",
      systemFont: "System Font",
      dateFormat: "Date and Time Format",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      phone: "Phone Number",
      position: "Position",
      role: "Role",
      profilepicture: "Profile Picture",
      subp3: "We support only JPEGs or PNGs under 5MB",
    },
    tamil: {
      title: "கணினி அமைப்புகள்",
      subtitle: "அமைப்புகளை திருத்தவும், அமைக்கவும்",
      general: "பொது அமைப்புகள்",
      basic: "அடிப்படை தகவல்",
      systemLanguage: "மொழி",
      dashboardTheme: "டாஷ்போர்டு தீம்",
      systemFont: "எழுத்துரு பாணி",
      dateFormat: "தேதி மற்றும் நேர வடிவம்",
      firstName: "முதல் பெயர்",
      lastName: "கடைசி பெயர்",
      email: "மின்னஞ்சல்",
      phone: "தொலைபேசி எண்",
      position: "பதவி",
      role: "பங்கு",
    },
    hindi: {
      title: "सिस्टम सेटिंग्स",
      subtitle: "सिस्टम सेटिंग्स और प्राथमिकताएँ संपादित करें",
      general: "सामान्य सेटिंग्स",
      basic: "मूल जानकारी",
      systemLanguage: "भाषा",
      dashboardTheme: "डैशबोर्ड थीम",
      systemFont: "फ़ॉन्ट शैली",
      dateFormat: "तारीख और समय प्रारूप",
      firstName: "पहला नाम",
      lastName: "अंतिम नाम",
      email: "ईमेल",
      phone: "फ़ोन नंबर",
      position: "पद",
      role: "भूमिका",
    },
  };

  // Assign t from translations
  const t = translations[language] || translations.english;

  const [saveMessage, setSaveMessage] = useState("");

  const getHeaders = () => {
    const userId = localStorage.getItem("current_user_id");
    const role = localStorage.getItem("current_role");
    return {
      "X-User-ID": userId,
      "X-User-Role": role,
    };
  };

  useEffect(() => {
    const fetchBasicInfo = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/settings/basic_info`, {
          headers: getHeaders(),
        });
        setBasicForm({
          firstName: res.data.firstName || "",
          lastName: res.data.lastName || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          position: res.data.position || "",
          role: res.data.role || "employee",
        });
        if (res.data.profileImage) {
          setProfileImage(res.data.profileImage);
        }
      } catch (err) {
        console.error("Error fetching basic info:", err);
      }
    };

    fetchBasicInfo();
  }, []);

  useEffect(() => {
    console.log("Auto-saving general settings", {
      language,
      theme,
      font,
      dateFormat,
    });
  }, [language, theme, font, dateFormat]);

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setBasicForm({
      ...basicForm,
      [name]: value,
    });
    setBasicErrors({
      ...basicErrors,
      [name]: "",
    });
  };

  const validateBasicInfo = () => {
    const errors = {};

    if (!basicForm.firstName.trim()) {
      errors.firstName = "*First name is required";
    }

    if (!basicForm.lastName.trim()) {
      errors.lastName = "*Last name is required";
    }

    if (!basicForm.email.trim()) {
      errors.email = "*Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(basicForm.email)) {
      errors.email = "*Enter a valid email address";
    }

    if (!basicForm.phone.trim()) {
      errors.phone = "*Phone number is required";
    } else if (!/^[0-9]{10}$/.test(basicForm.phone)) {
      errors.phone = "*Enter a valid 10-digit phone number";
    }

    if (!basicForm.position.trim()) {
      errors.position = "*Position is required";
    }

    if (!basicForm.role.trim()) {
      errors.role = "*Role is required";
    }

    setBasicErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBasicSave = async () => {
    if (validateBasicInfo()) {
      try {
        await axios.put(
          `${API_BASE}/api/settings/basic_info`,
          {
            ...basicForm,
            profileImage: profileImage === profileimg ? "" : profileImage,
          },
          {
            headers: getHeaders(),
          },
        );
        setSaveMessage("Basic info saved successfully!");
        window.dispatchEvent(new Event("profileUpdated"));
        setTimeout(() => setSaveMessage(""), 3000);
      } catch (err) {
        console.error("Error saving basic info:", err);
        alert(err.response?.data?.message || "Failed to save basic info");
      }
    }
  };

  const handleBasicCancel = () => {
    setBasicForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      position: "",
      role: "employee",
    });
    setProfileImage(profileimg);
    setBasicErrors({});
  };

  return (
    <div className="dashboard-wrapper d-flex">
      <div className="sidebar">
        <EmployeeSidebar />
      </div>

      <div className="main-content flex-grow-1">
        <Topbar />

        <div className="settings-page p-4">
          {/* Header */}
          <div className="settings-header">
            <h1>{t.title}</h1>
            <p>{t.subtitle}</p>
            {saveMessage && (
              <div className="alert alert-success">{saveMessage}</div>
            )}
          </div>

          {/* Tabs */}
          <div className="settings-tabs">
            <button
              className={`tab-link ${activeTab === "general" ? "active" : ""}`}
              onClick={() => setActiveTab("general")}
            >
              {t.general}
            </button>

            <button
              className={`tab-link ${activeTab === "basic" ? "active" : ""}`}
              onClick={() => setActiveTab("basic")}
            >
              {t.basic}
            </button>
          </div>

          {/* Tab Content */}
          <div className="settings-card">
            {/* General Settings */}
            {activeTab === "general" && (
              <div>
                <h3>{t.general1}</h3>

                <div className="emp-form-group">
                  <label>{t.systemLanguage}</label>
                  <select
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value);
                      showGeneralSuccess();
                    }}
                  >
                    <option value="english">English</option>
                    <option value="hindi">Hindi</option>
                    <option value="tamil">Tamil</option>
                  </select>
                </div>

                <div className="emp-form-group">
                  <label>{t.dashboardTheme}</label>
                  <div className="theme-input-box">
                    <span className="theme-text">
                      {theme === "light" ? "Light Theme" : "Dark Theme"}
                    </span>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={theme === "dark"}
                        onChange={() => {
                          setTheme(theme === "light" ? "dark" : "light");
                          showGeneralSuccess();
                        }}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>

                <div className="emp-form-group">
                  <label>{t.systemFont}</label>
                  <select
                    value={font}
                    onChange={(e) => {
                      setFont(e.target.value);
                      showGeneralSuccess();
                    }}
                  >
                    <option value="default">Default - Montserrat</option>
                    <option value="arial">Arial</option>
                    <option value="roboto">Roboto</option>
                  </select>
                </div>

                <div className="emp-form-group">
                  <label>{t.dateFormat}</label>
                  <select
                    value={dateFormat}
                    onChange={(e) => {
                      setDateFormat(e.target.value);
                      showGeneralSuccess();
                    }}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD MMM YYYY">DD MMM YYYY</option>
                    <option value="MMM DD YYYY">MMM DD YYYY</option>
                    <option value="MMM-DD-YYYY">MMM-DD-YYYY</option>
                    <option value="DD-MM-YYYY">DD-MM-YYYY</option>

                  </select>
                </div>
              </div>
            )}

            {/* Basic Info */}
            {activeTab === "basic" && (
              <div>
                <div className="form-row">
                  <div className="form-column">
                    <div className="form-group">
                      <label>{t.firstName}</label>
                      <input
                        type="text"
                        name="firstName"
                        value={basicForm.firstName}
                        placeholder={t.firstName}
                        onChange={handleBasicChange}
                      />
                      {basicErrors.firstName && (
                        <span className="error-text">
                          {basicErrors.firstName}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>{t.email}</label>
                      <input
                        type="email"
                        name="email"
                        value={basicForm.email}
                        placeholder={t.email}
                        onChange={handleBasicChange}
                      />
                      {basicErrors.email && (
                        <span className="error-text">{basicErrors.email}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>{t.position}</label>
                      <input
                        type="text"
                        name="position"
                        value={basicForm.position}
                        placeholder={t.position}
                        onChange={handleBasicChange}
                      />
                      {basicErrors.position && (
                        <span className="error-text">
                          {basicErrors.position}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="form-column">
                    <div className="form-group">
                      <label>{t.lastName}</label>
                      <input
                        type="text"
                        name="lastName"
                        value={basicForm.lastName}
                        placeholder={t.lastName}
                        onChange={handleBasicChange}
                      />
                      {basicErrors.lastName && (
                        <span className="error-text">
                          {basicErrors.lastName}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>{t.phone}</label>
                      <input
                        type="tel"
                        name="phone"
                        value={basicForm.phone}
                        placeholder={t.phone}
                        onChange={handleBasicChange}
                      />
                      {basicErrors.phone && (
                        <span className="error-text">{basicErrors.phone}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <label>{t.role}</label>
                      <input
                        type="text"
                        name="role"
                        value={basicForm.role}
                        placeholder={t.role}
                        onChange={handleBasicChange}
                      />
                      {basicErrors.role && (
                        <span className="error-text">{basicErrors.role}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-group3">
                  <h3>{t.profilepicture}</h3>
                  <p className="file-info">{t.subp3}</p>
                  <div className="profile-upload1">
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="profile-preview1"
                    />
                    <input
                      type="file"
                      accept="image/jpeg, image/png"
                      style={{ display: "none" }}
                      ref={profileInputRef}
                      onChange={handleProfileImageUpload}
                    />
                    <button
                      type="button"
                      className="upload-btn1"
                      onClick={() =>
                        profileInputRef.current &&
                        profileInputRef.current.click()
                      }
                    >
                      <BsUpload /> Upload
                    </button>
                  </div>
                </div>

                <div className="form-actions1">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={handleBasicCancel}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-save"
                    onClick={handleBasicSave}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
