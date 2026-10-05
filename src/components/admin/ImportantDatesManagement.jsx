import { useEffect, useState } from "react";

import { Cake, CalendarDays, Eye, Search, Sparkles } from "lucide-react";

import { AppLink as Link } from "@/components/common/AppLink";
import { useGetImportantDatesQuery } from "@/features/importantDates/importantDatesApi";

import { DirectoryTableSkeleton } from "./DirectoryManagement";
import { buildMemberSlug, buildPartnerSlug } from "./directory-shared";

const PAGE_SIZE = 10;

const OCCASION_TABS = [
  { value: "birthday", label: "Birthdays", icon: Cake },
  { value: "special", label: "Special Dates", icon: Sparkles },
];

const TYPE_OPTIONS = [
  { value: "all", label: "Members & Partners" },
  { value: "member", label: "Members" },
  { value: "partner", label: "Partners" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "Any status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const PERIOD_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "week", label: "Next 7 days" },
  { value: "month", label: "Next 30 days" },
  { value: "all", label: "All dates" },
];

const selectClass =
  "h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-[13px] text-slate-700 outline-none transition-colors hover:border-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 sm:w-auto";

// Dates are stored as UTC midnight, so format them in UTC to avoid the day
// shifting for viewers in other time zones.
function formatDate(value, withYear = true) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    ...(withYear && { year: "numeric" }),
    timeZone: "UTC",
  });
}

function whenLabel(daysLeft) {
  if (daysLeft === 0) return "Today";
  if (daysLeft === 1) return "Tomorrow";
  return `In ${daysLeft} days`;
}

function profilePath(entry) {
  return entry.type === "member"
    ? `/admin/directory/${encodeURIComponent(buildMemberSlug({ memberName: entry.name, id: entry.id }))}/details`
    : `/admin/directory/partner/${encodeURIComponent(buildPartnerSlug({ partnerName: entry.name, id: entry.id }))}/details`;
}

function Avatar({ entry, size = "h-10 w-10" }) {
  if (entry.photo) {
    return (
      <img
        src={entry.photo}
        alt={entry.name}
        className={`${size} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <span
      className={`${size} flex shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600`}
    >
      {(entry.name || "?").charAt(0).toUpperCase()}
    </span>
  );
}

function TypeBadge({ type }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${
        type === "member" ? "bg-sky-50 text-sky-700" : "bg-violet-50 text-violet-700"
      }`}
    >
      {type === "member" ? "Member" : "Partner"}
    </span>
  );
}

function StatusBadge({ isActive }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${
        isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function WhenBadge({ daysLeft }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${
        daysLeft === 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
      }`}
    >
      {whenLabel(daysLeft)}
    </span>
  );
}

// What the date column shows: the original date (birth date or special date)
// plus context — the age being turned, or the special date's note.
function DateCell({ entry }) {
  const turning =
    entry.occasion === "birthday"
      ? new Date(entry.nextDate).getUTCFullYear() - new Date(entry.date).getUTCFullYear()
      : null;

  return (
    <div>
      <div className="font-medium text-slate-700">{formatDate(entry.date)}</div>

      {turning > 0 && <div className="mt-0.5 text-xs text-slate-400">Turns {turning}</div>}

      {entry.occasion === "special" && entry.note && (
        <div className="mt-0.5 max-w-[240px] truncate text-xs text-slate-400">{entry.note}</div>
      )}
    </div>
  );
}

function ViewButton({ entry, className = "" }) {
  return (
    <Link
      to={profilePath(entry)}
      className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-700 ${className}`}
    >
      <Eye className="h-3.5 w-3.5" />
      View
    </Link>
  );
}

export function ImportantDatesManagement() {
  const [occasion, setOccasion] = useState("birthday");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [period, setPeriod] = useState("today");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isFetching, isLoading, error } = useGetImportantDatesQuery({
    occasion,
    type,
    status,
    period,
    search: debouncedSearch,
    page,
    limit: PAGE_SIZE,
  });

  const items = data?.items || [];
  const counts = data?.counts || { birthday: 0, special: 0 };
  const pagination = data?.pagination || { page: 1, total: 0, totalPages: 1 };

  // Any filter change goes back to the first page.
  const changeFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const hasFilters =
    type !== "all" || status !== "all" || debouncedSearch.trim() || period !== "today";
  const occasionLabel = occasion === "birthday" ? "birthdays" : "special dates";

  return (
    <section className="space-y-3">
      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
            <CalendarDays className="h-5 w-5 text-red-700" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-red-700 sm:text-xl">Important Dates</h2>

            <p className="mt-0.5 text-[12px] leading-5 text-slate-500 sm:text-[13px]">
              Birthdays and special dates of members and partners, taken from their profiles.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-200 px-3 pt-2 sm:px-4">
          {OCCASION_TABS.map(({ value, label, icon: Icon }) => {
            const active = occasion === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() => changeFilter(setOccasion)(value)}
                className={`-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-[13px] font-semibold transition-colors ${
                  active
                    ? "border-red-600 text-red-700"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                    active ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {counts[value]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-2 border-b border-slate-200 p-3 sm:p-4 lg:flex-row lg:items-center">
          <label className="relative block w-full lg:max-w-xs lg:flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) => changeFilter(setSearch)(event.target.value)}
              placeholder="Search member or partner by name..."
              className="h-9 w-full rounded-lg border border-slate-300 bg-white py-1 pl-9 pr-3 text-[13px] outline-none transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
          </label>

          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={type}
              onChange={(event) => changeFilter(setType)(event.target.value)}
              aria-label="Filter by type"
              className={selectClass}
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(event) => changeFilter(setStatus)(event.target.value)}
              aria-label="Filter by status"
              className={selectClass}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={period}
              onChange={(event) => changeFilter(setPeriod)(event.target.value)}
              aria-label="Filter by period"
              className={selectClass}
            >
              {PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <p className="text-xs text-slate-500 lg:ml-auto">
            {pagination.total} {pagination.total === 1 ? "record" : "records"}
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="m-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700 sm:m-4"
          >
            {error?.data?.message || "Could not load important dates."}
          </p>
        )}

        {isLoading ? (
          <div className="p-3">
            <DirectoryTableSkeleton columns={6} />
          </div>
        ) : items.length === 0 ? (
          <div className="m-3 flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-5 text-center sm:m-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              {occasion === "birthday" ? (
                <Cake className="h-6 w-6 text-slate-400" />
              ) : (
                <Sparkles className="h-6 w-6 text-slate-400" />
              )}
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-600">
              {hasFilters ? `No ${occasionLabel} match these filters` : `No ${occasionLabel} today`}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {hasFilters
                ? "Try changing the filters or search."
                : "Pick Next 7 days or All dates to look further ahead."}
            </p>
          </div>
        ) : (
          <div className={isFetching ? "opacity-60 transition-opacity" : "transition-opacity"}>
            {/* Desktop / Tablet Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-left text-[13px]">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Sr. No.</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">
                      {occasion === "birthday" ? "Date of Birth" : "Special Date"}
                    </th>
                    <th className="px-4 py-3">When</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((entry, index) => (
                    <tr
                      key={entry.key}
                      className="border-t border-slate-200 transition-colors hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">{(pagination.page - 1) * PAGE_SIZE + index + 1}</td>

                      <td className="px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar entry={entry} />

                          <div className="min-w-0">
                            <div className="truncate font-semibold text-slate-800">
                              {entry.name}
                            </div>
                            <div className="mt-0.5 text-xs text-slate-400">
                              {entry.type === "member" ? "Member" : "Partner"} #{entry.code}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <TypeBadge type={entry.type} />
                      </td>

                      <td className="px-4 py-3">
                        <DateCell entry={entry} />
                      </td>

                      <td className="px-4 py-3">
                        <WhenBadge daysLeft={entry.daysLeft} />
                        {entry.daysLeft > 0 && (
                          <div className="mt-0.5 text-xs text-slate-400">
                            {formatDate(entry.nextDate, false)}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge isActive={entry.isActive} />
                      </td>

                      <td className="px-4 py-3 text-center">
                        <ViewButton entry={entry} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-2 p-3 md:hidden">
              {items.map((entry) => (
                <div
                  key={entry.key}
                  className="rounded-xl border border-slate-200 bg-white p-3 transition-colors hover:border-slate-300 hover:bg-slate-50/50"
                >
                  <div className="flex items-start gap-3">
                    <Avatar entry={entry} size="h-11 w-11" />

                    <div className="min-w-0 flex-1">
                      <h4 className="break-words text-sm font-semibold text-slate-800">
                        {entry.name}
                      </h4>

                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <TypeBadge type={entry.type} />
                        <StatusBadge isActive={entry.isActive} />
                        <WhenBadge daysLeft={entry.daysLeft} />
                      </div>

                      <div className="mt-2 text-xs text-slate-500">
                        <DateCell entry={entry} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <ViewButton entry={entry} className="h-9 w-full" />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(current - 1, 1))}
                    disabled={pagination.page <= 1}
                    className="h-8 rounded-lg border border-slate-200 bg-white px-3 font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) => Math.min(current + 1, pagination.totalPages))
                    }
                    disabled={pagination.page >= pagination.totalPages}
                    className="h-8 rounded-lg border border-slate-200 bg-white px-3 font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
