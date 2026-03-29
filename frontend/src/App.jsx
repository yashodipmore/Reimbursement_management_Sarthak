import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import OAuthCallback from './pages/auth/OAuthCallback';

// Layout
import ProtectedRoute from './components/Layout/ProtectedRoute';

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

        {/* Protected Routes - placeholders for other team members */}
        <Route
          path="/app/dashboard"
          element={
            <ProtectedRoute>
              <div className="min-h-screen flex items-center justify-center gradient-bg">
                <div className="glass-card p-8 text-center">
                  <h1 className="text-2xl font-bold gradient-text mb-2">Dashboard</h1>
                  <p className="text-slate-600">Coming soon - Komal Branch 2</p>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
