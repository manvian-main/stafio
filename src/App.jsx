import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css";

import { SettingsProvider } from "./context/SettingsContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import { ROLES } from "./constants/roles";
import PageLoader from "./components/ui/PageLoader";

const ADMIN_ROLES = [ROLES.ADMIN, ROLES.MANAGER];
const AdminRoute = ({ children }) => (
  <RoleRoute allow={ADMIN_ROLES} loginPath="/" redirectTo="/employee-dashboard">
    {children}
  </RoleRoute>
);
const EmployeeRoute = ({ children }) => (
  <ProtectedRoute loginPath="/employee-login">{children}</ProtectedRoute>
);

// Auth — not lazy: these are the very first screens almost every visitor
// hits, so there is no benefit to a second round-trip for them.
import AdminLogin from "./features/auth/AdminLogin";
import AdminRegister from "./features/auth/AdminRegister";
import EmployeeLogin from "./features/auth/EmployeeLogin";
import EmployeeRegister from "./features/auth/EmployeeRegister";

// Everything else is route-based code-split: each page's JS is only
// downloaded when the user actually navigates to it, keeping the initial
// bundle small (previously a single ~1.3MB chunk).

// Admin Components
const Dashboard = lazy(() => import("./features/dashboard/Dashboard"));
const AdminLetterGeneration = lazy(() => import("./features/documents/AdminLetterGeneration"));
const AdminAttendance = lazy(() => import("./features/attendance/AdminAttendance"));
const EmployeesList = lazy(() => import("./features/employees/Employees"));
const EmployeesMyTeam = lazy(() => import("./features/employees/EmployeesMyTeam"));
const Payroll = lazy(() => import("./features/payroll/PayrollDashboard"));
const AdminBroadcast = lazy(() => import("./features/notifications/AdminBroadCast"));
const AdminProfile = lazy(() => import("./features/employees/AdminProfile"));
const AddLeave = lazy(() => import("./features/leave/AddLeaveType"));
const LeavePolicies = lazy(() => import("./features/leave/LeavePolicies"));
const PerformancePage = lazy(() => import("./features/performance/Performance"));
const AdminSidebar = lazy(() => import("./components/layout/AdminSidebar"));
const Myholiday = lazy(() => import("./features/leave/AdminMyHoliday"));
const MyLeave = lazy(() => import("./features/leave/AdminMyLeave"));
const Myregularization = lazy(() => import("./features/regularization/AdminMyRegularization"));
const LeaveApproval = lazy(() => import("./features/leave/LeaveApproval"));
const MyTeamLeaveApproval = lazy(() => import("./features/leave/MyTeamLeaveApproval"));
const RegularizationApproval = lazy(() => import("./features/regularization/RegularizationApproval"));
const RAMyTean = lazy(() => import("./features/regularization/RAMyTeam"));
const WhoIsOnLeave = lazy(() => import("./features/attendance/WhoIsOnLeave"));
const AdminSettings = lazy(() => import("./features/settings/AdminSettings"));
const AttendanceReport = lazy(() => import("./features/reports/AttendanceReport"));
const LeaveReport = lazy(() => import("./features/reports/LeaveReport"));

// Employee Components
const EmployeeDashboard = lazy(() => import("./features/dashboard/EmployeeDashboard"));
const ApplyLeave = lazy(() => import("./features/leave/ApplyLeave"));
const Attendance = lazy(() => import("./features/attendance/EmployeeAttendance"));
const ProfileBanner = lazy(() => import("./features/employees/EmployeeProfile"));
const EmployeePerformanceTracker = lazy(() => import("./features/performance/EmployeePerformanceTracker"));
const EmployeePayroll = lazy(() => import("./features/payroll/EmployeePayroll"));
const EmployeeDocuments = lazy(() => import("./features/documents/EmployeeDocuments"));
const Settings = lazy(() => import("./features/settings/Settings"));
const Myleave = lazy(() => import("./features/leave/EmployeeMyLeave"));
const MyRegularization = lazy(() => import("./features/regularization/EmployeeMyRegularization"));
const MyHoliday = lazy(() => import("./features/leave/EmployeeMyHoliday"));

// Employee Report Components
const EmployeeAttendanceReport = lazy(() => import("./features/reports/EmployeeAttendanceReport"));
const EmployeeLeaveReport = lazy(() => import("./features/reports/EmployeeLeaveReport"));

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
          <Suspense fallback={<PageLoader />}>
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
          </Suspense>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
