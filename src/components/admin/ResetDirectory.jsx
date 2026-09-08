import { useEffect, useState } from "react";

import { Link } from "@tanstack/react-router";

import { Eye, Handshake, RefreshCw, Search, Tag, Users, X, LoaderCircle, User } from "lucide-react";
import { toast } from "react-toastify";

import { getMembers, renewMember, updateMember } from "@/lib/member-api";

import { getPartners, renewPartner, updatePartner } from "@/lib/partner-api";
import { getMediaUrl } from "../../lib/config";

import {
  buildMemberSlug,
  buildPartnerSlug,
  daysRemaining,
  DesignationCombobox,
  expiryLabel,
  inputClass,
  isExpired,
  isExpiringSoon,
  isTodayOrPast,
  StatusBadge,
} from "./directory-shared";

const PAGE_SIZE = 10;
const LARGE_BATCH = 1000;
const SEARCH_DEBOUNCE_MS = 400;

const TABS = [
  {
    value: "members",
    label: "Members",
    icon: Users,
  },
  {
    value: "partners",
    label: "Partners",
    icon: Handshake,
  },
];

/* =========================================================
   HELPERS
========================================================= */

function displayIdOf(tab, record) {
  return tab === "members" ? record.memberId : record.partnerId;
}

function nameOf(tab, record) {
  return tab === "members" ? record.memberName : record.partnerName;
}

function detailsRouteOf(tab) {
  return tab === "members"
    ? "/admin/directory/$slug/details"
    : "/admin/directory/partner/$slug/details";
}

function slugOf(tab, record) {
  return tab === "members" ? buildMemberSlug(record) : buildPartnerSlug(record);
}

function photoOf(record) {
  return record?.photo ? getMediaUrl(record.photo) : "";
}

/* =========================================================
   MODAL
========================================================= */

function Modal({ title, description, children, onClose, maxWidth = "max-w-md" }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          onClose();
        }
      }}
      tabIndex={-1}
    >
      <div
        className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto overflow-hidden rounded-md border border-slate-200 bg-white shadow-2xl`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-800 sm:text-base">{title}</h3>

            {description && (
              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-[13px]">{description}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}

/* =========================================================
   TABLE SKELETON
========================================================= */

function ResetDirectoryTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[950px] text-left text-[13px]">
          <thead className="bg-slate-50">
            <tr>
              {["ID", "Name", "Designation", "Mobile", "Status", "Days Remaining", "Actions"].map(
                (heading) => (
                  <th
                    key={heading}
                    className="whitespace-nowrap border-b border-slate-200 px-3 py-3 font-semibold text-slate-500"
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: 7 }).map((_, index) => (
              <tr key={index} className="border-b border-slate-100 last:border-b-0">
                <td className="px-3 py-3">
                  <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                </td>

                <td className="px-3 py-3">
                  <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                </td>

                <td className="px-3 py-3">
                  <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                </td>

                <td className="px-3 py-3">
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                </td>

                <td className="px-3 py-3">
                  <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />
                </td>

                <td className="px-3 py-3">
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                </td>

                <td className="px-3 py-3">
                  <div className="ml-auto h-4 w-40 animate-pulse rounded bg-slate-200" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export function ResetDirectory() {
  const [tab, setTab] = useState("members");

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  /* =====================================================
     RENEW
  ===================================================== */

  const [renewTarget, setRenewTarget] = useState(null);
  const [renewDate, setRenewDate] = useState("");
  const [renewAmount, setRenewAmount] = useState("");
  const [renewing, setRenewing] = useState(false);
  const [renewError, setRenewError] = useState("");

  /* =====================================================
     DESIGNATION
  ===================================================== */

  const [designationTarget, setDesignationTarget] = useState(null);
  const [designationValue, setDesignationValue] = useState("");
  const [savingDesignation, setSavingDesignation] = useState(false);
  const [designationError, setDesignationError] = useState("");

  /* =====================================================
     SEARCH DEBOUNCE
  ===================================================== */

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

  /* =====================================================
     RESET PAGE
  ===================================================== */

  useEffect(() => {
    setPage(1);
  }, [tab, search]);

  /* =====================================================
     LOAD DATA
  ===================================================== */

  const load = async () => {
    setLoading(true);
    setListError("");

    try {
      if (tab === "members") {
        const result = await getMembers({
          search,
          limit: LARGE_BATCH,
        });

        setRecords(result?.members || []);
      } else {
        const result = await getPartners({
          search,
          limit: LARGE_BATCH,
        });

        setRecords(Array.isArray(result) ? result : []);
      }
    } catch (requestError) {
      const message = requestError?.message || `Could not load ${tab}.`;

      setListError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, search]);

  /* =====================================================
     PAGINATION
  ===================================================== */

  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));

  const safePage = Math.min(page, totalPages);

  const pageRows = records.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  /* =====================================================
     SWITCH TAB
  ===================================================== */

  const switchTab = (value) => {
    setTab(value);
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  /* =====================================================
     RENEW
  ===================================================== */

  const openRenew = (record) => {
    setRenewTarget(record);

    setRenewDate(record?.validityTo ? String(record.validityTo).slice(0, 10) : "");

    setRenewAmount("");
    setRenewError("");
  };

  const closeRenew = () => {
    if (renewing) return;

    setRenewTarget(null);
    setRenewDate("");
    setRenewAmount("");
    setRenewError("");
  };

  const confirmRenew = async (event) => {
    event.preventDefault();

    if (!renewDate) {
      setRenewError("Choose the new validity date.");
      return;
    }

    if (isTodayOrPast(renewDate)) {
      setRenewError("Validity date must be after today.");
      return;
    }

    if (renewAmount && Number(renewAmount) < 0) {
      setRenewError("Amount cannot be negative.");
      return;
    }

    setRenewing(true);
    setRenewError("");

    try {
      const payload = {
        validityTo: renewDate,
        amount: renewAmount ? Number(renewAmount) : undefined,
      };

      if (tab === "members") {
        await renewMember(renewTarget.id, payload);
      } else {
        await renewPartner(renewTarget.id, payload);
      }

      await load();

      toast.success(
        `${nameOf(tab, renewTarget) || "Record"} renewed successfully through ${renewDate}${
          renewAmount ? ` for ₹${renewAmount}` : ""
        }.`,
      );

      closeRenew();
    } catch (requestError) {
      const message = requestError?.message || "Could not renew.";

      setRenewError(message);
      toast.error(message);
    } finally {
      setRenewing(false);
    }
  };

  /* =====================================================
     DESIGNATION
  ===================================================== */

  const openDesignation = (record) => {
    setDesignationTarget(record);
    setDesignationValue(record?.designation || "");
    setDesignationError("");
  };

  const closeDesignation = () => {
    if (savingDesignation) return;

    setDesignationTarget(null);
    setDesignationValue("");
    setDesignationError("");
  };

  const confirmDesignation = async (event) => {
    event.preventDefault();

    if (!designationValue.trim()) {
      setDesignationError("Choose or enter a designation.");
      return;
    }

    setSavingDesignation(true);
    setDesignationError("");

    try {
      const payload = {
        ...designationTarget,
        designation: designationValue.trim(),
      };

      if (tab === "members") {
        await updateMember(designationTarget.id, payload);
      } else {
        await updatePartner(designationTarget.id, payload);
      }

      await load();

      toast.success(
        `${nameOf(tab, designationTarget) || "Record"}'s designation updated to ${designationValue.trim()}.`,
      );

      closeDesignation();
    } catch (requestError) {
      const message = requestError?.message || "Could not update designation.";

      setDesignationError(message);
      toast.error(message);
    } finally {
      setSavingDesignation(false);
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <section className="w-full space-y-3">
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
          {/* RED HEADER ICON */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-red-50">
            <RefreshCw className="h-4 w-4 text-red-700" />
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-800 sm:text-lg">Reset Directory</h2>

            <p className="text-xs text-slate-500 sm:text-[13px]">
              Renew member or partner validity and update designations.
            </p>
          </div>
        </div>
      </div>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        {/* =================================================
            TOOLBAR
        ================================================= */}

        <div className="border-b border-slate-200 bg-slate-50/70 px-3 py-3 sm:px-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Tabs */}

            <div
              className="flex w-full rounded-md border border-slate-200 bg-white p-1 sm:w-auto"
              role="tablist"
            >
              {TABS.map((item) => {
                const Icon = item.icon;
                const active = tab === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => switchTab(item.value)}
                    className={`
                      inline-flex h-9 flex-1 items-center
                      justify-center gap-1.5 rounded-[4px]
                      px-4 text-xs font-semibold
                      transition-all
                      sm:flex-none sm:text-[13px]

                      ${
                        active
                          ? "bg-red-700 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100"
                      }
                    `}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Search */}

            <div className="w-full lg:max-w-sm">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder={
                    tab === "members"
                      ? "Search Member ID, name or mobile..."
                      : "Search Partner ID, name or mobile..."
                  }
                  aria-label={`Search ${tab}`}
                  className="
                    h-9 w-full rounded-md
                    border border-slate-300
                    bg-white pl-9 pr-3
                    text-xs outline-none
                    transition-all
                    placeholder:text-slate-400
                    hover:border-slate-400
                    focus:border-red-700
                    focus:ring-2
                    focus:ring-red-100
                    sm:text-[13px]
                  "
                />
              </label>
            </div>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {listError && (
          <div className="mx-3 mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 sm:mx-4 sm:text-[13px]">
            {listError}
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <div className="p-3 sm:p-4">
            <ResetDirectoryTableSkeleton />
          </div>
        ) : pageRows.length === 0 ? (
          /* =================================================
             EMPTY
          ================================================= */

          <div className="mx-3 my-4 flex min-h-52 flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50/50 sm:mx-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Users className="h-6 w-6 text-slate-400" />
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-600">
              {search ? `No ${tab} match your search` : `No ${tab} found`}
            </p>

            {search && (
              <p className="mt-1 text-xs text-slate-400">Try searching with a different keyword.</p>
            )}
          </div>
        ) : (
          /* =================================================
             TABLE
          ================================================= */

          <div className="p-3 sm:p-4">
            <div className="overflow-hidden rounded-md border border-slate-200">
              <div className="w-full overflow-x-auto scrollbar-hide">
                <table className="w-full min-w-[1050px] text-left text-[13px]">
                  {/* Header */}

                  <thead className="bg-slate-50">
                    <tr>
                      <th className="whitespace-nowrap border-b border-slate-200 px-3 py-3 font-semibold text-slate-500">
                        {tab === "members" ? "Member ID" : "Partner ID"}
                      </th>

                      <th className="whitespace-nowrap border-b border-slate-200 px-3 py-3 font-semibold text-slate-500">
                        Name
                      </th>

                      <th className="whitespace-nowrap border-b border-slate-200 px-3 py-3 font-semibold text-slate-500">
                        Designation
                      </th>

                      <th className="whitespace-nowrap border-b border-slate-200 px-3 py-3 font-semibold text-slate-500">
                        Mobile
                      </th>

                      <th className="whitespace-nowrap border-b border-slate-200 px-3 py-3 font-semibold text-slate-500">
                        Status
                      </th>

                      <th className="whitespace-nowrap border-b border-slate-200 px-3 py-3 font-semibold text-slate-500">
                        Days Remaining
                      </th>

                      <th className="whitespace-nowrap border-b border-slate-200 px-3 py-3 text-center font-semibold text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  {/* Body */}

                  <tbody>
                    {pageRows.map((record, index) => {
                      const isEffectivelyActive = record.isActive && !isExpired(record);

                      const expired = isExpired(record);
                      const expiringSoon = isExpiringSoon(record);

                      return (
                        <tr
                          key={record.id}
                          className={`
                            border-b border-slate-100
                            last:border-b-0
                            transition-colors
                            hover:bg-red-50/40
                            ${index % 2 === 0 ? "bg-white" : "bg-slate-50/40"}
                          `}
                        >
                          {/* ID */}

                          <td className="whitespace-nowrap px-3 py-3">
                            <span className="font-semibold text-slate-700">
                              {displayIdOf(tab, record) || "—"}
                            </span>
                          </td>

                          {/* Name */}

                          <td className="px-3 py-3">
                            <Link
                              to={detailsRouteOf(tab)}
                              params={{
                                slug: slugOf(tab, record),
                              }}
                              className="group flex items-center gap-2.5"
                            >
                              {/* Profile Image / User Icon */}
                              <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                                {photoOf(record) ? (
                                  <img
                                    src={photoOf(record)}
                                    alt={nameOf(tab, record) || "Profile"}
                                    className="h-full w-full object-cover"
                                    onError={(event) => {
                                      event.currentTarget.style.display = "none";
                                      event.currentTarget.nextElementSibling?.classList.remove(
                                        "hidden",
                                      );
                                    }}
                                  />
                                ) : null}

                                {/* Fallback User Icon */}
                                <div
                                  className={`h-full w-full items-center justify-center ${
                                    photoOf(record) ? "hidden" : "flex"
                                  }`}
                                >
                                  <User className="h-4 w-4 text-slate-400" />
                                </div>
                              </div>

                              {/* Name */}
                              <span className="min-w-0 truncate font-semibold text-slate-700 transition-colors group-hover:text-red-700 group-hover:underline">
                                {nameOf(tab, record) || "—"}
                              </span>
                            </Link>
                          </td>

                          {/* Designation */}

                          <td className="max-w-[180px] px-3 py-3">
                            <span className="block truncate text-slate-600">
                              {record.designation || "—"}
                            </span>
                          </td>

                          {/* Mobile */}

                          <td className="whitespace-nowrap px-3 py-3 text-slate-600">
                            {record.mobile || "—"}
                          </td>

                          {/* Status */}

                          <td className="whitespace-nowrap px-3 py-3">
                            <StatusBadge active={isEffectivelyActive} />
                          </td>

                          {/* Days Remaining */}

                          <td
                            className={`
                              whitespace-nowrap
                              px-3 py-3
                              font-semibold

                              ${
                                expired
                                  ? "text-red-600"
                                  : expiringSoon
                                    ? "text-amber-600"
                                    : "text-slate-600"
                              }
                            `}
                          >
                            {expiryLabel(daysRemaining(record))}
                          </td>

                          {/* Actions */}

                          <td className="whitespace-nowrap px-3 py-3">
                            <div className="flex justify-center gap-1">
                              {/* View */}

                              <Link
                                to={detailsRouteOf(tab)}
                                params={{
                                  slug: slugOf(tab, record),
                                }}
                                className="
                                  inline-flex h-8
                                  items-center gap-1
                                  rounded-[4px]
                                  px-2.5
                                  text-xs font-semibold
                                  text-slate-600
                                  transition-colors
                                  hover:bg-red-50
                                  hover:text-red-700
                                "
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View
                              </Link>

                              {/* Renew */}

                              <button
                                type="button"
                                onClick={() => openRenew(record)}
                                className="
                                  inline-flex h-8
                                  items-center gap-1
                                  rounded-[4px]
                                  px-2.5
                                  text-xs font-semibold
                                  text-emerald-700
                                  transition-colors
                                  hover:bg-emerald-50
                                  hover:text-emerald-800
                                "
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Renew
                              </button>

                              {/* Designation */}

                              <button
                                type="button"
                                onClick={() => openDesignation(record)}
                                className="
                                  inline-flex h-8
                                  items-center gap-1
                                  rounded-[4px]
                                  px-2.5
                                  text-xs font-semibold
                                  text-slate-600
                                  transition-colors
                                  hover:bg-red-50
                                  hover:text-red-700
                                "
                              >
                                <Tag className="h-3.5 w-3.5" />
                                Designation
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Scroll Hint */}

              <div className="border-t border-slate-100 bg-slate-50 px-3 py-1.5 text-center text-[11px] text-slate-400 sm:hidden">
                Swipe left/right to view the complete table
              </div>
            </div>

            {/* =================================================
                PAGINATION
            ================================================= */}

            {records.length > 0 && (
              <div className="mt-3 flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:text-[13px]">
                <p>
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {(safePage - 1) * PAGE_SIZE + 1}
                  </span>{" "}
                  –{" "}
                  <span className="font-semibold text-slate-700">
                    {Math.min(safePage * PAGE_SIZE, records.length)}
                  </span>{" "}
                  of <span className="font-semibold text-slate-700">{records.length}</span>
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="
                      h-8 rounded-md
                      border border-slate-300
                      bg-white px-3
                      text-xs font-semibold
                      text-slate-600
                      transition-colors
                      hover:border-red-700
                      hover:text-red-700
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    Previous
                  </button>

                  <span
                    className="
                      hidden h-8
                      items-center
                      rounded-md
                      border border-slate-200
                      bg-slate-50
                      px-3
                      text-xs font-semibold
                      text-slate-600
                      sm:flex
                    "
                  >
                    Page {safePage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="
                      h-8 rounded-md
                      border border-slate-300
                      bg-white px-3
                      text-xs font-semibold
                      text-slate-600
                      transition-colors
                      hover:border-red-700
                      hover:text-red-700
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =====================================================
          RENEW MODAL
      ===================================================== */}

      {renewTarget && (
        <Modal
          title={`Renew ${tab === "members" ? "Membership" : "Partnership"}`}
          description={`${
            nameOf(tab, renewTarget) || "This record"
          } — set the new validity details.`}
          onClose={closeRenew}
        >
          <form onSubmit={confirmRenew} className="space-y-4">
            {/* Date */}

            <label className="block text-[13px] font-semibold text-slate-700">
              New Validity To
              <input
                type="date"
                required
                value={renewDate}
                onChange={(event) => setRenewDate(event.target.value)}
                className={`${inputClass} mt-1 w-full`}
              />
            </label>

            {/* Amount */}

            <label className="block text-[13px] font-semibold text-slate-700">
              Amount Paid (₹)
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 5000"
                value={renewAmount}
                onChange={(event) => setRenewAmount(event.target.value)}
                className={`${inputClass} mt-1 w-full`}
              />
            </label>

            {/* Error */}

            {renewError && (
              <div
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 sm:text-[13px]"
              >
                {renewError}
              </div>
            )}

            {/* Buttons */}

            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeRenew}
                disabled={renewing}
                className="
                  h-9 rounded-md
                  bg-slate-100 px-4
                  text-xs font-semibold
                  text-slate-600
                  transition-colors
                  hover:bg-slate-200
                  disabled:opacity-50
                  sm:text-[13px]
                "
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={renewing}
                className="
                  inline-flex h-9
                  items-center justify-center
                  gap-2 rounded-md
                  bg-red-700 px-4
                  text-xs font-semibold
                  text-white
                  shadow-sm
                  transition-colors
                  hover:bg-red-800
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  sm:text-[13px]
                "
              >
                {renewing && <LoaderCircle className="h-4 w-4 animate-spin" />}

                {renewing ? "Renewing..." : "Renew"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* =====================================================
          DESIGNATION MODAL
      ===================================================== */}

      {designationTarget && (
        <Modal
          title="Change Designation"
          description={`${
            nameOf(tab, designationTarget) || "This record"
          } — update their designation.`}
          onClose={closeDesignation}
        >
          <form onSubmit={confirmDesignation} className="space-y-4">
            {/* Designation */}

            <label className="block text-[13px] font-semibold text-slate-700">
              Designation
              <div className="mt-1">
                <DesignationCombobox value={designationValue} onChange={setDesignationValue} />
              </div>
            </label>

            {/* Error */}

            {designationError && (
              <div
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 sm:text-[13px]"
              >
                {designationError}
              </div>
            )}

            {/* Buttons */}

            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDesignation}
                disabled={savingDesignation}
                className="
                  h-9 rounded-md
                  bg-slate-100 px-4
                  text-xs font-semibold
                  text-slate-600
                  transition-colors
                  hover:bg-slate-200
                  disabled:opacity-50
                  sm:text-[13px]
                "
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={savingDesignation}
                className="
                  inline-flex h-9
                  items-center justify-center
                  gap-2 rounded-md
                  bg-red-700 px-4
                  text-xs font-semibold
                  text-white
                  shadow-sm
                  transition-colors
                  hover:bg-red-800
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  sm:text-[13px]
                "
              >
                {savingDesignation && <LoaderCircle className="h-4 w-4 animate-spin" />}

                {savingDesignation ? "Saving..." : "Save Designation"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
