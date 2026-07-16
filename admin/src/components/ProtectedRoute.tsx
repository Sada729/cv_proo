import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";

export function FullscreenLoader() {
  return (
    <div className="min-h-screen grid place-items-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

export default function ProtectedRoute() {
  const { admin, loading } = useAdminAuth();
  if (loading) return <FullscreenLoader />;
  if (!admin) return <Navigate to="/login" replace />;
  return <Outlet />;
}
