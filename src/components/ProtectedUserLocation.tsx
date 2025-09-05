import { useEffect, useRef, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

export const ProtectedUserLocation = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { user, loading } = useAuth();
  const hasToasted = useRef(false);

  useEffect(() => {
    if (!user?.address && !hasToasted.current) {
      toast.error("Please enter your location first");
      hasToasted.current = true;
    }
  }, [user]);

  if (loading) {
    return <>Loading...</>;
  }

  if (!user?.address) {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
};
