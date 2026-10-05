import { Outlet, useLocation } from "react-router-dom";
import { SocialSidebar } from "@/components/site/SocialSidebar";

// Shell for the public website. The floating social bar is hidden on /admin/*
// (which includes the admin login page).
export default function PublicLayout() {
  const { pathname } = useLocation();

  return (
    <>
      <Outlet />
      {!pathname.startsWith("/admin") && <SocialSidebar />}
    </>
  );
}
