import { useEffect, useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useBirthProfiles } from "../contexts/BirthProfilesContext";
import toast from "react-hot-toast";

export const ProtectedCharts = () => {
  const { mainProfile } = useBirthProfiles();
  const hasToasted = useRef(false);

  useEffect(() => {
    if (!mainProfile && !hasToasted.current) {
      toast.error("Please create your birth profile first");
      hasToasted.current = true;
    }
  }, [mainProfile]);

  if (!mainProfile) return <Navigate to="/profile" replace />;

  return <Outlet />;
};
