import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css";

import { SettingsProvider } from "./context/SettingsContext";
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
import Dashboard from "./features/dashboard/Dashboard";
import AdminLetterGeneration from "./Components/Admin-Section/AdminLetterGeneration";
import AdminAttendance from "./features/attendance/AdminAttendance";
import EmployeesList from "./features/employees/Employees";
import EmployeesMyTeam from "./features/employees/EmployeesMyTeam";
import Payroll from "./features/payroll/PayrollDashboard";
import AdminBroadcast from "./features/notifications/AdminBroadCast";
import AdminProfile from "./features/employees/AdminProfile";
import AddLeave from "./features/leave/AddLeaveType";
import LeavePolicies from "./features/leave/LeavePolicies";
import PerformancePage from "./features/performance/Performance";
import AdminSidebar from "./Components/Admin-Section/AdminSidebar";
import Myholiday from "./features/leave/AdminMyHoliday";
import MyLeave from "./features/leave/AdminMyLeave";
import Myregularization from "./features/regularization/AdminMyRegularization";
import LeaveApproval from "./features/leave/LeaveApproval";
import MyTeamLeaveApproval from "./features/leave/MyTeamLeaveApproval";
import RegularizationApproval from "./features/regularization/RegularizationApproval";
import RAMyTean from "./features/regularization/RAMyTeam";
import WhoIsOnLeave from "./features/attendance/WhoIsOnLeave";
import AdminSettings from "./features/settings/AdminSettings";
import AttendanceReport from "./features/reports/AttendanceReport";
import LeaveReport from "./features/reports/LeaveReport";

// Employee Components
import EmployeeDashboard from "./features/dashboard/EmployeeDashboard";
import ApplyLeave from "./features/leave/ApplyLeave";
import Attendance from "./features/attendance/EmployeeAttendance";
import ProfileBanner from "./features/employees/EmployeeProfile";
import EmployeePerformanceTracker from "./features/performance/EmployeePerformanceTracker";
import EmployeePayroll from "./features/payroll/EmployeePayroll";
import EmployeeDocuments from "./features/documents/EmployeeDocuments";
import Settings from "./features/settings/Settings";
import Myleave from "./features/leave/EmployeeMyLeave";
import MyRegularization from "./features/regularization/EmployeeMyRegularization";
import MyHoliday from "./features/leave/EmployeeMyHoliday";

// Employee Report Components
import EmployeeAttendanceReport from "./features/reports/EmployeeAttendanceReport";
import EmployeeLeaveReport from "./features/reports/EmployeeLeaveReport";

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
