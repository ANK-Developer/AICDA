import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { Handshake, Users } from "lucide-react";

export const Route = createFileRoute("/admin/directory")({ component: DirectoryLayout });

const TABS = [
  {
    label: "Members",
    icon: Users,
    to: "/admin/directory",
    isActive: (pathname) =>
      pathname.startsWith("/admin/directory") && !pathname.startsWith("/admin/directory/partener"),
  },
  {
    label: "Partners",
    icon: Handshake,
    to: "/admin/directory/partener",
    isActive: (pathname) => pathname.startsWith("/admin/directory/partener"),
  },
];

// Only the two list pages get the tab bar — create/details pages already
// have their own "Back" link and showing the tabs there is just noise.
const LIST_PATHS = new Set(["/admin/directory", "/admin/directory/partener"]);

function DirectoryLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const showTabs = LIST_PATHS.has(pathname);

  return (
    <section className="space-y-2">
      {showTabs && (
        <div
          className="flex gap-2 rounded-[3px] border border-slate-300 bg-white p-1.5"
          role="tablist"
          aria-label="Directory sections"
        >
          {TABS.map((tab) => {
            const active = tab.isActive(pathname);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                role="tab"
                aria-selected={active}
                className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-[3px] text-[14px] font-semibold transition-colors sm:flex-none sm:px-6 ${
                  active
                    ? "bg-red-700 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" /> {tab.label}
              </Link>
            );
          })}
        </div>
      )}

      <Outlet />
    </section>
  );
}
