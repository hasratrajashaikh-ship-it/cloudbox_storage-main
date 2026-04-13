import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./services/auth";
import DrivePage from "./pages/DrivePage";
import HomePage from "./pages/HomePage";
import RecentPage from "./pages/RecentPage";
import TrashPage from "./pages/TrashPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/drive"
          element={
            <ProtectedRoute>
              <AppLayout>
                <DrivePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/drive/:folderId"
          element={
            <ProtectedRoute>
              <AppLayout>
                <DrivePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/recent"
          element={
            <ProtectedRoute>
              <AppLayout>
                <RecentPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trash"
          element={
            <ProtectedRoute>
              <AppLayout>
                <TrashPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
