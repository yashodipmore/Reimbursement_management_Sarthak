import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import OAuthCallback from './pages/auth/OAuthCallback';
import EmployeeDashboard from './pages/employee/Dashboard';
import SubmitExpense from './pages/employee/SubmitExpense';
import MyExpenses from './pages/employee/MyExpenses';
import ManagerDashboard from './pages/manager/Dashboard';
import PendingApprovals from './pages/manager/PendingApprovals';
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import ApprovalRules from './pages/admin/ApprovalRules';

// Layout
import ProtectedRoute from './components/Layout/ProtectedRoute';
import AppShell from './components/Layout/AppShell';
import roleHomePath from './utils/roleHomePath';

function DashboardRedirect() {
  const { user } = useAuthStore();
  return <Navigate to={roleHomePath(user?.role)} replace />;
}

function App() {
  return (
    <Router>
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fffdf8',
            color: '#1f2937',
            border: '1px solid #e5dccb',
            borderRadius: '12px',
            fontSize: '14px',
            boxShadow: '0 10px 24px rgba(138, 92, 52, 0.12)',
          },
          success: {
            iconTheme: {
              primary: '#1f8a74',
              secondary: '#fffdf8',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc2626',
              secondary: '#fffdf8',
            },
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardRedirect />} />

          <Route
            path="employee/dashboard"
            element={
              <ProtectedRoute roles={['employee']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="employee/submit-expense"
            element={
              <ProtectedRoute roles={['employee']}>
                <SubmitExpense />
              </ProtectedRoute>
            }
          />
          <Route
            path="employee/my-expenses"
            element={
              <ProtectedRoute roles={['employee']}>
                <MyExpenses />
              </ProtectedRoute>
            }
          />

          <Route
            path="manager/dashboard"
            element={
              <ProtectedRoute roles={['manager']}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="manager/pending-approvals"
            element={
              <ProtectedRoute roles={['manager', 'admin']}>
                <PendingApprovals />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/dashboard"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/users"
            element={
              <ProtectedRoute roles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/approval-rules"
            element={
              <ProtectedRoute roles={['admin']}>
                <ApprovalRules />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
