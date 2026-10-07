import { useLazyGetMembersQuery } from "@/features/members/membersApi";
import {
  useDeletePartnerMutation,
  useLazyGetPartnersPageQuery,
  useRenewPartnerMutation,
  useTogglePartnerStatusMutation,
} from "@/features/partners/partnersApi";
import { useLazyCall, useMutate } from "@/services/api/useApiCall";
import { useEffect, useRef, useState } from "react";
import { AppLink as Link } from "@/components/common/AppLink";
import { ArrowLeft, Eye, Link2, Pencil, RefreshCw, Search, Trash2, Users } from "lucide-react";
import { toast } from "react-toastify";
import { confirmToast } from "@/lib/confirm-toast";
import { StatusChangeDialog } from "./StatusChangeDialog";
import { renewDefaults, RenewNoteField, ValidFromField } from "./RenewPeriodFields";
import { Skeleton } from "@/components/ui/skeleton";
import {
  buildPartnerSlug,
  buildPublicPartnerUrl,
  copyTextToClipboard,
  daysRemaining,
  expiryLabel,
  inputClass,
  isExpired,
  isExpiringSoon,
  statusTitle,
  statusToggleBlocker,
  isTodayOrPast,
  STATUS_FILTERS,
  StatusToggle,
} from "./directory-shared";
import { DirectoryTableSkeleton } from "./DirectoryManagement";
import { PartnerForm } from "./PartnerForm";

const PAGE_SIZE = 10;

const SEARCH_DEBOUNCE_MS = 400;

const DEFAULT_EXPIRING_DAYS = 7;

function PartnerCardSkeleton() {
  return (
    <div className="rounded-[3px] border border-slate-300 p-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-1">
            <Skeleton className="h-2.5 w-14" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PartnerDirectory() {
  const getMembers = useLazyCall(useLazyGetMembersQuery);
  const getPartnersPage = useLazyCall(useLazyGetPartnersPageQuery);
  const deletePartnerRequest = useMutate(useDeletePartnerMutation);
  const togglePartnerStatus = useMutate(useTogglePartnerStatusMutation);
  const renewPartner = useMutate(useRenewPartnerMutation);
  const [members, setMembers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const latestRequestId = useRef(0);

  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [listError, setListError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [expiringDaysInput, setExpiringDaysInput] = useState(String(DEFAULT_EXPIRING_DAYS));
  const [expiringDays, setExpiringDays] = useState(DEFAULT_EXPIRING_DAYS);

  const [renewTarget, setRenewTarget] = useState(null);
  const [renewDate, setRenewDate] = useState("");
  const [renewAmount, setRenewAmount] = useState("");
  const [renewNote, setRenewNote] = useState("");
  const [renewFrom, setRenewFrom] = useState("");
  const [renewing, setRenewing] = useState(false);
  const [renewError, setRenewError] = useState("");

  const [statusConfirmTarget, setStatusConfirmTarget] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Partners are searched, filtered and paginated by the backend. Only the most
  // recently started request may commit, so a slow older response can never
  // overwrite what the admin is looking at now.
  const loadAll = async () => {
    const requestId = ++latestRequestId.current;
    const isStale = () => requestId !== latestRequestId.current;

    setLoading(true);
    setListError("");
    try {
      const result = await getPartnersPage({
        search,
        status: statusFilter,
        expiringDays,
        page,
        limit: PAGE_SIZE,
      });
      if (isStale()) return;
      // The last row of the last page was removed — step back to the new last page.
      if (result.partners.length === 0 && page > 1 && result.pagination.total > 0) {
        setPage(Math.max(1, result.pagination.totalPages));
        return;
      }
      setPartners(result.partners);
      setPagination(result.pagination);
    } catch (requestError) {
      if (isStale()) return;
      const message = requestError.message || "Could not load partners.";
      setListError(message);
      toast.error(message);
    } finally {
      if (!isStale()) setLoading(false);
    }
  };

  // Members are only needed to pick the partner's member in the form.
  useEffect(() => {
    getMembers({ limit: 1000 })
      .then((result) => setMembers(result.members))
      .catch((requestError) => toast.error(requestError.message || "Could not load members."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Debounced so the box stays freely editable while retyping.
  useEffect(() => {
    const timer = setTimeout(() => {
      setExpiringDays(Math.max(0, Number(expiringDaysInput) || 0));
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [expiringDaysInput]);

  useEffect(() => {
    loadAll();
    // Only re-run for expiringDays while that filter is active.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, page, statusFilter === "expiring" ? expiringDays : null]);

  const pageRows = partners;
  const currentPage = pagination.page;
  const totalPages = pagination.totalPages;

  const editPartner = (partner) => {
    setEditingPartner(partner);
    setShowForm(true);
  };

  const closeForm = () => {
    setEditingPartner(null);
    setShowForm(false);
  };

  const handleSaved = async () => {
    closeForm();
    await loadAll();
  };

  const performDelete = async (partner) => {
    try {
      await deletePartnerRequest(partner.id);
      await loadAll();
      toast.success(`${partner.partnerName || "Partner"} removed from the directory.`);
    } catch (requestError) {
      const message = requestError.message || "Could not delete partner.";
      setListError(message);
      toast.error(message);
    }
  };

  // Manual Active / Inactive (with a reason). Plan expiry is separate and is
  // shown from the backend's membership status.
  const toggleStatus = (partner) => {
    const blocker = statusToggleBlocker(partner, partner.partnerName || "This partner");
    if (blocker) {
      toast(blocker);
      return;
    }
    setStatusConfirmTarget(partner);
  };

  const confirmToggleStatus = async (isActive, reason) => {
    if (!statusConfirmTarget) return;

    setStatusUpdating(true);

    try {
      await togglePartnerStatus({ id: statusConfirmTarget.id, isActive, reason });
      await loadAll();
      toast.success(
        isActive
          ? `${statusConfirmTarget.partnerName || "Partner"} activated.`
          : `${statusConfirmTarget.partnerName || "Partner"} deactivated.`,
      );
      setStatusConfirmTarget(null);
    } catch (requestError) {
      const message = requestError.message || "Could not update partner status.";
      setListError(message);
      toast.error(message);
    } finally {
      setStatusUpdating(false);
    }
  };

  const copyPartnerLink = async (partner) => {
    const url = buildPublicPartnerUrl(partner);
    try {
      await copyTextToClipboard(url);
      toast.success("Public profile link copied — paste it in any browser to view.");
    } catch {
      toast.error("Could not copy the link.");
    }
  };

  const deletePartner = (partner) => {
    confirmToast({
      title: `Remove ${partner.partnerName || "this partner"} from the directory?`,
      description: "This action cannot be undone.",
      onConfirm: () => performDelete(partner),
    });
  };

  const openRenew = (partner) => {
    setRenewTarget(partner);
    setRenewDate(partner.validityTo ? partner.validityTo.slice(0, 10) : "");
    setRenewAmount("");
    setRenewNote("");
    const defaults = renewDefaults(partner);
    setRenewFrom(defaults.from);
    setRenewError("");
  };

  const closeRenew = () => {
    setRenewTarget(null);
    setRenewDate("");
    setRenewAmount("");
    setRenewNote("");
    setRenewFrom("");
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
    if (!renewFrom) {
      setRenewError("Choose the Valid From date.");
      return;
    }
    if (renewAmount && Number(renewAmount) < 0) {
      setRenewError("Amount cannot be negative.");
      return;
    }
    setRenewing(true);
    setRenewError("");
    try {
      await renewPartner({
        id: renewTarget.id,
        validityFrom: renewFrom,
        validityTo: renewDate,
        amount: renewAmount ? Number(renewAmount) : undefined,
        note: renewNote.trim() || undefined,
      });
      await loadAll();
      toast.success(
        `${renewTarget.partnerName || "Partner"} renewed through ${renewDate}. Status: ${renewTarget.isActive ? "Active" : "Inactive"}.`,
      );
      closeRenew();
    } catch (requestError) {
      const message = requestError.message || "Could not renew partner.";
      setRenewError(message);
      toast.error(message);
    } finally {
      setRenewing(false);
    }
  };

  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[3px] border border-slate-300 bg-white px-3 py-2">
        <h2 className="text-lg font-bold">Manage Partners</h2>
      </div>

      {showForm && (
        <div className="rounded-[3px] border border-slate-300 bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={closeForm}
              className="inline-flex items-center gap-1 rounded-[3px] px-2 py-1 text-[13px] font-semibold text-slate-600 hover:bg-slate-100 hover:text-sky-700"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            {editingPartner && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 whitespace-nowrap">
                Editing {editingPartner.partnerName}
              </span>
            )}
          </div>
          <PartnerForm
            partner={editingPartner}
            members={members}
            onCancel={closeForm}
            onSaved={handleSaved}
          />
        </div>
      )}

      {!showForm && (
        <div className="rounded-[3px] border border-slate-300 bg-white p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter partners">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => {
                    setStatusFilter(filter.value);
                    setPage(1);
                  }}
                  className={`h-8 rounded-full px-3 text-[13px] font-semibold transition-colors ${
                    statusFilter === filter.value
                      ? "bg-red-600 text-white"
                      : "border border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-[13px] text-slate-600">
              Search:
              <span className="relative">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Partner ID, name, member, mobile, or company…"
                  className="h-8 w-full rounded-[3px] border border-slate-300 py-1 pl-7 pr-2 text-[13px] sm:w-72"
                />
              </span>
            </label>
          </div>

          {statusFilter === "expiring" && (
            <div className="mt-3 flex items-center gap-2 rounded-[3px] border border-slate-200 bg-slate-50 px-3 py-2">
              <label
                htmlFor="partner-expiring-days"
                className="text-[13px] font-semibold text-slate-600"
              >
                Show partners expiring within
              </label>
              <input
                id="partner-expiring-days"
                type="number"
                min="0"
                value={expiringDaysInput}
                onChange={(e) => setExpiringDaysInput(e.target.value)}
                className="h-8 w-20 rounded-[3px] border border-slate-200 bg-white px-2 text-[13px] outline-none transition-colors hover:border-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-200"
              />
              <span className="text-[13px] text-slate-600">days</span>
            </div>
          )}

          {listError && (
            <p
              role="alert"
              className="mt-3 rounded-[3px] bg-red-50 px-3 py-2 text-[13px] text-red-700"
            >
              {listError}
            </p>
          )}

          {loading ? (
            <>
              <div className="mt-3 space-y-2 md:hidden">
                {Array.from({ length: 5 }).map((_, index) => (
                  <PartnerCardSkeleton key={index} />
                ))}
              </div>
              <DirectoryTableSkeleton columns={8} />
            </>
          ) : pageRows.length === 0 ? (
            <div className="mt-3 flex min-h-48 flex-col items-center justify-center rounded-[3px] border border-dashed border-slate-300">
              <Users className="h-9 w-9 text-slate-300" />
              <p className="mt-3 text-[13px] font-semibold text-slate-500">No partners found</p>
            </div>
          ) : (
            <>
              <div className="mt-3 space-y-2 md:hidden">
                {pageRows.map((partner) => {
                  const isEffectivelyActive = partner.isActive && !isExpired(partner);
                  return (
                    <div key={partner.id} className="rounded-[3px] border border-slate-300 p-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold">
                            {partner.partnerName}
                          </p>
                          <p className="text-xs text-slate-500">ID: {partner.partnerId}</p>
                        </div>
                        <div className="shrink-0">
                          <StatusToggle
                            active={isEffectivelyActive}
                            onClick={() => toggleStatus(partner)}
                            title={statusTitle(partner)}
                          />
                        </div>
                      </div>
                      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                        <div>
                          <dt className="text-slate-400">Member</dt>
                          <dd className="truncate text-slate-600">
                            {partner.member?.memberName || "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">Company</dt>
                          <dd className="truncate text-slate-600">{partner.companyName || "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">Mobile</dt>
                          <dd className="truncate text-slate-600">{partner.mobile || "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">Designation</dt>
                          <dd className="truncate text-slate-600">{partner.designation || "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">Days Remaining</dt>
                          <dd
                            className={`truncate font-semibold ${isExpired(partner) ? "text-red-600" : isExpiringSoon(partner) ? "text-amber-600" : "text-slate-600"}`}
                          >
                            {expiryLabel(daysRemaining(partner))}
                          </dd>
                        </div>
                      </dl>
                      <div className="mt-2 flex flex-wrap justify-end gap-4 border-t border-slate-100 pt-2">
                        <button
                          onClick={() => openRenew(partner)}
                          className="inline-flex items-center gap-1 text-[13px] font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                          <RefreshCw className="h-3.5 w-3.5" /> Renew
                        </button>
                        <Link
                          to="/admin/directory/partner/$slug/details"
                          params={{ slug: buildPartnerSlug(partner) }}
                          className="inline-flex items-center gap-1 text-[13px] font-semibold text-slate-600 hover:text-sky-700"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </Link>
                        <button
                          onClick={() => editPartner(partner)}
                          className="inline-flex items-center gap-1 text-[13px] font-semibold text-slate-600 hover:text-sky-700"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => copyPartnerLink(partner)}
                          className="inline-flex items-center gap-1 text-[13px] font-semibold text-sky-700"
                        >
                          <Link2 className="h-3.5 w-3.5" /> Copy Link
                        </button>
                        <button
                          onClick={() => deletePartner(partner)}
                          className="inline-flex items-center gap-1 text-[13px] font-semibold text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 hidden overflow-x-auto scrollbar-hide rounded-[3px] border border-slate-300 md:block">
                <table className="w-full min-w-175 text-left text-[13px]">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-2.5 py-2">Partner ID</th>
                      <th className="px-2.5 py-2">Name</th>
                      <th className="px-2.5 py-2">Member</th>
                      <th className="px-2.5 py-2">Company</th>
                      <th className="px-2.5 py-2">Mobile</th>
                      <th className="px-2.5 py-2">Status</th>
                      <th className="px-2.5 py-2">Days Remaining</th>
                      <th className="px-2.5 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((partner, index) => {
                      const isEffectivelyActive = partner.isActive && !isExpired(partner);
                      return (
                        <tr
                          key={partner.id}
                          className={`border-t border-slate-200 ${index % 2 === 0 ? "bg-rose-50/70" : "bg-white"}`}
                        >
                          <td className="px-2.5 py-2 font-medium">{partner.partnerId}</td>
                          <td className="px-2.5 py-2">{partner.partnerName}</td>
                          <td className="px-2.5 py-2 text-slate-600">
                            {partner.member?.memberName || "—"}{" "}
                            {partner.member?.memberId ? `(#${partner.member.memberId})` : ""}
                          </td>
                          <td className="px-2.5 py-2 text-slate-600">
                            {partner.companyName || "—"}
                          </td>
                          <td className="px-2.5 py-2 text-slate-600">{partner.mobile || "—"}</td>
                          <td className="px-2.5 py-2">
                            <StatusToggle
                              active={isEffectivelyActive}
                              onClick={() => toggleStatus(partner)}
                              title={statusTitle(partner)}
                            />
                          </td>
                          <td
                            className={`px-2.5 py-2 font-semibold ${isExpired(partner) ? "text-red-600" : isExpiringSoon(partner) ? "text-amber-600" : "text-slate-600"}`}
                          >
                            {expiryLabel(daysRemaining(partner))}
                          </td>
                          <td className="px-2.5 py-2">
                            <div className="flex justify-end gap-3">
                              <button
                                onClick={() => openRenew(partner)}
                                className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800"
                              >
                                <RefreshCw className="h-3.5 w-3.5" /> Renew
                              </button>
                              <Link
                                to="/admin/directory/partner/$slug/details"
                                params={{ slug: buildPartnerSlug(partner) }}
                                className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-sky-700"
                              >
                                <Eye className="h-3.5 w-3.5" /> View
                              </Link>
                              <button
                                onClick={() => editPartner(partner)}
                                className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-sky-700"
                              >
                                <Pencil className="h-3.5 w-3.5" /> Edit
                              </button>
                              <button
                                onClick={() => copyPartnerLink(partner)}
                                title="Copy public profile link"
                                className="inline-flex items-center gap-1 font-semibold text-sky-700"
                              >
                                <Link2 className="h-3.5 w-3.5" /> Copy Link
                              </button>
                              {/* <button
                                onClick={() => deletePartner(partner)}
                                className="inline-flex items-center gap-1 font-semibold text-red-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </button> */}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {pagination.total > 0 && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[13px] text-slate-500">
              <p>
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-[3px] border border-slate-300 px-2.5 py-1 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-[3px] border border-slate-300 px-2.5 py-1 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {renewTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
          role="dialog"
          aria-modal="true"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeRenew();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") closeRenew();
          }}
        >
          <form
            onSubmit={confirmRenew}
            className="w-full max-w-sm rounded-[3px] bg-white p-5 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-slate-800">Renew partner</h3>
            <p className="mt-1 text-sm text-slate-500">
              {renewTarget.partnerName || "This partner"} — set the new validity date.
            </p>
            <ValidFromField
              record={renewTarget}
              value={renewFrom}
              onChange={setRenewFrom}
              disabled={renewing}
            />
            <label className="mt-4 block text-[13px] font-semibold text-slate-700">
              New Validity To
              <input
                type="date"
                required
                value={renewDate}
                onChange={(e) => setRenewDate(e.target.value)}
                className={`${inputClass} mt-1`}
              />
            </label>
            <label className="mt-3 block text-[13px] font-semibold text-slate-700">
              Amount Paid (₹)
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 5000"
                value={renewAmount}
                onChange={(e) => setRenewAmount(e.target.value)}
                className={`${inputClass} mt-1`}
              />
            </label>
            <RenewNoteField value={renewNote} onChange={setRenewNote} disabled={renewing} />
            {renewError && (
              <p role="alert" className="mt-2 text-[13px] text-red-600">
                {renewError}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeRenew}
                className="h-9 rounded-[3px] bg-slate-100 px-4 text-[13px] font-semibold text-slate-600 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={renewing}
                className="h-9 rounded-[3px] bg-emerald-600 px-4 text-[13px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {renewing ? "Renewing…" : "Renew Partner"}
              </button>
            </div>
          </form>
        </div>
      )}

      <StatusChangeDialog
        target={statusConfirmTarget}
        noun="partner"
        name={statusConfirmTarget?.partnerName}
        updating={statusUpdating}
        onConfirm={confirmToggleStatus}
        onClose={() => setStatusConfirmTarget(null)}
      />
    </section>
  );
}
