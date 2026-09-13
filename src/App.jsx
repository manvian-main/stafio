import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css";

import { SettingsProvider } from "./Components/Employee-Section/Settings-/SettingsContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import { ROLES } from "./constants/roles";

const ADMIN_ROLES = [ROLES.ADMIN, ROLES.MANAGER];
const AdminRoute = ({ children }) => (
  <RoleRoute allow={ADMIN_ROLES} loginPath="/" redirectTo="/employee-dashboard">
    {children}
  </RoleRoute>
);
const EmployeeRoute = ({ children }) => (
  <ProtectedRoute loginPath="/employee-login">{children}</ProtectedRoute>
);

// Auth
import AdminLogin from "./features/auth/AdminLogin";
import AdminRegister from "./features/auth/AdminRegister";
import EmployeeLogin from "./features/auth/EmployeeLogin";
import EmployeeRegister from "./features/auth/EmployeeRegister";

// Admin Components
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
import EmployeeDashboard from "./Components/Employee-Section/Dashboard/EmployeeDashboard";
import ApplyLeave from "./Components/Employee-Section/leave/ApplyLeave";
import Attendance from "./Components/Employee-Section/Attendance/Attendance";
import ProfileBanner from "./Components/Employee-Section/Profile/EmployeeProfile";
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
      <AuthProvider>
        <SettingsProvider>
          <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
          <Routes>
            {/* Public */}
            <Route path="/" element={<AdminLogin />} />
            <Route path="/register-admin" element={<AdminRegister />} />
            <Route path="/employee-login" element={<EmployeeLogin />} />
            <Route path="/register-employee" element={<EmployeeRegister />} />

            {/* Admin Routes (admin or manager) */}
            <Route path="/admin-sidebar" element={<AdminRoute><AdminSidebar /></AdminRoute>} />
            <Route path="/admin-dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
            <Route path="/attendance" element={<AdminRoute><AdminAttendance /></AdminRoute>} />
            <Route path="/employees-list" element={<AdminRoute><EmployeesList /></AdminRoute>} />
            <Route path="/el-myteam" element={<AdminRoute><EmployeesMyTeam /></AdminRoute>} />
            <Route path="/admin-broadcast" element={<AdminRoute><AdminBroadcast /></AdminRoute>} />
            <Route path="/leave-policies" element={<AdminRoute><LeavePolicies /></AdminRoute>} />
            <Route path="/addleavetype" element={<AdminRoute><AddLeave /></AdminRoute>} />
            <Route path="/performance" element={<AdminRoute><PerformancePage /></AdminRoute>} />
            <Route path="/payroll" element={<AdminRoute><Payroll /></AdminRoute>} />
            <Route path="/admin-profile" element={<AdminRoute><AdminProfile /></AdminRoute>} />
            <Route
              path="/adminlettergeneration"
              element={<AdminRoute><AdminLetterGeneration /></AdminRoute>}
            />
            <Route path="/admin-my-holidays" element={<AdminRoute><Myholiday /></AdminRoute>} />
            <Route path="/admin-my-leave" element={<AdminRoute><MyLeave /></AdminRoute>} />
            <Route
              path="/admin-my-regularization"
              element={<AdminRoute><Myregularization /></AdminRoute>}
            />
            <Route path="/leave-approval" element={<AdminRoute><LeaveApproval /></AdminRoute>} />
            <Route
              path="/myTeam-LeaveApproval"
              element={<AdminRoute><MyTeamLeaveApproval /></AdminRoute>}
            />
            <Route
              path="/regularization-approval"
              element={<AdminRoute><RegularizationApproval /></AdminRoute>}
            />
            <Route path="/ra-myteam" element={<AdminRoute><RAMyTean /></AdminRoute>} />
            <Route path="/who-is-on-Leave" element={<AdminRoute><WhoIsOnLeave /></AdminRoute>} />
            <Route path="/admin-settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
            <Route
              path="/admin-attendance-report"
              element={<AdminRoute><AttendanceReport /></AdminRoute>}
            />
            <Route path="/leave-report" element={<AdminRoute><LeaveReport /></AdminRoute>} />

            {/* Employee Routes (any authenticated user) */}
            <Route path="/employee-dashboard" element={<EmployeeRoute><EmployeeDashboard /></EmployeeRoute>} />
            <Route path="/apply-leave" element={<EmployeeRoute><ApplyLeave /></EmployeeRoute>} />
            <Route path="/employee-attendance" element={<EmployeeRoute><Attendance /></EmployeeRoute>} />
            <Route path="/profile" element={<EmployeeRoute><ProfileBanner /></EmployeeRoute>} />
            <Route
              path="/performance-tracker"
              element={<EmployeeRoute><EmployeePerformanceTracker /></EmployeeRoute>}
            />
            <Route path="/employee-payroll" element={<EmployeeRoute><EmployeePayroll /></EmployeeRoute>} />
            <Route path="/settings" element={<EmployeeRoute><Settings /></EmployeeRoute>} />
            <Route path="/employeedocs" element={<EmployeeRoute><EmployeeDocuments /></EmployeeRoute>} />
            <Route path="/my-leave" element={<EmployeeRoute><Myleave /></EmployeeRoute>} />
            <Route path="/my-regularization" element={<EmployeeRoute><MyRegularization /></EmployeeRoute>} />
            <Route path="/my-holidays" element={<EmployeeRoute><MyHoliday /></EmployeeRoute>} />

            {/* Employee Report Routes */}
            <Route
              path="/employee-attendance-report"
              element={<EmployeeRoute><EmployeeAttendanceReport /></EmployeeRoute>}
            />
            <Route
              path="/employee-leave-report"
              element={<EmployeeRoute><EmployeeLeaveReport /></EmployeeRoute>}
            />
          </Routes>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
