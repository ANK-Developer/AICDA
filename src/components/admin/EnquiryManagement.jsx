import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Inbox,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteEnquiry, getEnquiries } from "@/lib/enquiry-api";

const PAGE_SIZE = 10;

const isMembership = (value) => value === "MEMBERSHIP" || !value;

const requestTypeLabel = (value) => (isMembership(value) ? "Membership" : "General Enquiry");

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const getId = (entry) => entry?.id || entry?._id;

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* -------------------------------------------------------------------------- */
/* Type Badge                                                                 */
/* -------------------------------------------------------------------------- */

function TypeBadge({ value }) {
  const membership = isMembership(value);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold whitespace-nowrap ${
        membership
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      <span
        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${membership ? "bg-red-600" : "bg-slate-500"}`}
      />

      {requestTypeLabel(value)}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Info Item                                                                  */
/* -------------------------------------------------------------------------- */

function InfoItem({ icon: Icon, label, value }) {
  if (!value) return null;

  return (
    <div className="group flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 transition-all hover:border-red-200 hover:bg-red-50/40">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700 transition-colors group-hover:bg-red-700 group-hover:text-white">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>

        <p className="mt-0.5 break-words text-[13px] font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Card Skeleton                                                              */
/* -------------------------------------------------------------------------- */

function EnquiryCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>

        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Table Skeleton                                                             */
/* -------------------------------------------------------------------------- */

function DirectoryTableSkeleton({ columns = 6 }) {
  return (
    <div className="mt-4 hidden overflow-hidden rounded-xl border border-slate-200 md:block">
      <div className="grid grid-cols-6 gap-4 bg-slate-50 px-4 py-3">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-3 w-20" />
        ))}
      </div>

      {Array.from({ length: 6 }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-6 gap-4 border-t border-slate-100 px-4 py-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className={`h-3 ${colIndex === 0 ? "w-28" : "w-20"}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty State                                                                */
/* -------------------------------------------------------------------------- */

function EmptyState() {
  return (
    <div className="mt-4 flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-700">
        <Inbox className="h-7 w-7" />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-800">No enquiries found</h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
        There are no enquiries matching your current search or filter.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export function EnquiryManagement() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState(null);

  /* ------------------------------------------------------------------------ */
  /* Load enquiries                                                           */
  /* ------------------------------------------------------------------------ */

  const loadEnquiries = async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const result = await getEnquiries();

      const data = Array.isArray(result?.enquiries) ? result.enquiries : [];

      setEnquiries(data);
    } catch (requestError) {
      const message = requestError?.message || "Could not load enquiries.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Filter                                                                   */
  /* ------------------------------------------------------------------------ */

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return enquiries.filter((entry) => {
      const searchableText = [
        entry?.fullName,
        entry?.mobile,
        entry?.email,
        entry?.companyName,
        entry?.city,
        entry?.state,
        entry?.message,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery = !query || searchableText.includes(query);

      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "membership" && isMembership(entry?.requestType)) ||
        (typeFilter === "general" && !isMembership(entry?.requestType));

      return matchesQuery && matchesType;
    });
  }, [enquiries, search, typeFilter]);

  /* ------------------------------------------------------------------------ */
  /* Pagination                                                               */
  /* ------------------------------------------------------------------------ */

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const currentPage = Math.min(page, totalPages);

  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter]);

  /* ------------------------------------------------------------------------ */
  /* Delete                                                                   */
  /* ------------------------------------------------------------------------ */

  const performDelete = async (entry) => {
    const id = getId(entry);

    if (!id) {
      toast.error("Unable to delete this enquiry.");
      return;
    }

    try {
      await deleteEnquiry(id);

      setEnquiries((prev) => prev.filter((item) => getId(item) !== id));

      if (viewing && getId(viewing) === id) {
        setViewing(null);
      }

      toast.success(`Enquiry from ${entry?.fullName || "this contact"} deleted.`);
    } catch (requestError) {
      const message = requestError?.message || "Could not delete this enquiry.";

      setError(message);
      toast.error(message);
    }
  };

  const confirmDelete = (entry) => {
    toast(`Delete enquiry from ${entry?.fullName || "this contact"}?`, {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: () => performDelete(entry),
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  /* ------------------------------------------------------------------------ */
  /* Stats                                                                    */
  /* ------------------------------------------------------------------------ */

  const membershipCount = enquiries.filter((item) => isMembership(item?.requestType)).length;

  const generalCount = enquiries.filter((item) => !isMembership(item?.requestType)).length;

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <section className="w-full space-y-4">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                              */}
      {/* ------------------------------------------------------------------ */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-700 text-white shadow-sm">
              <MessageSquare className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Enquiries</h2>

              <p className="mt-0.5 text-xs leading-5 text-slate-500 sm:text-[13px]">
                Manage membership requests and general enquiries.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => loadEnquiries({ silent: true })}
              disabled={refreshing}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />

              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Mini Stats                                                        */}
        {/* ---------------------------------------------------------------- */}

        <div className="grid grid-cols-2 border-t border-slate-100 sm:grid-cols-3">
          <div className="border-r border-slate-100 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              All Enquiries
            </p>

            <p className="mt-1 text-lg font-bold text-slate-900">{enquiries.length}</p>
          </div>

          <div className="border-r-0 px-4 py-3 sm:border-r sm:border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Membership
            </p>

            <p className="mt-1 text-lg font-bold text-red-700">{membershipCount}</p>
          </div>

          <div className="hidden px-4 py-3 sm:block">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">General</p>

            <p className="mt-1 text-lg font-bold text-slate-700">{generalCount}</p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Filters                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Type Filter */}

          <div className="flex w-full flex-col gap-1.5 sm:w-auto sm:flex-row sm:items-center">
            <span className="text-xs font-bold text-slate-500">Type</span>

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition-all hover:border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 sm:w-44"
            >
              <option value="all">All Enquiries</option>
              <option value="membership">Membership</option>
              <option value="general">General Enquiry</option>
            </select>
          </div>

          {/* Search */}

          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, mobile, email..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-xs font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 hover:border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-700"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Error */}

        {error && (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700"
          >
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Content                                                           */}
        {/* ---------------------------------------------------------------- */}

        {loading ? (
          <>
            {/* Mobile Skeleton */}

            <div className="mt-4 space-y-3 md:hidden">
              {Array.from({ length: 5 }).map((_, index) => (
                <EnquiryCardSkeleton key={index} />
              ))}
            </div>

            {/* Desktop Skeleton */}

            <DirectoryTableSkeleton columns={6} />
          </>
        ) : pageRows.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* ============================================================ */}
            {/* MOBILE CARDS                                                 */}
            {/* ============================================================ */}

            <div className="mt-4 space-y-3 md:hidden">
              {pageRows.map((entry) => {
                const id = getId(entry);

                return (
                  <article
                    key={id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-red-200 hover:shadow-md"
                  >
                    {/* Card Header */}

                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-slate-900">
                          {entry?.fullName || "Unknown Contact"}
                        </h3>

                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <Phone className="h-3 w-3" />

                          {entry?.mobile || "No mobile"}
                        </p>
                      </div>

                      <TypeBadge value={entry?.requestType} />
                    </div>

                    {/* Card Body */}

                    <div className="grid grid-cols-2 gap-3 p-4">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Company
                        </p>

                        <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                          {entry?.companyName || "—"}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Email
                        </p>

                        <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                          {entry?.email || "—"}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Location
                        </p>

                        <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                          {[entry?.city, entry?.state].filter(Boolean).join(", ") || "—"}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Submitted
                        </p>

                        <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                          {formatDate(entry?.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}

                    <div className="flex gap-2 border-t border-slate-100 bg-slate-50/70 p-3">
                      <button
                        type="button"
                        onClick={() => setViewing(entry)}
                        className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-white px-3 text-xs font-bold text-slate-700 ring-1 ring-inset ring-slate-200 transition-all hover:bg-red-50 hover:text-red-700 hover:ring-red-200"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Details
                      </button>

                      <button
                        type="button"
                        onClick={() => confirmDelete(entry)}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-red-50 px-3 text-xs font-bold text-red-700 transition-all hover:bg-red-700 hover:text-white"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="hidden xs:inline">Delete</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* ============================================================ */}
            {/* DESKTOP TABLE                                                */}
            {/* ============================================================ */}

            <div className="mt-4 hidden overflow-hidden rounded-xl border border-slate-200 md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-xs">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-3 font-bold uppercase tracking-wide text-slate-500">
                        Contact
                      </th>

                      <th className="px-4 py-3 font-bold uppercase tracking-wide text-slate-500">
                        Mobile
                      </th>

                      <th className="px-4 py-3 font-bold uppercase tracking-wide text-slate-500">
                        Company
                      </th>

                      <th className="px-4 py-3 font-bold uppercase tracking-wide text-slate-500">
                        Type
                      </th>

                      <th className="px-4 py-3 font-bold uppercase tracking-wide text-slate-500">
                        Submitted
                      </th>

                      <th className="px-4 py-3 text-right font-bold uppercase tracking-wide text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {pageRows.map((entry, index) => {
                      const id = getId(entry);

                      return (
                        <tr
                          key={id}
                          className={`group transition-colors hover:bg-red-50/40 ${
                            index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                          }`}
                        >
                          {/* Contact */}

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-xs font-bold text-red-700">
                                {(entry?.fullName || "?").charAt(0).toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-[180px] truncate font-bold text-slate-800">
                                  {entry?.fullName || "—"}
                                </p>

                                <p className="mt-0.5 max-w-[180px] truncate text-[11px] text-slate-400">
                                  {entry?.email || "No email"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Mobile */}

                          <td className="px-4 py-3.5">
                            <span className="whitespace-nowrap font-medium text-slate-600">
                              {entry?.mobile || "—"}
                            </span>
                          </td>

                          {/* Company */}

                          <td className="px-4 py-3.5">
                            <span className="block max-w-[160px] truncate font-medium text-slate-600">
                              {entry?.companyName || "—"}
                            </span>
                          </td>

                          {/* Type */}

                          <td className="px-4 py-3.5">
                            <TypeBadge value={entry?.requestType} />
                          </td>

                          {/* Date */}

                          <td className="px-4 py-3.5">
                            <span className="whitespace-nowrap font-medium text-slate-500">
                              {formatDate(entry?.createdAt)}
                            </span>
                          </td>

                          {/* Actions */}

                          <td className="px-4 py-3.5">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setViewing(entry)}
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 font-bold text-slate-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View
                              </button>

                              <button
                                type="button"
                                onClick={() => confirmDelete(entry)}
                                className="inline-flex h-8 items-center justify-center rounded-lg border border-transparent px-2 text-red-600 transition-all hover:bg-red-50"
                                aria-label="Delete enquiry"
                                title="Delete enquiry"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Pagination                                                        */}
        {/* ---------------------------------------------------------------- */}

        {!loading && filtered.length > 0 && (
          <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] font-medium text-slate-500">
              Showing{" "}
              <span className="font-bold text-slate-700">{(currentPage - 1) * PAGE_SIZE + 1}</span>{" "}
              –{" "}
              <span className="font-bold text-slate-700">
                {Math.min(currentPage * PAGE_SIZE, filtered.length)}
              </span>{" "}
              of <span className="font-bold text-slate-700">{filtered.length}</span>
            </p>

            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                disabled={currentPage <= 1}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              <div className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-red-700 px-3 text-xs font-bold text-white">
                {currentPage}
              </div>

              <button
                type="button"
                onClick={() => setPage((previous) => Math.min(totalPages, previous + 1))}
                disabled={currentPage >= totalPages}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* DETAILS MODAL                                                      */}
      {/* ================================================================== */}

      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="enquiry-dialog-title"
          onClick={() => setViewing(null)}
        >
          <div
            className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal Header */}

            <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-white px-4 py-4 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-700 text-sm font-bold text-white">
                  {(viewing?.fullName || "?").charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <h3
                    id="enquiry-dialog-title"
                    className="truncate text-base font-bold text-slate-900 sm:text-lg"
                  >
                    {viewing?.fullName || "Enquiry Details"}
                  </h3>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Submitted {formatDate(viewing?.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <TypeBadge value={viewing?.requestType} />

                <button
                  type="button"
                  onClick={() => setViewing(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-red-50 hover:text-red-700"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}

            <div className="overflow-y-auto p-4 sm:p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoItem icon={Phone} label="Mobile" value={viewing?.mobile} />

                <InfoItem icon={Mail} label="Email" value={viewing?.email} />

                <InfoItem icon={Building2} label="Company" value={viewing?.companyName} />

                <InfoItem
                  icon={MapPin}
                  label="Location"
                  value={[viewing?.city, viewing?.state].filter(Boolean).join(", ")}
                />

                <InfoItem
                  icon={Calendar}
                  label="Submitted"
                  value={formatDateTime(viewing?.createdAt)}
                />
              </div>

              {/* Message */}

              {viewing?.message && (
                <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
                    <MessageSquare className="h-4 w-4 text-red-700" />

                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Message
                    </p>
                  </div>

                  <div className="p-4">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {viewing.message}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
              <button
                type="button"
                onClick={() => setViewing(null)}
                className="h-10 rounded-lg border border-slate-200 bg-white px-5 text-xs font-bold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-100"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  confirmDelete(viewing);
                  setViewing(null);
                }}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-700 px-5 text-xs font-bold text-white transition-all hover:bg-red-800"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Enquiry
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default EnquiryManagement;
