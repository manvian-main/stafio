import React, { createContext, useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import apiClient from "../../../utils/apiClient";

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const location = useLocation();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "english",
  );
  const [font, setFont] = useState(localStorage.getItem("font") || "default");
  const [dateFormat, setDateFormat] = useState(
    localStorage.getItem("dateFormat") || "DD MMM YYYY",
  );
  const [dateFormatEnabled, setDateFormatEnabled] = useState(
    localStorage.getItem("dateFormatEnabled") !== "false", // Default to true if not explicitly false
  );

  const isFirstMount = useRef(true);

  // Fetch settings once on mount (login or page load)
  const fetchSettings = useCallback(async () => {
    try {
      const userRole = localStorage.getItem("current_role");

      // Always get global settings for language/font/defaults
      const globalRes = await apiClient.get("/api/settings/general");
      const globalData = globalRes.data;

      // Logic: Only apply Admin Default if there is no session-specific choice already active
      if (!sessionStorage.getItem("theme")) {
        const adminDefaultTheme = userRole === "admin"
          ? (globalData.admin_theme || "dark")
          : (globalData.user_theme || "light");
        setTheme(adminDefaultTheme);
      }

      if (!sessionStorage.getItem("language")) {
        setLanguage(globalData.system_language || "english");
      }

      if (!sessionStorage.getItem("font")) {
        setFont(globalData.system_font || "default");
      }

      setDateFormat(globalData.date_format || "DD/MM/YYYY");
      setIsInitialLoad(false);
    } catch (err) {
      console.error("Settings fetch failed:", err);
      setIsInitialLoad(false);
    }
  }, []); // Removed dependencies to stop the 'English reset' loop

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSetLanguage = (newLang) => {
    setLanguage(newLang);
    sessionStorage.setItem("language", newLang);
  };

  // Sync personal theme to backend
  const updateThemeOnBackend = async (newTheme) => {
    try {
      await apiClient.put("/api/settings/user_theme", { theme: newTheme });
    } catch (err) {
      console.error("Error saving theme to backend:", err);
    }
  };

  const handleSetTheme = (newTheme) => {
    setTheme(newTheme);
    sessionStorage.setItem("theme", newTheme);
    updateThemeOnBackend(newTheme);
  };

  // ✅ Reactive date formatter — always in sync with current context state
  const fmtDate = useCallback(
    (dateStr) => {
      if (!dateStr) return "";

      // When toggle is OFF → return original string as-is
      if (!dateFormatEnabled) return String(dateStr);

      // Parse date — handle YYYY-MM-DD, DD Mon YYYY (e.g. "13 Mar 2026"), Date objects
      let d;
      if (dateStr instanceof Date) {
        d = dateStr;
      } else {
        d = new Date(dateStr);
        if (isNaN(d.getTime())) {
          const months = {
            jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
            jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
          };
          const parts = String(dateStr).trim().split(/[\s\-\/]/);
          if (parts.length === 3) {
            const dv = parseInt(parts[0]);
            const mv = months[parts[1]?.toLowerCase().slice(0, 3)];
            const yv = parseInt(parts[2]);
            if (!isNaN(dv) && mv !== undefined && !isNaN(yv)) {
              d = new Date(yv, mv, dv);
            }
          }
          if (!d || isNaN(d.getTime())) return String(dateStr);
        }
      }

      const day = String(d.getDate()).padStart(2, "0");
      const monthNum = String(d.getMonth() + 1).padStart(2, "0");
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthName = monthNames[d.getMonth()];
      const year = d.getFullYear();

      switch (dateFormat) {
        case "MM/DD/YYYY": return `${monthNum}/${day}/${year}`;
        case "YYYY/MM/DD": return `${year}/${monthNum}/${day}`;
        case "YYYY-MM-DD": return `${year}-${monthNum}-${day}`;
        case "DD-MM-YYYY": return `${day}-${monthNum}-${year}`;
        case "DD MMM YYYY": return `${day} ${monthName} ${year}`;
        case "MMM DD YYYY": return `${monthName} ${day} ${year}`;
        case "MMM-DD-YYYY": return `${monthName}-${day}-${year}`;
        default: return `${day}/${monthNum}/${year}`; // DD/MM/YYYY
      }
    },
    [dateFormat, dateFormatEnabled],
  );

  const applyTheme = () => {
    const p = (location.pathname || window.location.pathname || "/").toLowerCase();
    const isLightOnlyPage =
      p === "/" ||
      p === "" ||
      p.includes("login") ||
      p.includes("register");

    const effectiveTheme = isLightOnlyPage ? "light" : (theme || "light");
    document.body.setAttribute("data-theme", effectiveTheme);
  };

  // Immediate theme application using layout effect to avoid flashes
  useEffect(() => {
    applyTheme();

    const fontValue = font === "default"
      ? "'Montserrat', sans-serif"
      : font === "arial"
        ? "Arial, sans-serif"
        : "'Roboto', sans-serif";

    document.documentElement.style.setProperty("--app-font", fontValue);
    document.body.style.fontFamily = fontValue;

    localStorage.setItem("theme", theme);
    localStorage.setItem("language", language);
    localStorage.setItem("font", font);
    localStorage.setItem("dateFormat", dateFormat);
    localStorage.setItem("dateFormatEnabled", String(dateFormatEnabled));
  }, [theme, language, font, dateFormat, dateFormatEnabled, location.pathname]);


  // Shared translations for context-level use
  const translations = {
    english: {
      dashboard: "Dashboard", organization: "Organization", approval: "Approval", leave: "Leave",
      reports: "Reports", documentation: "Documentation", attendance: "Attendance", settings: "Settings",
      logout: "Logout", totalEmployees: "Total Employees", employeeList: "Employee List", myProfile: "My Profile",
      leaveApproval: "Leave Approval", regularizationApproval: "Regularization Approval", leavePolicies: "Leave Policies",
      myLeaves: "My Leaves", myRegularization: "My Regularization", myHoliday: "My Holiday", myHolidays: "My Holidays",
      attendanceReport: "Attendance Report", leaveReport: "Leave Report", profile: "Profile", welcome: "Welcome",
      onTime: "On Time", onLeave: "On Leave", lateArrival: "Late Arrival", pendingApproval: "Pending Approval",
      pendingApprovals: "Pending Approvals", thisWeekHoliday: "This Week Holiday", scheduledMeeting: "Scheduled Meeting",
      joinMeeting: "Join the meet", punchIn: "Punch In", punchOut: "Punch Out", totalHours: "Total Hours",
      lunchBreak: "Lunch Break", coffeeBreak: "Coffee Break", endBreak: "End Break", pendingLeaveRequests: "Pending Leave Requests",
    },
    hindi: {
      dashboard: "डैशबोर्ड", organization: "संगठन", approval: "अनुमोदन", leave: "अवकाश",
      reports: "रिपोर्ट", documentation: "प्रलेखन", attendance: "उपस्थिति", settings: "सेटिंग्स",
      logout: "लॉगआउट", totalEmployees: "कुल कर्मचारी", employeeList: "कर्मचारी सूची", myProfile: "मेरी प्रोफाइल",
      leaveApproval: "अवकाश अनुमोदन", regularizationApproval: "नियमितीकरण अनुमोदन", leavePolicies: "अवकाश नीतियां",
      myLeaves: "मेरी छुट्टियां", myRegularization: "मेरा नियमितीकरण", myHoliday: "मेरी छुट्टी", myHolidays: "मेरी छुट्टियां",
      attendanceReport: "उपस्थिति रिपोर्ट", leaveReport: "अवकाश रिपोर्ट", profile: "प्रोफ़ाइल", welcome: "स्वागत है",
      onTime: "समय पर", onLeave: "छुट्टी पर", lateArrival: "देर से आगमन", pendingApproval: "लंबित अनुमोदन",
      pendingApprovals: "लंबित अनुमोदन", thisWeekHoliday: "इस सप्ताह की छुट्टी", scheduledMeeting: "अनुसूचित बैठक",
      joinMeeting: "बैठक में शामिल हों", punchIn: "पंच इन", punchOut: "पंच आउट", totalHours: "कुल घंटे",
      lunchBreak: "लंच ब्रेक", coffeeBreak: "कॉफी ब्रेक", endBreak: "ब्रेक समाप्त करें", pendingLeaveRequests: "लंबित अवकाश अनुरोध",
    },
    tamil: {
      dashboard: "டாஷ்போர்டு", organization: "அமைப்பு", approval: "அங்கீகாரம்", leave: "விடுப்பு",
      reports: "அறிக்கைகள்", documentation: "ஆவணங்கள்", attendance: "வருகை", settings: "அமைப்புகள்",
      logout: "வெளியேறு", totalEmployees: "மொத்த ஊழியர்கள்", employeeList: "பணியாளர் பட்டியல்", myProfile: "எனது சுயவிவரம்",
      leaveApproval: "விடுப்பு அங்கீகாரம்", regularizationApproval: "ஒழுங்குமுறை அங்கீகாரம்", leavePolicies: "விடுப்பு கொள்கைகள்",
      myLeaves: "எனது விடுப்புகள்", myRegularization: "எனது ஒழுங்குமுறை", myHoliday: "எனது விடுமுறை", myHolidays: "எனது விடுமுறைகள்",
      attendanceReport: "வருகை அறிக்கை", leaveReport: "விடுப்பு அறிக்கை", profile: "சுயவிவரம்", welcome: "வரவேற்கிறோம்",
      onTime: "நேரத்திற்கு", onLeave: "விடுப்பில்", lateArrival: "தாமதமாக வருகை", pendingApproval: "நிலுவையில் உள்ள அங்கீகாரம்",
      pendingApprovals: "நிலுவையில் உள்ள அங்கீகாரங்கள்", thisWeekHoliday: "இந்த வார விடுமுறை", scheduledMeeting: "திட்டமிடப்பட்ட சந்திப்பு",
      joinMeeting: "சந்திப்பில் இணையுங்கள்", punchIn: "பன்ச் இன்", punchOut: "பன்ச் அவுட்", totalHours: "மொத்த நேரம்",
      lunchBreak: "மதிய உணவு இடைவேளை", coffeeBreak: "காபி இடைவேளை", endBreak: "இடைவேளையை முடி", pendingLeaveRequests: "நிலுவையில் உள்ள விடுப்பு விண்ணப்பங்கள்",
    },
  };

  const t = useCallback(
    (key) => {
      return translations[language]?.[key] || translations.english?.[key] || key;
    },
    [language],
  );

  return (
    <SettingsContext.Provider
      value={{
        theme, setTheme: handleSetTheme,
        language, setLanguage: handleSetLanguage,
        font, setFont,
        dateFormat, setDateFormat,
        dateFormatEnabled, setDateFormatEnabled,
        fmtDate,
        t,
        refreshSettings: fetchSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
