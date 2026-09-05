import { useEffect, useState } from "react";

import { Link } from "@tanstack/react-router";

import {
  AlertCircle,
  ArrowUpRight,
  Cake,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileImage,
  HelpCircle,
  Plus,
  UserCheck,
  UserCog,
  UserX,
  Users,
  XCircle,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

import { getMembers } from "@/lib/member-api";
import { getEnquiries } from "@/lib/enquiry-api";
import { getImportantDates, getUpcomingBirthdays } from "@/lib/important-date-api";

import { isExpired, isProfileIncomplete, isWithinDays } from "./directory-shared";

const UPCOMING_LIMIT = 5;
const LARGE_BATCH = 1000;
const DASHBOARD_EXPIRING_DAYS = 10;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function requestTypeLabel(value) {
  return value === "MEMBERSHIP" || !value ? "Membership" : "General Enquiry";
}

function daysLeftLabel(daysLeft = 0) {
  if (daysLeft === 0) return "Today";
  if (daysLeft === 1) return "Tomorrow";
  return `In ${daysLeft} days`;
}

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* -------------------------------------------------------------------------- */
/* Card Accents                                                               */
/* -------------------------------------------------------------------------- */

const CARD_ACCENTS = {
  sky: {
    bg: "bg-sky-50",
    text: "text-sky-600",
    border: "hover:border-sky-300",
    iconBg: "bg-sky-100",
  },

  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "hover:border-emerald-300",
    iconBg: "bg-emerald-100",
  },

  slate: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "hover:border-slate-300",
    iconBg: "bg-slate-200",
  },

  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "hover:border-amber-300",
    iconBg: "bg-amber-100",
  },

  red: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "hover:border-red-300",
    iconBg: "bg-red-100",
  },

  violet: {
    bg: "bg-violet-50",
    text: "text-violet-600",
    border: "hover:border-violet-300",
    iconBg: "bg-violet-100",
  },
};

/* -------------------------------------------------------------------------- */
/* Quick Actions                                                              */
/* -------------------------------------------------------------------------- */

const QUICK_ACTIONS = [
  {
    label: "Add a Member",
    description: "Create a new member profile",
    to: "/admin/directory/create",
    icon: Plus,
    accent: "sky",
  },
  {
    label: "Upload Gallery",
    description: "Add new images to gallery",
    to: "/admin/image",
    icon: FileImage,
    accent: "violet",
  },
  {
    label: "View Enquiries",
    description: "Check latest enquiries",
    to: "/admin/enquiries",
    icon: HelpCircle,
    accent: "emerald",
  },
];

/* -------------------------------------------------------------------------- */
/* Stat Card                                                                  */
/* -------------------------------------------------------------------------- */

function DashboardStatCard({ icon: Icon, label, value, accent, to, search, description }) {
  const tone = CARD_ACCENTS[accent];

  return (
    <Link
      to={to}
      search={search}
      className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-5 ${tone.border}`}
    >
      <div className={`absolute -right-7 -top-7 h-20 w-20 rounded-full opacity-50 ${tone.bg}`} />

      <div className="relative flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone.iconBg} ${tone.text} transition-transform duration-200 group-hover:scale-110`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 transition-colors group-hover:bg-slate-100">
          <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
        </div>
      </div>

      <div className="relative mt-5">
        <p className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {Number(value || 0).toLocaleString("en-IN")}
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-700">{label}</p>

        {description && <p className="mt-1 text-[11px] leading-4 text-slate-400">{description}</p>}
      </div>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Skeletons                                                                  */
/* -------------------------------------------------------------------------- */

function DashboardStatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <Skeleton className="h-7 w-7 rounded-full" />
      </div>

      <div className="mt-5 space-y-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-36" />
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="flex items-center gap-3 py-3">
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />

      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Section Header                                                             */
/* -------------------------------------------------------------------------- */

function SectionHeader({ icon: Icon, title, link }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        {Icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <Icon className="h-4 w-4" />
          </span>
        )}

        <h3 className="truncate text-sm font-bold text-slate-800">{title}</h3>
      </div>

      {link && (
        <Link
          to={link}
          className="shrink-0 text-xs font-semibold text-sky-700 transition-colors hover:text-sky-900 hover:underline"
        >
          View all
        </Link>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Dashboard                                                                  */
/* -------------------------------------------------------------------------- */

export function DashboardOverview() {
  const [stats, setStats] = useState(null);

  const [recentEnquiries, setRecentEnquiries] = useState([]);
  const [upcomingDates, setUpcomingDates] = useState([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    setError("");

    Promise.all([
      getMembers({ limit: LARGE_BATCH }),
      getEnquiries(),
      getImportantDates(),
      getUpcomingBirthdays(),
    ])
      .then(([membersResult, enquiriesResult, importantDates, birthdays]) => {
        if (!mounted) return;

        const members = membersResult?.members || [];

        /* ------------------------- Enquiries ------------------------- */

        const enquiries = [...(enquiriesResult?.enquiries || [])].sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
        );

        setRecentEnquiries(enquiries.slice(0, 5));

        /* ---------------------- Important Dates --------------------- */

        const todayOnly = new Date();

        todayOnly.setHours(0, 0, 0, 0);

        const upcoming = (importantDates || [])
          .map((entry) => ({
            ...entry,
            daysLeft: Math.round(
              (new Date(entry.date).getTime() - todayOnly.getTime()) / (1000 * 60 * 60 * 24),
            ),
          }))
          .filter((entry) => entry.daysLeft >= 0)
          .sort((a, b) => a.daysLeft - b.daysLeft);

        setUpcomingDates(upcoming.slice(0, UPCOMING_LIMIT));

        /* ------------------------- Birthdays ------------------------ */

        setUpcomingBirthdays((birthdays || []).slice(0, UPCOMING_LIMIT));

        /* ---------------------------- Stats -------------------------- */

        const serverStats = membersResult?.stats;

        setStats({
          totalMembers: serverStats?.total ?? membersResult?.pagination?.total ?? members.length,

          activeMembers:
            serverStats?.active ??
            members.filter((member) => member.isActive && !isExpired(member)).length,

          inactiveMembers:
            serverStats?.inactive ??
            members.filter((member) => !member.isActive || isExpired(member)).length,

          profileIncomplete: members.filter(isProfileIncomplete).length,

          expiredMembers: members.filter(isExpired).length,

          expiringSoon: members.filter((member) => isWithinDays(member, DASHBOARD_EXPIRING_DAYS))
            .length,
        });
      })
      .catch((requestError) => {
        if (!mounted) return;

        setError(requestError?.message || "Could not load dashboard data.");
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Member Cards                                                           */
  /* ---------------------------------------------------------------------- */

  const memberCards = stats
    ? [
        {
          key: "all",
          label: "All Members",
          value: stats.totalMembers,
          icon: Users,
          accent: "sky",
          description: "Total registered members",
          search: { status: "all" },
        },

        {
          key: "active",
          label: "Active Members",
          value: stats.activeMembers,
          icon: UserCheck,
          accent: "emerald",
          description: "Currently active members",
          search: { status: "active" },
        },

        {
          key: "inactive",
          label: "Inactive Members",
          value: stats.inactiveMembers,
          icon: UserX,
          accent: "slate",
          description: "Inactive or expired",
          search: { status: "inactive" },
        },

        {
          key: "incomplete",
          label: "Incomplete Profiles",
          value: stats.profileIncomplete,
          icon: UserCog,
          accent: "amber",
          description: "Profiles need attention",
          search: { status: "incomplete" },
        },

        {
          key: "expiring",
          label: `Expiring in ${DASHBOARD_EXPIRING_DAYS} Days`,
          value: stats.expiringSoon,
          icon: Clock3,
          accent: "violet",
          description: "Memberships expiring soon",
          search: {
            status: "expiring",
            days: DASHBOARD_EXPIRING_DAYS,
          },
        },
      ]
    : [];

  return (
    <section className="min-h-full space-y-5 pb-6">
      {/* ================================================================== */}
      {/* Welcome                                                            */}
      {/* ================================================================== */}

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-sky-50/70 p-5 shadow-sm sm:p-6">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-sky-100/50" />

        <div className="relative">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-700">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                Admin Dashboard
              </div>

              <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Welcome back, Admin 👋
              </h2>

              <p className="mt-1 max-w-xl text-sm text-slate-500">
                Here’s a quick overview of what’s happening with AICDA today.
              </p>
            </div>

            <Link
              to="/admin/directory/create"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-md sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Add Member
            </Link>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* Error                                                              */}
      {/* ================================================================== */}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div>
            <p className="font-semibold">Unable to load dashboard</p>

            <p className="mt-0.5 text-xs text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* Statistics                                                         */}
      {/* ================================================================== */}

      <div>
        <div className="mb-3">
          <h3 className="text-base font-bold text-slate-900">Member Overview</h3>

          <p className="mt-0.5 text-xs text-slate-500">Current membership statistics</p>
        </div>

        <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {loading || !stats
            ? Array.from({ length: 5 }).map((_, index) => <DashboardStatCardSkeleton key={index} />)
            : memberCards.map((card) => (
                <DashboardStatCard
                  key={card.key}
                  icon={card.icon}
                  label={card.label}
                  value={card.value}
                  accent={card.accent}
                  description={card.description}
                  to="/admin/directory"
                  search={card.search}
                />
              ))}
        </div>
      </div>

      {/* ================================================================== */}
      {/* Important Dates + Birthdays                                        */}
      {/* ================================================================== */}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Important Dates */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <SectionHeader
            icon={CalendarDays}
            title="Upcoming Important Dates"
            link="/admin/important-dates"
          />

          {loading ? (
            <div className="mt-3 divide-y divide-slate-100">
              {Array.from({ length: 3 }).map((_, index) => (
                <ActivitySkeleton key={index} />
              ))}
            </div>
          ) : upcomingDates.length === 0 ? (
            <div className="flex min-h-44 flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <CalendarDays className="h-5 w-5" />
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-700">No upcoming dates</p>

              <p className="mt-1 text-xs text-slate-400">Important dates will appear here.</p>
            </div>
          ) : (
            <div className="mt-3 divide-y divide-slate-100">
              {upcomingDates.map((entry) => (
                <div
                  key={entry.id || entry._id || entry.date}
                  className="flex items-center gap-3 py-3"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                    <CalendarDays className="h-4 w-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {entry.title || "Important Date"}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">{formatDate(entry.date)}</p>
                  </div>

                  <span className="shrink-0 rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-700">
                    {daysLeftLabel(entry.daysLeft)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Birthdays */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <SectionHeader icon={Cake} title="Upcoming Birthdays" />

          {loading ? (
            <div className="mt-3 divide-y divide-slate-100">
              {Array.from({ length: 3 }).map((_, index) => (
                <ActivitySkeleton key={index} />
              ))}
            </div>
          ) : upcomingBirthdays.length === 0 ? (
            <div className="flex min-h-44 flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-50 text-pink-500">
                <Cake className="h-5 w-5" />
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-700">No birthdays this week</p>

              <p className="mt-1 text-xs text-slate-400">
                Upcoming member birthdays will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-3 divide-y divide-slate-100">
              {upcomingBirthdays.map((member) => (
                <div
                  key={member.id || member._id || member.memberId}
                  className="flex items-center gap-3 py-3"
                >
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.memberName || "Member"}
                      className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-pink-50"
                    />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-50 text-sm font-bold text-pink-600">
                      {(member.memberName || "?").charAt(0).toUpperCase()}
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {member.memberName || "Unknown Member"}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      Member #{member.memberId || "—"}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-pink-50 px-2.5 py-1 text-[11px] font-bold text-pink-600">
                    {daysLeftLabel(member.daysLeft)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================================================================== */}
      {/* Recent Enquiries + Quick Actions                                  */}
      {/* ================================================================== */}

      <div className="grid gap-4 xl:grid-cols-3">
        {/* Recent Enquiries */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
          <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
            <SectionHeader title="Recent Enquiries" link="/admin/enquiries" />

            <p className="mt-1 text-xs text-slate-500">
              Latest enquiries received from members and visitors.
            </p>
          </div>

          {loading ? (
            <div className="divide-y divide-slate-100 px-4 sm:px-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <ActivitySkeleton key={index} />
              ))}
            </div>
          ) : recentEnquiries.length === 0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center px-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <HelpCircle className="h-5 w-5" />
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-700">No enquiries yet</p>

              <p className="mt-1 text-xs text-slate-400">
                New enquiries will appear here automatically.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div className="divide-y divide-slate-100 md:hidden">
                {recentEnquiries.map((entry) => (
                  <div key={entry.id || entry._id} className="flex items-center gap-3 px-4 py-3.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sm font-bold text-sky-700">
                      {(entry.fullName || "?").charAt(0).toUpperCase()}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {entry.fullName || "Unknown"}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          {requestTypeLabel(entry.requestType)}
                        </span>

                        <span className="text-[11px] text-slate-500">
                          {formatDate(entry.createdAt)}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Name
                      </th>

                      <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Type
                      </th>

                      <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Date
                      </th>

                      <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {recentEnquiries.map((entry) => (
                      <tr
                        key={entry.id || entry._id}
                        className="group transition-colors hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-xs font-bold text-sky-700">
                              {(entry.fullName || "?").charAt(0).toUpperCase()}
                            </span>

                            <span className="max-w-[180px] truncate text-sm font-semibold text-slate-800">
                              {entry.fullName || "Unknown"}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                            {requestTypeLabel(entry.requestType)}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-3.5 text-xs text-slate-500">
                          {formatDate(entry.createdAt)}
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            New
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-100 px-5 py-3">
                <Link
                  to="/admin/enquiries"
                  className="group inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-900"
                >
                  View all enquiries
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Quick Actions</h3>

            <p className="mt-1 text-xs text-slate-500">Frequently used admin actions.</p>
          </div>

          <div className="mt-4 space-y-2.5">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              const tone = CARD_ACCENTS[action.accent];

              return (
                <Link
                  key={action.to}
                  to={action.to}
                  className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone.bg} ${tone.text} transition-transform group-hover:scale-105`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-800">
                      {action.label}
                    </span>

                    <span className="mt-0.5 block truncate text-[11px] text-slate-400">
                      {action.description}
                    </span>
                  </span>

                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all group-hover:bg-white group-hover:text-slate-600">
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Attention */}
          {stats && (
            <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50/70 p-3.5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-amber-800">Needs Attention</p>

                  <p className="mt-1 text-[11px] leading-4 text-amber-700">
                    {stats.profileIncomplete} profiles need completion and {stats.expiringSoon}{" "}
                    memberships are expiring soon.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
