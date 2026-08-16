import React from "react";
import stafiologoimg from "../../../assets/stafiologoimg.png"; // Profile image
import arrow3 from "../../../assets/arrow3.png"; // Paper plane arrow
import Rectangle6 from "../../../assets/Rectangle6.png"; // Human illustration
import "./ProfileBanner.css";

const ProfileBanner = ({ profileData }) => {
  // Use profileData if provided, otherwise use empty values
  const {
    name = "",
    empId = "",
    empType = "",
    location = "",
    department = "",
    supervisor = "",
    hrManager = "",
    email = "",
    phone = "",
    position = "",
    profileImage = "",
  } = profileData || {};

  return (
    <div className="profile-banner-wrapper">
      <div className="my-profile-title">
        <h1>My Profile</h1>
        {/* added new my profile title */}
      </div>
      <div className="profile-banner-container">
        {/* Top Gradient Banner */}
        <div className="profile-banner-top">
          {/* Profile Image */}
          <div className="profile-image-wrapper">
            <img
              src={profileImage || stafiologoimg}
              alt="Profile"
              className="profile-image"
            />
          </div>

          {/* Arrow Illustration */}
          <img
            src={arrow3}
            alt="Arrow illustration"
            className="profile-banner-arrow"
          />

          {/* Right Illustration */}
          <img
            src={Rectangle6}
            alt="Team Illustration"
            className="profile-banner-illustration"
          />
        </div>

        {/* White Card with Details */}
        <div className="profile-info-card">
          <div className="profile-info-grid">
            {/* Left Section */}
            <div className="profile-left">
              <div className="profile-name-line">
                <span className="profile-name">{name || "Name not set"}</span>
                <span className="profile-id">
                  (ID {empId || "Not assigned"})
                </span>
              </div>
              <div className="profile-role">
                {position || empType || "Position not set"}
              </div>
              <div className="profile-location">
                {location || "Location not set"}
              </div>
            </div>

            {/* Center Section */}
            <div className="profile-center">
              <div>Employment Type : {empType || "Not specified"}</div>
              <div>Primary Supervisor : {supervisor || "Not assigned"}</div>
              <div>HR Manager : {hrManager || "Not assigned"}</div>
            </div>

            {/* Right Section */}
            <div className="profile-right">
              <div>Department : {department || "Not assigned"}</div>
              <div>Email Id : {email || "Email not set"}</div>
              <div>Contact : {phone || "Phone not set"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileBanner;
