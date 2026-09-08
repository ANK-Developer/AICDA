import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, LoaderCircle, Users, UserCheck, UserX } from "lucide-react";
import { searchCities } from "@/lib/locations-api";

const STAT_CARD_ACCENTS = {
  sky: "bg-sky-50 text-sky-700",
  emerald: "bg-emerald-50 text-emerald-700",
  slate: "bg-slate-100 text-slate-500",
  amber: "bg-amber-50 text-amber-700",
  violet: "bg-violet-50 text-violet-700",
};

const STAT_CARD_HOVER_BORDERS = {
  sky: "hover:border-sky-300",
  emerald: "hover:border-emerald-300",
  slate: "hover:border-slate-400",
  amber: "hover:border-amber-300",
  violet: "hover:border-violet-300",
};

export function StatCard({ icon: Icon, label, value, accent = "slate" }) {
  return (
    <div
      className={`
        group
        rounded-xl
        border border-slate-200
        bg-white
        p-4
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-md
        ${STAT_CARD_HOVER_BORDERS[accent]}
      `}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Icon + Label */}
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`
              flex h-11 w-11 shrink-0
              items-center justify-center
              rounded-xl
              transition-transform
              duration-200
              group-hover:scale-105
              ${STAT_CARD_ACCENTS[accent]}
            `}
          >
            <Icon className="h-5 w-5" strokeWidth={2.2} />
          </span>

          <div className="min-w-0">
            <p className="truncate text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {label}
            </p>

            <p className="mt-1 text-2xl font-bold leading-none tracking-tight text-slate-800">
              {value ?? 0}
            </p>
          </div>
        </div>

        {/* Small decorative indicator */}
        <div
          className={`
            hidden h-2 w-2 shrink-0
            rounded-full
            sm:block
            ${STAT_CARD_ACCENTS[accent]}
          `}
        />
      </div>
    </div>
  );
}

export function MemberStatsCards({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 sm:gap-3">
      <StatCard icon={Users} label="Total Member" value={stats.total} accent="sky" />
      <StatCard icon={UserCheck} label="Active Member" value={stats.active} accent="emerald" />
      <StatCard icon={UserX} label="Inactive Member" value={stats.inactive} accent="slate" />
    </div>
  );
}

export const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Chandigarh",
  "Puducherry",
];

export const DESIGNATIONS = [
  "National President",
  "National Vice President",
  "National General Secretary",
  "National Secretary",
  "Joint Secretary",
  "Treasurer",
  "President",
  "Vice President",
  "Secretary",
  "Member",
  "Partner",
];

// Strips anything non-numeric as the user types and caps length — backs the
// Mobile/Aadhaar fields so bad characters never make it into the field at
// all, instead of only being caught by the server after submit.
export function digitsOnly(value, maxLength) {
  const digits = (value || "").replace(/\D/g, "");
  return maxLength ? digits.slice(0, maxLength) : digits;
}

export const inputClass =
  "h-8 w-full rounded-[3px] border border-slate-300 bg-white px-2 text-[13px] text-slate-800 outline-none transition-colors hover:border-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-200";

export const textareaClass =
  "w-full rounded-[3px] border border-slate-300 bg-white px-2 py-1 text-[13px] text-slate-800 outline-none transition-colors hover:border-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-200";

export function FieldRow({ label, required, error, children }) {
  return (
    <div className=" px-3 py-2 transition-colors">
      <label className="mb-1 block text-[13px] font-semibold text-slate-700">
        {label} {required && <span className="text-red-600">*</span>}:
      </label>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

// Appends red-border/focus-ring styles onto inputClass when a field has a
// validation error, so the input itself flags the problem alongside the
// message FieldRow renders underneath it.
export function fieldClass(hasError) {
  return hasError
    ? `${inputClass} border-red-400 focus:border-red-500 focus:ring-red-200`
    : inputClass;
}

export function SectionHeading({ children }) {
  return (
    <h3 className=" px-4 py-2 text-[13px] font-bold uppercase tracking-wide text-slate-500">
      {children}
    </h3>
  );
}

const MAX_SUGGESTIONS = 10;

// Tracks the anchor's on-screen position while a portaled dropdown is open,
// recomputing on scroll/resize so it stays pinned under the input.
function useDropdownPosition(open, anchorRef) {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (!open || !anchorRef.current) {
      setPosition(null);
      return;
    }
    const update = () => {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, anchorRef]);

  return position;
}

// Suggestion lists render into a portal (document.body) instead of as an
// `absolute` child, so they're never clipped — an absolutely positioned
// dropdown gets cut off the instant its anchor sits inside any scrollable
// ancestor, which every combobox here does once it's used inside a modal.
function DropdownPortal({ open, anchorRef, contentRef, children }) {
  const position = useDropdownPosition(open, anchorRef);
  if (!open || !position || typeof document === "undefined") return null;
  return createPortal(
    <div
      ref={contentRef}
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        width: position.width,
        zIndex: 9999,
      }}
    >
      {children}
    </div>,
    document.body,
  );
}

// Shared freeform-with-suggestions combobox: text input + filtered dropdown
// (top N matches), keyboard nav, click-outside close, and a fallback to use
// whatever was typed if nothing matches. Backs Designation, State, and
// District; City needs its own variant below since its suggestions come
// from the backend.
function SuggestCombobox({ value, onChange, options, placeholder, disabled }) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  const filtered = useMemo(() => {
    const query = value.trim().toLowerCase();
    const source = query
      ? options.filter((option) => option.toLowerCase().includes(query))
      : options;
    return source.slice(0, MAX_SUGGESTIONS);
  }, [value, options]);

  useEffect(() => {
    function handleClickOutside(event) {
      const insideAnchor = containerRef.current?.contains(event.target);
      const insideList = listRef.current?.contains(event.target);
      if (!insideAnchor && !insideList) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectOption = (option) => {
    onChange(option);
    setOpen(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setHighlighted((i) => Math.min(i + 1, filtered.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
      return;
    }
    if (event.key === "Enter" && open && filtered[highlighted]) {
      event.preventDefault();
      selectOption(filtered[highlighted]);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setHighlighted(0);
          setOpen(true);
        }}
        onFocus={() => !disabled && setOpen(true)}
        onKeyDown={disabled ? undefined : handleKeyDown}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        disabled={disabled}
        className={`${inputClass} pr-8 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}
      />
      <button
        type="button"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        tabIndex={-1}
        aria-label="Toggle options"
        disabled={disabled}
        className="absolute right-0 top-0 flex h-8 w-8 items-center justify-center text-slate-400 transition-colors hover:text-sky-600 disabled:cursor-not-allowed disabled:hover:text-slate-400"
      >
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <DropdownPortal open={open && !disabled} anchorRef={containerRef} contentRef={listRef}>
        <ul className="max-h-52 w-full origin-top animate-in overflow-auto rounded-lg border border-slate-200 bg-white p-1.5 text-[13px] shadow-xl fade-in-0 zoom-in-95 duration-150">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-slate-400">No matches — press Enter to use “{value}”</li>
          ) : (
            filtered.map((option, index) => (
              <li key={option}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectOption(option)}
                  onMouseEnter={() => setHighlighted(index)}
                  className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left transition-all duration-100 ${
                    index === highlighted
                      ? "scale-[1.02] bg-sky-50 text-sky-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {option}
                  {option === value && <Check className="h-3.5 w-3.5 text-sky-600" />}
                </button>
              </li>
            ))
          )}
        </ul>
      </DropdownPortal>
    </div>
  );
}

export function DesignationCombobox({ value, onChange }) {
  return (
    <SuggestCombobox
      value={value}
      onChange={onChange}
      options={DESIGNATIONS}
      placeholder="Type or choose a designation"
    />
  );
}

export function StateCombobox({ value, onChange }) {
  return (
    <SuggestCombobox
      value={value}
      onChange={onChange}
      options={STATES}
      placeholder="Type or choose a state"
    />
  );
}

const CITY_SEARCH_DEBOUNCE_MS = 350;

// City suggestions come from the backend (existing cities already entered
// anywhere), so this needs its own debounced-fetch variant instead of
// SuggestCombobox's synchronous in-memory filter. Freeform entry is always
// allowed — a brand-new city just gets created on save.
export function CityCombobox({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      const insideAnchor = containerRef.current?.contains(event.target);
      const insideList = listRef.current?.contains(event.target);
      if (!insideAnchor && !insideList) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      searchCities(value)
        .then(setSuggestions)
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    }, CITY_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [open, value]);

  return (
    <div ref={containerRef} className="relative">
      <input
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
          if (event.key === "Enter") {
            event.preventDefault();
            setOpen(false);
          }
        }}
        placeholder="Type or choose a city"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        className={inputClass}
      />

      <DropdownPortal open={open} anchorRef={containerRef} contentRef={listRef}>
        <ul className="max-h-52 w-full origin-top animate-in overflow-auto rounded-lg border border-slate-200 bg-white p-1.5 text-[13px] shadow-xl fade-in-0 zoom-in-95 duration-150">
          {loading ? (
            <li className="flex items-center gap-2 px-3 py-2 text-slate-400">
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Searching…
            </li>
          ) : suggestions.length === 0 ? (
            <li className="px-3 py-2 text-slate-400">
              No matches{value.trim() ? ` — press Enter to use “${value}”` : ""}
            </li>
          ) : (
            suggestions.map((city) => (
              <li key={city.id}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onChange(city.cityName);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left transition-all duration-100 ${
                    city.cityName === value
                      ? "scale-[1.02] bg-sky-50 text-sky-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {city.cityName}
                  {city.cityName === value && <Check className="h-3.5 w-3.5 text-sky-600" />}
                </button>
              </li>
            ))
          )}
        </ul>
      </DropdownPortal>
    </div>
  );
}

// Districts for whatever state is currently typed in — disabled until that
// state resolves to a known Indian state (see getDistrictsForStateName in
// lib/india-districts.js). Same typeahead combobox as State/Designation
// instead of a plain <select>, so it matches their look and feel.
export function DistrictSelect({ value, onChange, districts, disabled }) {
  return (
    <SuggestCombobox
      value={value}
      onChange={onChange}
      options={districts}
      placeholder={disabled ? "Select a state first" : "Type or choose a district"}
      disabled={disabled}
    />
  );
}

export function isExpired(record) {
  if (!record.validityTo) return false;
  const validityDate = new Date(record.validityTo);
  if (Number.isNaN(validityDate.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  validityDate.setHours(0, 0, 0, 0);
  return validityDate < today;
}

export const EXPIRING_SOON_DAYS = 7;

// Whole days between today and validityTo — negative once expired. Shares
// the same date-normalization as isExpired so the two never disagree.
export function daysRemaining(record) {
  if (!record?.validityTo) return null;
  const validityDate = new Date(record.validityTo);
  if (Number.isNaN(validityDate.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  validityDate.setHours(0, 0, 0, 0);
  return Math.round((validityDate - today) / 86400000);
}

// Plain-language wording for daysRemaining() so nobody has to do the math
// themselves: "7 days remaining" / "1 day remaining" / "Expires today" / "Expired".
export function expiryLabel(days) {
  if (days === null || days === undefined) return "—";
  if (days < 0) return "Expired";
  if (days === 0) return "Expires today";
  return `${days} day${days === 1 ? "" : "s"} remaining`;
}

export function isExpiringSoon(record) {
  return isWithinDays(record, EXPIRING_SOON_DAYS);
}

// Same idea as isExpiringSoon but with an admin-chosen threshold instead of
// the fixed default — backs the "Within __ days" input on the filter bar.
export function isWithinDays(record, days) {
  const remaining = daysRemaining(record);
  return remaining !== null && remaining >= 0 && remaining <= days;
}

// Mirrors every field the Member form collects, except Amount Paid and
// Note — the form itself labels those two "Optional". Any of the rest left
// blank marks the profile incomplete. Keyed by the same field name MemberForm
// uses in its own `form` state, so MemberForm can reuse this list to show a
// live "still missing" hint as the admin types, instead of only finding out
// after saving that something didn't count.
export const PROFILE_FIELD_KEYS = [
  ["memberId", "Member ID"],
  ["memberName", "Member Name"],
  ["fatherName", "Father's Name"],
  ["photo", "Photo"],
  ["residentialAddress", "Residential Address"],
  ["mobile", "Mobile"],
  ["residentialTelephone", "Residential Telephone"],
  ["panCardNo", "PAN Card No."],
  ["designation", "Designation"],
  ["companyName", "Company Name"],
  ["companyAddress", "Company Address"],
  ["state", "State"],
  ["district", "District"],
  // City is optional — a blank City never counts toward Profile Incomplete.
  ["companyTelephone", "Company Telephone"],
  ["packetNo", "Packet No."],
  ["dateOfJoining", "Date of Joining"],
  ["aadharNo", "Aadhar Card No."],
  ["validityTo", "Validity To"],
];

// The API returns state as a plain string on member records (unlike the
// object shape used elsewhere for e.g. partner lookups) — fall back to the
// object form too so this keeps working if that ever changes.
const PROFILE_FIELD_GETTERS = {
  state: (m) => m.state?.stateName || m.state,
};

const PROFILE_REQUIRED_FIELDS = PROFILE_FIELD_KEYS.map(([key, label]) => [
  label,
  PROFILE_FIELD_GETTERS[key] || ((m) => m[key]),
]);

export function getMissingProfileFields(member) {
  if (!member) return [];
  return PROFILE_REQUIRED_FIELDS.filter(
    ([, getField]) => !String(getField(member) || "").trim(),
  ).map(([label]) => label);
}

export function isProfileIncomplete(member) {
  return getMissingProfileFields(member).length > 0;
}

export function StatusBadge({ active, className = "" }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"} ${className}`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

// A visible on/off switch for the manual Active/Inactive flag — clicking it
// slides the knob and calls onClick, same as before, just no longer looks
// like plain colored text.
export function StatusToggle({ active, onClick, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className="inline-flex items-center gap-2"
    >
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${active ? "bg-emerald-500" : "bg-slate-300"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${active ? "translate-x-4" : "translate-x-0.5"}`}
        />
      </span>
      <span className={`text-xs font-semibold ${active ? "text-emerald-700" : "text-slate-600"}`}>
        {active ? "Active" : "Inactive"}
      </span>
    </button>
  );
}

export function ProfileIncompleteBadge({ missingFields = [] }) {
  return (
    <span
      title={missingFields.length ? `Missing: ${missingFields.join(", ")}` : undefined}
      className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700"
    >
      Profile Incomplete
    </span>
  );
}

// A renewal is meant to push the validity into the future — a date of today
// or earlier would save successfully but leave the member/partner expired
// again immediately, silently undoing the renewal.
export function isTodayOrPast(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date <= today;
}

// Human-readable but still unique: the name is cosmetic only, the trailing
// `-<id>` (the internal DB id GET /members/:id already looks up by) is what
// the details route actually uses — see parseMemberSlug. Duplicate member
// names never collide because of it.
export function buildMemberSlug(member) {
  const slug = (member.memberName || "member")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "member"}-${member.id}`;
}

export function parseMemberSlug(slug) {
  const match = /-(\d+)$/.exec(slug || "");
  return match ? match[1] : slug;
}

// Same cosmetic-name + trailing internal-id pattern as buildMemberSlug/
// parseMemberSlug, applied to partners.
export function buildPartnerSlug(partner) {
  const slug = (partner.partnerName || "partner")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "partner"}-${partner.id}`;
}

export function parsePartnerSlug(slug) {
  const match = /-(\d+)$/.exec(slug || "");
  return match ? match[1] : slug;
}
