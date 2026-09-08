import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  ArrowLeft,
  Eye,
  Handshake,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  deleteMember as deleteMemberRequest,
  getMembers,
  renewMember,
  toggleMemberStatus,
} from "@/lib/member-api";
import { getPartners } from "@/lib/partner-api";
import {
  buildMemberSlug,
  buildPartnerSlug,
  daysRemaining,
  expiryLabel,
  inputClass,
  isExpired,
  isExpiringSoon,
  isProfileIncomplete,
  isTodayOrPast,
  isWithinDays,
  MemberStatsCards,
  StatusToggle,
} from "./directory-shared";
import { MemberForm } from "./MemberForm";
import { PartnerForm } from "./PartnerForm";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;
const EXPIRING_DAYS_DEBOUNCE_MS = 400;
const LARGE_BATCH = 1000;
const DEFAULT_EXPIRING_DAYS = 7;
const MAX_SEARCH_SUGGESTIONS = 8;

// Filters the backend already understands as a `status` query param — these
// keep server-side pagination. Anything else is computed client-side below.
const SERVER_FILTERS = new Set(["all", "active", "inactive"]);

const FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "expiring", label: "Expiring Soon" },
  { value: "incomplete", label: "Profile Incomplete" },
];

function DirectoryCardSkeleton() {
  return (
    <div className="rounded-[3px] border border-slate-200 p-2.5">
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

// Same dropdown UX as the public /management search — Member ID/Partner ID
// plus name up top, designation · company underneath, so the admin can jump
// straight to a record instead of typing the full ID and waiting for it.
function SearchSuggestions({ suggestions, onSelect }) {
  if (suggestions.length === 0) return null;
  return (
    <ul className="absolute left-0 top-full z-20 mt-1 max-h-72 w-full overflow-auto rounded-[3px] border border-slate-200 bg-white py-1 text-[13px] shadow-lg">
      {suggestions.map((item) => (
        <li key={`${item.kind}-${item.id}`}>
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelect(item)}
            className="flex w-full flex-col items-start px-3 py-1.5 text-left transition-colors hover:bg-sky-50"
          >
            <span className="font-semibold text-slate-800">
              {item.displayId} — {item.name}
              {item.kind === "partner" && (
                <span className="ml-1.5 font-normal text-slate-400">(Partner)</span>
              )}
            </span>
            <span className="text-xs text-slate-500">
              {[item.designation, item.companyName].filter(Boolean).join(" · ")}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function DirectoryTableSkeleton({ columns = 6, rows = 5 }) {
  return (
    <div className="mt-3 hidden overflow-x-auto scrollbar-hide rounded-[3px] border border-slate-200 md:block">
      <table className="w-full min-w-175 text-left text-[13px]">
        <tbody>
          {Array.from({ length: rows }).map((_, index) => (
            <tr key={index} className="border-t border-slate-100 bg-white first:border-t-0">
              {Array.from({ length: columns }).map((__, colIndex) => (
                <td key={colIndex} className="px-2.5 py-2">
                  <Skeleton className="h-4 w-20" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DirectoryManagement() {
  // Lets dashboard cards deep-link a specific view, e.g.
  // /admin/directory?status=active — read once on mount so a manual filter
  // click afterward isn't fighting the URL on every render.
  const navigate = useNavigate();
  const routeSearch = useSearch({ strict: false });
  const initialStatusFilter = FILTERS.some((f) => f.value === routeSearch?.status)
    ? routeSearch.status
    : "all";
  const initialExpiringDays = Number(routeSearch?.days);
  const hasInitialExpiringDays = Number.isFinite(initialExpiringDays) && initialExpiringDays >= 0;

  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [listError, setListError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [page, setPage] = useState(1);
  const [partnerMatches, setPartnerMatches] = useState([]);
  const [suggestionPool, setSuggestionPool] = useState([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const searchBoxRef = useRef(null);
  const [expiringDaysInput, setExpiringDaysInput] = useState(
    String(hasInitialExpiringDays ? initialExpiringDays : DEFAULT_EXPIRING_DAYS),
  );
  const [expiringDays, setExpiringDays] = useState(
    hasInitialExpiringDays ? initialExpiringDays : DEFAULT_EXPIRING_DAYS,
  );
  const latestRequestId = useRef(0);

  const [renewTarget, setRenewTarget] = useState(null);
  const [renewDate, setRenewDate] = useState("");
  const [renewAmount, setRenewAmount] = useState("");
  const [renewing, setRenewing] = useState(false);
  const [renewError, setRenewError] = useState("");

  const [showAddPartner, setShowAddPartner] = useState(false);
  const [partnerPickerMembers, setPartnerPickerMembers] = useState([]);
  const [loadingPartnerPicker, setLoadingPartnerPicker] = useState(false);
  const [partnerFormMember, setPartnerFormMember] = useState(null);

  // Debounce the search box so we don't hit the API on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Same debounce pattern for the "expiring within N days" box — the field
  // stays freely editable (including briefly empty while retyping) and only
  // commits to the value that actually drives filtering/pagination once the
  // admin pauses.
  useEffect(() => {
    const timer = setTimeout(() => {
      const parsed = Math.max(0, Number(expiringDaysInput) || 0);
      setExpiringDays(parsed);
      setPage(1);
    }, EXPIRING_DAYS_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [expiringDaysInput]);

  // Loaded once for the search suggestion dropdown — same idea as the
  // public /management search box, filtered client-side on every keystroke
  // instead of round-tripping the server.
  useEffect(() => {
    let mounted = true;
    Promise.all([
      getMembers({ limit: LARGE_BATCH }).catch(() => ({ members: [] })),
      getPartners({ limit: LARGE_BATCH }).catch(() => []),
    ]).then(([memberResult, partnerResult]) => {
      if (!mounted) return;
      const memberSuggestions = (memberResult.members || []).map((member) => ({
        kind: "member",
        id: member.id,
        displayId: member.memberId,
        name: member.memberName,
        designation: member.designation,
        companyName: member.companyName,
        mobile: member.mobile,
      }));
      const partnerSuggestions = (partnerResult || []).map((partner) => ({
        kind: "partner",
        id: partner.id,
        displayId: partner.partnerId,
        name: partner.partnerName,
        designation: partner.designation,
        companyName: partner.companyName,
        mobile: partner.mobile,
      }));
      setSuggestionPool([...memberSuggestions, ...partnerSuggestions]);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setSuggestionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const suggestions = useMemo(() => {
    const query = searchInput.trim().toLowerCase();
    if (!query) return [];
    return suggestionPool
      .filter((item) =>
        [item.displayId, item.name, item.mobile].some((field) =>
          String(field || "")
            .toLowerCase()
            .includes(query),
        ),
      )
      .slice(0, MAX_SEARCH_SUGGESTIONS);
  }, [suggestionPool, searchInput]);

  const selectSuggestion = (item) => {
    const value = String(item.displayId ?? "");
    setSearchInput(value);
    setSearch(value);
    setPage(1);
    setSuggestionsOpen(false);
  };

  const loadMembers = async () => {
    // Requests can resolve out of order (a fast partner-fallback lookup
    // finishing after a slower plain search, for example) — only the most
    // recently *started* request is allowed to commit its result, so a
    // stale response can never overwrite what the admin is currently seeing.
    const requestId = ++latestRequestId.current;
    const isStale = () => requestId !== latestRequestId.current;

    setLoading(true);
    setListError("");
    try {
      let members;
      let pagination;
      let statsResult;

      if (SERVER_FILTERS.has(statusFilter)) {
        const result = await getMembers({ search, status: statusFilter, page, limit: PAGE_SIZE });
        members = result.members;
        pagination = result.pagination;
        statsResult = result.stats;
      } else {
        // Expiring Soon / Profile Incomplete aren't backend filters — fetch a
        // large batch once and filter/paginate on the client, same pattern
        // PartnerDirectory.jsx already uses for its whole list.
        const result = await getMembers({ search, limit: LARGE_BATCH });
        const matched = result.members.filter(
          statusFilter === "expiring" ? (m) => isWithinDays(m, expiringDays) : isProfileIncomplete,
        );
        const totalPages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE));
        const safePage = Math.min(page, totalPages);
        members = matched.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
        pagination = { page: safePage, limit: PAGE_SIZE, total: matched.length, totalPages };
        statsResult = result.stats;
      }

      // Nothing matched a member field directly — the admin may have typed
      // a Partner ID or partner name instead. Look up partners themselves
      // and show those directly (a single match opens straight to that
      // partner's own page) rather than wrapping the result in the linked
      // member's row.
      if (members.length === 0 && search) {
        const partnerResults = await getPartners({ search, limit: 5 }).catch(() => []);
        if (isStale()) return;

        if (partnerResults.length === 1) {
          navigate({
            to: "/admin/directory/partner/$slug/details",
            params: { slug: buildPartnerSlug(partnerResults[0]) },
          });
          return;
        }

        if (partnerResults.length > 1) {
          setPartnerMatches(partnerResults);
          setMembers([]);
          setPagination({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
          if (statsResult) setStats(statsResult);
          return;
        }
      }

      if (isStale()) return;
      setPartnerMatches([]);
      setMembers(members);
      setPagination(pagination);
      if (statsResult) setStats(statsResult);
    } catch (requestError) {
      if (isStale()) return;
      setListError(requestError.message || "Could not load members.");
    } finally {
      if (!isStale()) setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
    // Only re-run for expiringDays when that filter is actually active —
    // otherwise editing the box would trigger a pointless refetch of
    // whatever other filter is currently showing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, page, statusFilter === "expiring" ? expiringDays : null]);

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
    setSuggestionsOpen(false);
  };

  const editMember = (member) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const closeForm = () => {
    setEditingMember(null);
    setShowForm(false);
  };

  const handleSaved = async () => {
    closeForm();
    await loadMembers();
  };

  const performDelete = async (member) => {
    try {
      await deleteMemberRequest(member.id);
      await loadMembers();
      toast.success(`${member.memberName || "Member"} removed from the directory.`);
    } catch (requestError) {
      const message = requestError.message || "Could not delete member.";
      setListError(message);
      toast.error(message);
    }
  };

  const deleteMember = (member) => {
    toast(`Remove ${member.memberName || "this member"} from the directory?`, {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: () => performDelete(member),
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const toggleStatus = async (member) => {
    if (isExpired(member)) {
      toast(`${member.memberName || "This member"} is expired — use Renew to make them active.`);
      return;
    }
    try {
      await toggleMemberStatus(member.id);
      await loadMembers();
    } catch (requestError) {
      setListError(requestError.message || "Could not update member status.");
    }
  };

  const openAddPartner = async () => {
    setShowAddPartner(true);
    setLoadingPartnerPicker(true);
    try {
      const result = await getMembers({ limit: LARGE_BATCH });
      setPartnerPickerMembers(result.members);
    } catch (requestError) {
      toast.error(requestError.message || "Could not load members for the partner form.");
    } finally {
      setLoadingPartnerPicker(false);
    }
  };

  const closeAddPartner = () => {
    setShowAddPartner(false);
    setPartnerPickerMembers([]);
    setPartnerFormMember(null);
  };

  // Adding a partner from a specific member's row — the member is already
  // known, so skip the picker entirely.
  const openAddPartnerForMember = (member) => {
    setPartnerFormMember(member);
    setShowAddPartner(true);
  };

  const handlePartnerSaved = async () => {
    closeAddPartner();
    await loadMembers();
  };

  // member.partners (when the API includes it) has real partner IDs; the
  // list otherwise only carries a count via _count.partners.
  const partnerSummary = (member) => {
    const ids = Array.isArray(member.partners)
      ? member.partners.map((partner) => partner.partnerId).filter(Boolean)
      : [];
    if (ids.length === 0) return `${member._count?.partners ?? 0}`;
    const shown = ids.slice(0, 2).join(", ");
    return ids.length > 2 ? `${shown} +${ids.length - 2} more` : shown;
  };

  const openRenew = (member) => {
    setRenewTarget(member);
    setRenewDate(member.validityTo ? member.validityTo.slice(0, 10) : "");
    setRenewAmount("");
    setRenewError("");
  };

  const closeRenew = () => {
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
      await renewMember(renewTarget.id, {
        validityTo: renewDate,
        amount: renewAmount ? Number(renewAmount) : undefined,
      });
      await loadMembers();
      // Renewing always pushes validityTo into the future (validated above),
      // so isExpired will be false — the effective status is just whatever
      // isActive already was (renew doesn't touch that flag).
      toast.success(
        `${renewTarget.memberName || "Member"} renewed through ${renewDate}${
          renewAmount ? ` for ₹${renewAmount}` : ""
        }. Status: ${renewTarget.isActive ? "Active" : "Inactive"}.`,
      );
      closeRenew();
    } catch (requestError) {
      const message = requestError.message || "Could not renew member.";
      setRenewError(message);
      toast.error(message);
    } finally {
      setRenewing(false);
    }
  };

  return (
    <section className="space-y-2">
      <MemberStatsCards stats={stats} />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[3px] border border-slate-200 bg-white px-3 py-2">
        <h2 className="text-lg font-bold">Manage Directory</h2>
        {!showForm && (
          <div className="flex flex-wrap gap-2">
            <Link
              to="/admin/directory/create"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-[3px] bg-red-600 px-3 text-[13px] font-semibold text-white transition-colors hover:bg-red-700"
            >
              <Plus className="h-4 w-4" /> Add Member
            </Link>
            {/* <button
              type="button"
              onClick={openAddPartner}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-[3px] border border-red-600 px-3 text-[13px] font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              <Handshake className="h-4 w-4" /> Add Partner
            </button> */}
          </div>
        )}
      </div>

      {showForm && (
        <div className="rounded-[3px] border border-slate-200 bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={closeForm}
              className="inline-flex items-center gap-1 rounded-[3px] px-2 py-1 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-sky-700"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            {editingMember && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 whitespace-nowrap">
                Editing {editingMember.memberName || editingMember.memberId}
              </span>
            )}
          </div>
          <MemberForm member={editingMember} onCancel={closeForm} onSaved={handleSaved} />
        </div>
      )}

      {!showForm && (
        <div className="rounded-[3px] border border-slate-200 bg-white p-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div
              className="flex flex-wrap items-center gap-1.5"
              role="group"
              aria-label="Filter members"
            >
              {FILTERS.map((filter) => (
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
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <span ref={searchBoxRef} className="relative w-full lg:w-72 lg:shrink-0">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setSuggestionsOpen(true);
                }}
                onFocus={() => setSuggestionsOpen(true)}
                placeholder="Name, Member ID, Partner ID, mobile, or company…"
                aria-label="Search members"
                className="h-8 w-full rounded-[3px] border border-slate-200 py-1 pl-7 pr-7 text-[13px] outline-none transition-colors hover:border-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-200"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              {suggestionsOpen && (
                <SearchSuggestions suggestions={suggestions} onSelect={selectSuggestion} />
              )}
            </span>
          </div>

          {statusFilter === "expiring" && (
            <div className="mt-3 flex items-center gap-2 rounded-[3px] border border-slate-200 bg-slate-50 px-3 py-2">
              <label htmlFor="expiring-days" className="text-[13px] font-semibold text-slate-600">
                Show members expiring within
              </label>
              <input
                id="expiring-days"
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
                  <DirectoryCardSkeleton key={index} />
                ))}
              </div>
              <DirectoryTableSkeleton columns={8} />
            </>
          ) : partnerMatches.length > 0 ? (
            <div className="mt-3 space-y-2">
              <p className="rounded-[3px] bg-sky-50 px-3 py-2 text-[13px] text-sky-700">
                No member matched "{search}" directly — found {partnerMatches.length} matching
                partner{partnerMatches.length === 1 ? "" : "s"} instead.
              </p>
              <div className="divide-y divide-slate-100 rounded-[3px] border border-slate-200 bg-white">
                {partnerMatches.map((partner) => (
                  <Link
                    key={partner.id}
                    to="/admin/directory/partner/$slug/details"
                    params={{ slug: buildPartnerSlug(partner) }}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 text-[13px] transition-colors hover:bg-sky-50/60"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-800">
                        {partner.partnerName}{" "}
                        <span className="font-normal text-slate-500">· {partner.partnerId}</span>
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        Member: {partner.member?.memberName || "—"} · {partner.mobile || "—"}
                      </p>
                    </div>
                    <Eye className="h-4 w-4 shrink-0 text-slate-400" />
                  </Link>
                ))}
              </div>
            </div>
          ) : members.length === 0 ? (
            <div className="mt-3 flex min-h-48 flex-col items-center justify-center rounded-[3px] border border-dashed border-slate-200">
              <Users className="h-9 w-9 text-slate-300" />
              <p className="mt-3 text-[13px] font-semibold text-slate-500">
                {search ? "No members match your search" : "No members found"}
              </p>
            </div>
          ) : (
            <>
              <div className="mt-3 space-y-2 md:hidden">
                {members.map((member, index) => {
                  const isEffectivelyActive = member.isActive && !isExpired(member);
                  const serialNo = (pagination.page - 1) * pagination.limit + index + 1;
                  return (
                    <div
                      key={member.id}
                      className="rounded-[3px] border border-slate-200 p-2.5 transition-shadow hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <Link
                          to="/admin/directory/$slug/details"
                          params={{ slug: buildMemberSlug(member) }}
                          className="min-w-0 transition-colors hover:underline"
                        >
                          <p className="truncate text-[13px] font-semibold">
                            {serialNo}. {member.memberName}
                          </p>
                          <p className="text-xs text-slate-500">ID: {member.memberId}</p>
                        </Link>
                        <div className="shrink-0">
                          <StatusToggle
                            active={isEffectivelyActive}
                            onClick={() => toggleStatus(member)}
                            title={
                              isExpired(member) ? "Expired — use Renew to activate" : undefined
                            }
                          />
                        </div>
                      </div>
                      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                        <div>
                          <dt className="text-slate-400">Company</dt>
                          <dd className="truncate text-slate-600">{member.companyName || "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">Mobile</dt>
                          <dd className="truncate text-slate-600">{member.mobile || "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">Days Remaining</dt>
                          <dd
                            className={`truncate font-semibold ${isExpired(member) ? "text-red-600" : isExpiringSoon(member) ? "text-amber-600" : "text-slate-600"}`}
                          >
                            {expiryLabel(daysRemaining(member))}
                          </dd>
                        </div>
                      </dl>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2">
                        <Link
                          to="/admin/directory/$slug/details"
                          params={{ slug: buildMemberSlug(member) }}
                          className="inline-flex items-center gap-1 text-[13px] font-semibold text-slate-600 transition-colors hover:text-sky-700"
                        >
                          <Users className="h-3.5 w-3.5" /> Partners: {partnerSummary(member)}
                        </Link>
                        <div className="grid grid-cols-3 gap-1">
                          <button
                            onClick={() => openAddPartnerForMember(member)}
                            className="inline-flex items-center justify-center gap-1 rounded-[3px] px-1.5 py-1.5 text-[13px] font-semibold text-red-600 transition-colors hover:bg-red-50 active:scale-95"
                          >
                            <Handshake className="h-3.5 w-3.5" /> Add Partner
                          </button>
                          <Link
                            to="/admin/directory/$slug/details"
                            params={{ slug: buildMemberSlug(member) }}
                            className="inline-flex items-center justify-center gap-1 rounded-[3px] px-1.5 py-1.5 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-sky-50 hover:text-sky-700 active:scale-95"
                          >
                            <Eye className="h-3.5 w-3.5" /> View
                          </Link>
                          <button
                            onClick={() => openRenew(member)}
                            className="inline-flex items-center justify-center gap-1 rounded-[3px] px-1.5 py-1.5 text-[13px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 active:scale-95"
                          >
                            <RefreshCw className="h-3.5 w-3.5" /> Renew
                          </button>
                          <button
                            onClick={() => editMember(member)}
                            className="inline-flex items-center justify-center gap-1 rounded-[3px] px-1.5 py-1.5 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-sky-50 hover:text-sky-700 active:scale-95"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => deleteMember(member)}
                            className="inline-flex items-center justify-center gap-1 rounded-[3px] px-1.5 py-1.5 text-[13px] font-semibold text-red-600 transition-colors hover:bg-red-50 active:scale-95"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 hidden max-h-[70vh] overflow-auto scrollbar-hide rounded-[3px] border border-slate-200 md:block">
                <table className="w-full min-w-175 text-left text-[13px]">
                  <thead className="sticky top-0 z-10 bg-slate-50 text-slate-500 shadow-[0_1px_0_0] shadow-slate-200">
                    <tr>
                      {/* <th className="px-2.5 py-2">No</th> */}
                      <th className="px-2.5 py-2">Member ID</th>
                      <th className="px-2.5 py-2">Name</th>
                      <th className="px-2.5 py-2">Company</th>
                      <th className="px-2.5 py-2">Mobile</th>
                      <th className="px-2.5 py-2">Status</th>
                      <th className="px-2.5 py-2">Remaining</th>
                      <th className="px-2.5 py-2">Partners</th>
                      <th className="px-2.5 py-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member, index) => {
                      const isEffectivelyActive = member.isActive && !isExpired(member);
                      const serialNo = (pagination.page - 1) * pagination.limit + index + 1;
                      return (
                        <tr
                          key={member.id}
                          className="border-t border-slate-100 bg-white transition-colors hover:bg-sky-50/60"
                        >
                          {/* <td className="px-2.5 py-2 text-slate-500">{serialNo}</td> */}
                          <td className="px-2.5 py-2 font-medium">{member.memberId}</td>
                          <td className="px-2.5 py-2">
                            <Link
                              to="/admin/directory/$slug/details"
                              params={{ slug: buildMemberSlug(member) }}
                              className="transition-colors hover:text-sky-700 hover:underline"
                            >
                              {member.memberName}
                            </Link>
                          </td>
                          <td className="px-2.5 py-2 text-slate-600">
                            {member.companyName || "—"}
                          </td>
                          <td className="px-2.5 py-2 text-slate-600">{member.mobile || "—"}</td>
                          <td className="px-2.5 py-2">
                            <StatusToggle
                              active={isEffectivelyActive}
                              onClick={() => toggleStatus(member)}
                              title={
                                isExpired(member) ? "Expired — use Renew to activate" : undefined
                              }
                            />
                          </td>
                          <td
                            className={`px-2.5 py-2 font-semibold ${isExpired(member) ? "text-red-600" : isExpiringSoon(member) ? "text-amber-600" : "text-slate-600"}`}
                          >
                            {expiryLabel(daysRemaining(member))}
                          </td>
                          <td className="px-2.5 py-2">
                            <Link
                              to="/admin/directory/$slug/details"
                              params={{ slug: buildMemberSlug(member) }}
                              className="inline-flex items-center gap-1 font-semibold text-slate-600 transition-colors hover:text-sky-700"
                            >
                              <Users className="h-3.5 w-3.5" /> {partnerSummary(member)}
                            </Link>
                          </td>
                          <td className="px-2.5 py-2">
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={() => openAddPartnerForMember(member)}
                                className="inline-flex items-center gap-1 rounded-[3px] px-1.5 py-1 font-semibold text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 active:scale-95"
                              >
                                <Handshake className="h-3.5 w-3.5" /> Add Partner
                              </button>
                              <Link
                                to="/admin/directory/$slug/details"
                                params={{ slug: buildMemberSlug(member) }}
                                className="inline-flex items-center gap-1 rounded-[3px] px-1.5 py-1 font-semibold text-slate-600 transition-colors hover:bg-sky-50 hover:text-sky-700 active:scale-95"
                              >
                                <Eye className="h-3.5 w-3.5" /> View
                              </Link>
                              <button
                                onClick={() => openRenew(member)}
                                className="inline-flex items-center gap-1 rounded-[3px] px-1.5 py-1 font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 hover:text-emerald-800 active:scale-95"
                              >
                                <RefreshCw className="h-3.5 w-3.5" /> Renew
                              </button>
                              <button
                                onClick={() => editMember(member)}
                                className="inline-flex items-center gap-1 rounded-[3px] px-1.5 py-1 font-semibold text-slate-600 transition-colors hover:bg-sky-50 hover:text-sky-700 active:scale-95"
                              >
                                <Pencil className="h-3.5 w-3.5" /> Edit
                              </button>
                              {/* <button
                                onClick={() => deleteMember(member)}
                                className="inline-flex items-center gap-1 rounded-[3px] px-1.5 py-1 font-semibold text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 active:scale-95"
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
                Showing {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                {pagination.total}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-[3px] border border-slate-200 px-2.5 py-1 font-semibold transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  className="rounded-[3px] border border-slate-200 px-2.5 py-1 font-semibold transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showAddPartner && (
        <div
          className="fixed inset-0 z-50 flex animate-in items-start justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm fade-in-0 duration-150 sm:items-center"
          role="dialog"
          aria-modal="true"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeAddPartner();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") closeAddPartner();
          }}
        >
          <div className="my-8 flex max-h-[85vh] w-full max-w-2xl animate-in flex-col rounded-[3px] bg-white shadow-2xl zoom-in-95 duration-150 sm:my-0">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-[13px] font-bold uppercase tracking-wide text-slate-500">
                {partnerFormMember
                  ? `Add Partner — ${partnerFormMember.memberName || partnerFormMember.memberId}`
                  : "Add Partner"}
              </h3>
              <button
                type="button"
                onClick={closeAddPartner}
                aria-label="Close"
                className="rounded-[3px] p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              {partnerFormMember ? (
                <PartnerForm
                  members={[partnerFormMember]}
                  lockedMember={partnerFormMember}
                  onCancel={closeAddPartner}
                  onSaved={handlePartnerSaved}
                />
              ) : loadingPartnerPicker ? (
                <p className="py-8 text-center text-[13px] text-slate-500">Loading members…</p>
              ) : (
                <PartnerForm
                  members={partnerPickerMembers}
                  onCancel={closeAddPartner}
                  onSaved={handlePartnerSaved}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {renewTarget && (
        <div
          className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-slate-950/45 p-4 fade-in-0 duration-150"
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
            className="w-full max-w-sm animate-in rounded-[3px] bg-white p-5 shadow-2xl zoom-in-95 duration-150"
          >
            <h3 className="text-lg font-bold text-slate-800">Renew membership</h3>
            <p className="mt-1 text-sm text-slate-500">
              {renewTarget.memberName || "This member"} — set the new validity date.
            </p>
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
            {renewError && (
              <p role="alert" className="mt-2 text-[13px] text-red-600">
                {renewError}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeRenew}
                className="h-9 rounded-[3px] bg-slate-100 px-4 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={renewing}
                className="h-9 rounded-[3px] bg-emerald-600 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
              >
                {renewing ? "Renewing…" : "Renew Member"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
