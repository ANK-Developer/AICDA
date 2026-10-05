import { Navigate, Outlet, useNavigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useGetCurrentUserQuery, useLogoutMutation } from "@/features/auth/authApi";

// Guards the admin area: the session is verified with GET /auth/me (same as before),
// failures redirect to /admin/login and only SUPER_ADMIN accounts get through.
export default function ProtectedRoutes() {
  const navigate = useNavigate();
  const { data: user, isLoading, isError } = useGetCurrentUserQuery();
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    await logout()
      .unwrap()
      .catch(() => undefined);
    navigate("/admin/login", { replace: true });
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Checking your session…
      </main>
    );
  }

  if (isError) return <Navigate to="/admin/login" replace />;

  const role = String(user?.role || user?.userRole || "").toUpperCase();
  if (role && role !== "SUPER_ADMIN") {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <h1 className="text-lg font-bold text-red-800">Super Admin access required</h1>
          <p className="mt-2 text-sm text-red-700">
            This account cannot manage administrator accounts.
          </p>
          <button
            onClick={handleLogout}
            className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Sign out
          </button>
        </div>
      </main>
    );
  }

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <Outlet />
    </DashboardLayout>
  );
}
