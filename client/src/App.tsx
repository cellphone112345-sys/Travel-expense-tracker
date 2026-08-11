import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AppShell } from "./components/layout/AppShell";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { TripsPage } from "./pages/TripsPage";
import { TripDashboardPage } from "./pages/TripDashboardPage";
import { ExpensesPage } from "./pages/ExpensesPage";
import { CategoriesSettingsPage } from "./pages/CategoriesSettingsPage";
import { TripComparePage } from "./pages/TripComparePage";
import { SettingsPage } from "./pages/SettingsPage";

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/trips" element={<Protected><TripsPage /></Protected>} />
      <Route path="/dashboard" element={<Protected><TripDashboardPage /></Protected>} />
      <Route path="/expenses" element={<Protected><ExpensesPage /></Protected>} />
      <Route path="/categories" element={<Protected><CategoriesSettingsPage /></Protected>} />
      <Route path="/compare" element={<Protected><TripComparePage /></Protected>} />
      <Route path="/settings" element={<Protected><SettingsPage /></Protected>} />

      <Route path="/" element={<Navigate to="/trips" replace />} />
      <Route path="*" element={<Navigate to="/trips" replace />} />
    </Routes>
  );
}
