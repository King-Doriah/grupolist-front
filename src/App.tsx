import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import TokenPage from "./pages/TokenPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

function AppRoutes() {
  const { token: authToken, level } = useAuth();
  const location = useLocation();

  // Always accessible: reset-password
  if (location.pathname.startsWith("/reset-password/")) {
    return (
      <Routes>
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Authenticated — separation by LEVEL:
  // level 1 (Super Admin) → /admin
  // level 2 (Admin)       → /admin
  // level 3 (Owner/User)  → /dashboard
  if (authToken) {
    const isAdmin = level === 1 || level === 2;

    if (isAdmin) {
      return (
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      );
    }

    // level 3 (owner) or unknown level
    return (
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    );
  }

  // Unauthenticated
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/search/:token" element={<TokenPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
