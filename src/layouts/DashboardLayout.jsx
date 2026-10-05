import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  AlertTriangle,
  BookUser,
  CalendarDays,
  ChevronRight,
  GalleryHorizontal,
  Image,
  Inbox,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareWarning,
  RotateCcw,
  RotateCw,
  ShieldCheck,
  UserCog,
  X,
} from "lucide-react";
import aicdaLogo from "@/assets/Aicda logo.png";
import { ChangePasswordModal } from "@/components/admin/ChangePasswordModal";

// Order here is the order the sidebar renders in — Super Admins stays last,
// after Enquiries, since it's the most sensitive item on the menu.
const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/admin" },
  { label: "Banner Master", icon: GalleryHorizontal, to: "/admin/banners" },
  { label: "Manage Directory", icon: BookUser, to: "/admin/directory" },
  { label: "Important Dates", icon: CalendarDays, to: "/admin/important-dates" },
  { label: "Reset Directory", icon: RotateCcw, to: "/admin/reset-directory" },
  // { label: "Reset Management", icon: RotateCw, to: "/admin/reset-management" },
  { label: "Media Library", icon: Image, to: "/admin/image" },
  // { label: "Expired Members", icon: AlertTriangle, to: "/admin/expired-members" },
  // { label: "Our Staff", icon: UserCog, to: "/admin/our-staff" },
  // { label: "Complaint", icon: MessageSquareWarning, to: "/admin/complaint" },
  { label: "Enquiries", icon: Inbox, to: "/admin/enquiries" },
  { label: "Super Admins", icon: ShieldCheck, to: "/admin/super-admins" },
];

export default function DashboardLayout({ user, onLogout: handleLogout, children }) {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const isNavItemActive = (item) => {
    if (item.to === "/admin") return pathname === "/admin";
    return pathname.startsWith(item.to);
  };
  const currentItem = navigation.find(isNavItemActive);

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-slate-50 text-slate-900">
      {" "}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-62 flex-col bg-slate-950 text-slate-100 transition-transform lg:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-25 items-center gap-3 border-b border-white/10 px-6">
          <img
            src={aicdaLogo}
            alt="AICDA"
            className="h-11 w-11 rounded-full bg-white object-contain p-1"
          />
          <div>
            <p className="text-sm font-bold tracking-wide">AICDA Admin</p>
            <p className="text-xs text-slate-400">Management portal</p>
          </div>
          <button
            className="ml-auto p-1 lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav
          className="min-h-0 flex-1 space-y-1 overflow-y-auto scrollbar-thin-dark p-4"
          aria-label="Admin navigation"
        >
          {navigation.map((item) => {
            const isActive = isNavItemActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors duration-150 ${isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {isActive && <ChevronRight className="h-4 w-4 shrink-0" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          {/* <a
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> View website
          </a> */}
          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      {menuOpen && (
        <button
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        />
      )}
      <main className="min-h-screen lg:pl-62">
        <header className="sticky top-0 z-20 flex min-h-16 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-slate-200 bg-white/90 px-3 py-2 backdrop-blur sm:h-20 sm:px-8 sm:py-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs text-slate-500 sm:text-sm">Admin panel</p>
              <h1 className="text-base font-bold sm:text-lg">
                {currentItem?.label || "Dashboard"}
              </h1>
            </div>
          </div>
          <div className="relative ml-auto flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:px-3"
            >
              <KeyRound className="h-4 w-4" />{" "}
              <span className="hidden sm:inline">Change password</span>
            </button>
            <button
              onClick={() => setProfileMenuOpen((open) => !open)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
              aria-haspopup="true"
              aria-expanded={profileMenuOpen}
            >
              AD
            </button>
            {profileMenuOpen && (
              <>
                <button
                  className="fixed inset-0 z-30 cursor-default"
                  onClick={() => setProfileMenuOpen(false)}
                  aria-label="Close profile menu"
                />
                <div className="absolute right-0 top-11 z-40 w-56 rounded-lg border border-slate-200 bg-white py-2 shadow-lg">
                  <p className="truncate px-4 py-1.5 text-xs text-slate-500">
                    {user?.email || "Super Admin"}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <div className="mx-auto max-w-full p-3 sm:p-6">{children}</div>
      </main>
      {showPasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowPasswordModal(false)}
          defaultEmail={user?.email || ""}
        />
      )}
    </div>
  );
}
