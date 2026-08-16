import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css";

import { SettingsProvider } from "./Components/Employee-Section/Settings-/SettingsContext";

// Admin Components
import AdminLogin from "./Components/Admin-Section/AdminLogin";
import AdminRegister from "./Components/Admin-Section/AdminRegister";
import Dashboard from "./Components/Admin-Section/Dashboard/Dashboard";
import AdminLetterGeneration from "./Components/Admin-Section/AdminLetterGeneration";
import AdminAttendance from "./Components/Admin-Section/Attendance/Attendance";
import EmployeesList from "./Components/Admin-Section/Organization/Employees";
import EmployeesMyTeam from "./Components/Admin-Section/Organization/EmployeesMyTeam";
import Payroll from "./Components/Admin-Section/PayrollDashboard";
import AdminBroadcast from "./Components/Admin-Section/AdminBroadCast";
import AdminProfile from "./Components/Admin-Section/Organization/AdminProfile";
import AddLeave from "./Components/Admin-Section/AddLeaveType";
import LeavePolicies from "./Components/Admin-Section/Approval/LeavePolicies";
import PerformancePage from "./Components/Admin-Section/Performance";
import AdminSidebar from "./Components/Admin-Section/AdminSidebar";
import Myholiday from "./Components/Admin-Section/leave/MyHoliday";
import MyLeave from "./Components/Admin-Section/leave/MyLeave";
import Myregularization from "./Components/Admin-Section/leave/MyRegularization";
import LeaveApproval from "./Components/Admin-Section/Approval/LeaveApproval";
import MyTeamLeaveApproval from "./Components/Admin-Section/Approval/MyTeamLeaveApproval";
import RegularizationApproval from "./Components/Admin-Section/Approval/RegularizationApproval";
import RAMyTean from "./Components/Admin-Section/Approval/RAMyTeam";
import WhoIsOnLeave from "./Components/Admin-Section/Attendance/WhoIsOnLeave";
import AdminSettings from "./Components/Admin-Section/settings-/admin-settings";
import AttendanceReport from "./Components/Admin-Section/Reports-/AttendanceReport";
import LeaveReport from "./Components/Admin-Section/Reports-/LeaveReport";

// Employee Components
import EmployeeLogin from "./Components/Employee-Section/EmployeeLogin";
import EmployeeDashboard from "./Components/Employee-Section/Dashboard/EmployeeDashboard";
import ApplyLeave from "./Components/Employee-Section/leave/ApplyLeave";
import Attendance from "./Components/Employee-Section/Attendance/Attendance";
import ProfileBanner from "./Components/Employee-Section/Profile/EmployeeProfile";
import EmployeeRegister from "./Components/Employee-Section/EmployeeRegister";
import EmployeePerformanceTracker from "./Components/Employee-Section/EmployeePerformanceTracker";
import EmployeePayroll from "./Components/Employee-Section/EmployeePayroll";
import EmployeeDocuments from "./Components/Employee-Section/EmployeeDocuments";
import Settings from "./Components/Employee-Section/Settings-/Settings";
import Myleave from "./Components/Employee-Section/leave/MyLeave";
import MyRegularization from "./Components/Employee-Section/leave/MyRegularization";
import MyHoliday from "./Components/Employee-Section/leave/MyHoliday";

// Employee Report Components
import EmployeeAttendanceReport from "./Components/Employee-Section/Reports/EmployeeAttendanceReport";
import EmployeeLeaveReport from "./Components/Employee-Section/Reports/EmployeeLeaveReport";

const App = () => {
  return (
    <Router>
      <SettingsProvider>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin-sidebar" element={<AdminSidebar />} />
          <Route path="/" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<Dashboard />} />
          <Route path="/attendance" element={<AdminAttendance />} />
          <Route path="/employees-list" element={<EmployeesList />} />
          <Route path="/el-myteam" element={<EmployeesMyTeam />} />
          <Route path="/admin-broadcast" element={<AdminBroadcast />} />
          <Route path="/leave-policies" element={<LeavePolicies />} />
          <Route path="/addleavetype" element={<AddLeave />} />
          <Route path="/register-admin" element={<AdminRegister />} />
          <Route path="/performance" element={<PerformancePage />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/admin-profile" element={<AdminProfile />} />
          <Route
            path="/adminlettergeneration"
            element={<AdminLetterGeneration />}
          />
          <Route path="/admin-my-holidays" element={<Myholiday />} />
          <Route path="/admin-my-leave" element={<MyLeave />} />
          <Route
            path="/admin-my-regularization"
            element={<Myregularization />}
          />
          <Route path="/leave-approval" element={<LeaveApproval />} />
          <Route
            path="/myTeam-LeaveApproval"
            element={<MyTeamLeaveApproval />}
          />
          <Route
            path="/regularization-approval"
            element={<RegularizationApproval />}
          />
          <Route path="/ra-myteam" element={<RAMyTean />} />
          <Route path="/who-is-on-Leave" element={<WhoIsOnLeave />} />
          <Route path="/admin-settings" element={<AdminSettings />} />
          <Route
            path="/admin-attendance-report"
            element={<AttendanceReport />}
          />
          <Route path="/leave-report" element={<LeaveReport />} />

          {/* Employee Routes */}
          <Route path="/employee-login" element={<EmployeeLogin />} />
          <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
          <Route path="/apply-leave" element={<ApplyLeave />} />
          <Route path="/employee-attendance" element={<Attendance />} />
          <Route path="/profile" element={<ProfileBanner />} />
          <Route path="/register-employee" element={<EmployeeRegister />} />
          <Route
            path="/performance-tracker"
            element={<EmployeePerformanceTracker />}
          />
          <Route path="/employee-payroll" element={<EmployeePayroll />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/employeedocs" element={<EmployeeDocuments />} />
          <Route path="/my-leave" element={<Myleave />} />
          <Route path="/my-regularization" element={<MyRegularization />} />
          <Route path="/my-holidays" element={<MyHoliday />} />

          {/* Employee Report Routes */}
          <Route
            path="/employee-attendance-report"
            element={<EmployeeAttendanceReport />}
          />
          <Route
            path="/employee-leave-report"
            element={<EmployeeLeaveReport />}
          />
        </Routes>
      </SettingsProvider>
    </Router>
  );
};

export default App;
