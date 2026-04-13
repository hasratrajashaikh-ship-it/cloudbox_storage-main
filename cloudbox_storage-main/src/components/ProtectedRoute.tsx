import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../services/auth";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { loading, user } = useAuth();

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-blue-50 text-blue-700">Loading your drive...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
