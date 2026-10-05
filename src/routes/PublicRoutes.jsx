import PublicLayout from "@/layouts/PublicLayout";

// Pages that do not require authentication (website pages, public profiles, admin login).
export default function PublicRoutes() {
  return <PublicLayout />;
}
