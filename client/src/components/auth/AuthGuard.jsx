import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";
import { useEffect } from "react";

export const AuthGuard = () => {
  const { token, user } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!token || !user) {
      toast.error("Please login to access this page.");
    }
  }, [token, user]);

  if (!token || !user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export const AdminGuard = () => {
  const { token, user } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (token && user && user.role !== "ADMIN") {
      toast.error("Access denied. Admin privileges required.");
    }
  }, [token, user]);

  if (!token || !user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
