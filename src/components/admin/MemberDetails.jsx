import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Download,
  Eye,
  FileDown,
  Image as ImageIcon,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Users,
  X,
  CreditCard,
  MapPin,
  Phone,
  Building2,
  UserRound,
} from "lucide-react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { getMediaUrl } from "@/lib/config";

import { Skeleton } from "@/components/ui/skeleton";
import { getMemberDetails, renewMember } from "@/lib/member-api";

import {
  buildPartnerSlug,
  daysRemaining,
  expiryLabel,
  inputClass,
  isExpired,
  isTodayOrPast,
  parseMemberSlug,
  StatusBadge,
} from "./directory-shared";

import { MemberPrintableForm } from "./MemberPrintableForm";
import { PartnerForm } from "./PartnerForm";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="flex min-w-0 items-start gap-2.5 rounded-[4px] px-2 py-2 transition-colors hover:bg-slate-50">
      {Icon && (
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] bg-slate-100 text-slate-500">
          <Icon className="h-3.5 w-3.5" />
        </div>
      )}

      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>

        <p className="mt-0.5 break-words text-[13px] font-medium text-slate-700">{value || "—"}</p>
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function toCsvCell(value) {
  const text = value == null ? "" : String(value);

  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function sanitizeFileName(value, fallback) {
  const name = String(value || fallback)
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, "_");

  return name || fallback;
}

function downloadRenewalsCsv(member) {
  const renewals = Array.isArray(member?.renewals) ? member.renewals : [];

  if (!renewals.length) {
    toast.info("No payment history available.");
    return;
  }

  const currentRenewalId = renewals[0]?.id;

  const rows = [
    ["Payment Date", "Amount (₹)", "Validity From", "Validity To", "Note", "Current"],
    ...renewals.map((renewal) => [
      formatDate(renewal.paymentDate) || "",
      renewal.amount ?? "",
      formatDate(renewal.validityFrom) || "",
      formatDate(renewal.validityTo) || "",
      renewal.note || "",
      renewal.id === currentRenewalId ? "Yes" : "No",
    ]),
  ];

  const csv = rows.map((row) => row.map(toCsvCell).join(",")).join("\r\n");

  // UTF-8 BOM helps Excel correctly detect UTF-8 CSV files.
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${sanitizeFileName(member.memberName, "member")}_payment_history.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

async function downloadMemberFormImage(node, fileName) {
  if (!node) {
    throw new Error("Printable form is not available.");
  }

  const dataUrl = await toPng(node, {
    pixelRatio: 2,
    backgroundColor: "#ffffff",
    cacheBust: true,
  });

  const link = document.createElement("a");

  link.href = dataUrl;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                   */
/* -------------------------------------------------------------------------- */

function DetailsSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
      {/* Profile */}
      <div className="rounded-[5px] border border-slate-200 bg-white p-5">
        <Skeleton className="mx-auto h-40 w-40 rounded-[5px]" />

        <Skeleton className="mx-auto mt-4 h-5 w-36" />

        <Skeleton className="mx-auto mt-2 h-3.5 w-24" />

        <Skeleton className="mx-auto mt-4 h-6 w-20 rounded-full" />
      </div>

      {/* Content */}
      <div className="space-y-4">
        <div className="rounded-[5px] border border-slate-200 bg-white p-5">
          <Skeleton className="mb-4 h-4 w-40" />

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-[4px]" />
            ))}
          </div>
        </div>

        <div className="rounded-[5px] border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-28 rounded-[4px]" />
          </div>

          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-[4px]" />
            ))}
          </div>
        </div>

        <div className="rounded-[5px] border border-slate-200 bg-white p-5">
          <Skeleton className="mb-4 h-4 w-44" />

          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full rounded-[4px]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export function MemberDetails({ slug }) {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);

  const [downloadingForm, setDownloadingForm] = useState(false);
  const printableFormRef = useRef(null);

  const [showRenew, setShowRenew] = useState(false);
  const [renewDate, setRenewDate] = useState("");
  const [renewAmount, setRenewAmount] = useState("");
  const [renewing, setRenewing] = useState(false);
  const [renewError, setRenewError] = useState("");

  /* ------------------------------------------------------------------------ */
  /* Load Member                                                              */
  /* ------------------------------------------------------------------------ */

  const loadMember = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getMemberDetails(parseMemberSlug(slug));
      setMember(data);
      return data;
    } catch (requestError) {
      const message = requestError?.message || "Could not load this member.";

      setMember(null);
      setError(message);

      throw requestError;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const fetchMember = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getMemberDetails(parseMemberSlug(slug));

        if (mounted) {
          setMember(data);
        }
      } catch (requestError) {
        if (mounted) {
          setMember(null);
          setError(requestError?.message || "Could not load this member.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchMember();

    return () => {
      mounted = false;
    };
  }, [slug]);

  /* ------------------------------------------------------------------------ */
  /* Derived Values                                                           */
  /* ------------------------------------------------------------------------ */

  const isEffectivelyActive = member ? Boolean(member.isActive && !isExpired(member)) : false;

  const validityHint = member ? expiryLabel(daysRemaining(member)) : null;

  const currentRenewalId = member?.renewals?.[0]?.id;

  const partners = Array.isArray(member?.partners) ? member.partners : [];

  const renewals = Array.isArray(member?.renewals) ? member.renewals : [];

  /* ------------------------------------------------------------------------ */
  /* Partner                                                                  */
  /* ------------------------------------------------------------------------ */

  const openNewPartnerForm = () => {
    setEditingPartner(null);
    setShowPartnerForm(true);
  };

  const openEditPartnerForm = (partner) => {
    setEditingPartner(partner);
    setShowPartnerForm(true);
  };

  const closePartnerForm = () => {
    setEditingPartner(null);
    setShowPartnerForm(false);
  };

  const handlePartnerSaved = async () => {
    closePartnerForm();

    try {
      await loadMember();
    } catch {
      // loadMember already handles the error state.
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Download Form                                                            */
  /* ------------------------------------------------------------------------ */

  const handleDownloadForm = async () => {
    if (!printableFormRef.current || downloadingForm || !member) {
      return;
    }

    setDownloadingForm(true);

    try {
      const baseName = sanitizeFileName(member.memberName, "member");

      await downloadMemberFormImage(printableFormRef.current, `${baseName}_member_form.png`);

      toast.success("Member form downloaded successfully.");
    } catch (requestError) {
      console.error("Form download error:", requestError);

      toast.error("Couldn't generate the form. Please try again.");
    } finally {
      setDownloadingForm(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Renewal                                                                  */
  /* ------------------------------------------------------------------------ */

  const openRenew = () => {
    if (!member) return;

    setRenewDate(member.validityTo ? String(member.validityTo).slice(0, 10) : "");

    setRenewAmount("");
    setRenewError("");
    setShowRenew(true);
  };

  const closeRenew = () => {
    if (renewing) return;

    setShowRenew(false);
    setRenewDate("");
    setRenewAmount("");
    setRenewError("");
  };

  const confirmRenew = async (event) => {
    event.preventDefault();

    if (!member) {
      return;
    }

    if (!renewDate) {
      setRenewError("Please choose the new validity date.");
      return;
    }

    if (isTodayOrPast(renewDate)) {
      setRenewError("Validity date must be after today.");
      return;
    }

    if (renewAmount !== "") {
      const amount = Number(renewAmount);

      if (!Number.isFinite(amount)) {
        setRenewError("Please enter a valid amount.");
        return;
      }

      if (amount < 0) {
        setRenewError("Amount cannot be negative.");
        return;
      }
    }

    setRenewing(true);
    setRenewError("");

    try {
      await renewMember(member.id, {
        validityTo: renewDate,
        amount: renewAmount !== "" ? Number(renewAmount) : undefined,
      });

      const updatedMember = await loadMember();

      toast.success(`${member.memberName || "Member"} renewed successfully.`);

      closeRenew();

      // Keep state fresh after renewal.
      if (updatedMember) {
        setMember(updatedMember);
      }
    } catch (requestError) {
      const message = requestError?.message || "Could not renew member.";

      setRenewError(message);
      toast.error(message);
    } finally {
      setRenewing(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <section className="space-y-4">
      {/* ------------------------------------------------------------------ */}
      {/* Top Bar                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-col gap-3 rounded-[5px] border border-slate-200 bg-white px-3 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/admin/directory"
          className="inline-flex w-fit items-center gap-1.5 rounded-[4px] px-2 py-1.5 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-sky-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Directory
        </Link>

        {member && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openRenew}
              className="inline-flex h-9 items-center gap-1.5 rounded-[4px] bg-emerald-600 px-3 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Renew
            </button>

            <button
              type="button"
              onClick={handleDownloadForm}
              disabled={downloadingForm}
              className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-slate-300 bg-white px-3 text-[13px] font-semibold text-slate-600 transition-all hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {downloadingForm ? (
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileDown className="h-3.5 w-3.5" />
              )}

              {downloadingForm ? "Generating..." : "Download Form"}
            </button>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Error                                                               */}
      {/* ------------------------------------------------------------------ */}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-[5px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700"
        >
          <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />

          <div className="min-w-0">
            <p className="font-semibold">Unable to load member</p>

            <p className="mt-0.5 text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Loading                                                             */}
      {/* ------------------------------------------------------------------ */}

      {loading ? (
        <DetailsSkeleton />
      ) : !member ? (
        !error && (
          <div className="rounded-[5px] border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <UserRound className="h-6 w-6 text-slate-400" />
            </div>

            <h3 className="mt-3 text-sm font-semibold text-slate-700">Member not found</h3>

            <p className="mt-1 text-[13px] text-slate-500">
              The requested member could not be found.
            </p>

            <Link
              to="/admin/directory"
              className="mt-4 inline-flex h-8 items-center rounded-[4px] bg-slate-800 px-3 text-[13px] font-semibold text-white hover:bg-slate-900"
            >
              Return to Directory
            </Link>
          </div>
        )
      ) : (
        <div className="grid gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
          {/* ============================================================ */}
          {/* MEMBER PROFILE                                                */}
          {/* ============================================================ */}

          <aside className="h-fit rounded-[5px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col items-center">
              {member.photo ? (
                <div className="overflow-hidden rounded-[5px] border border-slate-200 bg-slate-50">
                  <img
                    src={getMediaUrl(member.photo)}
                    alt={member.memberName || "Member"}
                    className="h-40 w-40 object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-40 w-40 items-center justify-center rounded-[5px] border border-dashed border-slate-300 bg-slate-50 text-slate-300">
                  <ImageIcon className="h-12 w-12" />
                </div>
              )}

              <h2 className="mt-4 max-w-full truncate text-center text-lg font-bold text-slate-800">
                {member.memberName || "Unnamed Member"}
              </h2>

              <div className="mt-1 flex items-center gap-1.5 text-[12px] text-slate-500">
                <span>Member ID:</span>

                <span className="font-semibold text-slate-700">{member.memberId || "—"}</span>
              </div>

              <div className="mt-3">
                <StatusBadge active={isEffectivelyActive} />
              </div>
            </div>

            {/* Validity Summary */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-sky-50 text-sky-600">
                  <CalendarDays className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Membership Valid Until
                  </p>

                  <p className="mt-0.5 text-[13px] font-semibold text-slate-700">
                    {formatDate(member.validityTo) || "—"}
                  </p>
                </div>
              </div>

              {validityHint && (
                <div className="mt-3 rounded-[4px] bg-slate-50 px-3 py-2 text-[12px] text-slate-600">
                  {validityHint}
                </div>
              )}
            </div>
          </aside>

          {/* ============================================================ */}
          {/* MAIN CONTENT                                                  */}
          {/* ============================================================ */}

          <div className="min-w-0 space-y-4">
            {/* ---------------------------------------------------------- */}
            {/* Member Information                                         */}
            {/* ---------------------------------------------------------- */}

            <div className="rounded-[5px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Member Information</h3>

                  <p className="mt-0.5 text-[12px] text-slate-400">
                    Personal and professional details
                  </p>
                </div>

                <div className="hidden h-8 w-8 items-center justify-center rounded-[4px] bg-slate-100 sm:flex">
                  <UserRound className="h-4 w-4 text-slate-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                <InfoRow label="Father's Name" value={member.fatherName} icon={UserRound} />

                <InfoRow label="Mobile" value={member.mobile} icon={Phone} />

                <InfoRow
                  label="Residential Telephone"
                  value={member.residentialTelephone}
                  icon={Phone}
                />

                <InfoRow label="Company" value={member.companyName} icon={Building2} />

                <InfoRow
                  label="State / City"
                  value={[
                    member.city?.cityName || member.city,
                    member.state?.stateName || member.state,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                  icon={MapPin}
                />

                <InfoRow label="Designation" value={member.designation} icon={Building2} />

                <InfoRow
                  label="Joining Date"
                  value={formatDate(member.dateOfJoining)}
                  icon={CalendarDays}
                />

                <InfoRow
                  label="Valid Until"
                  value={
                    formatDate(member.validityTo)
                      ? `${formatDate(member.validityTo)}${
                          validityHint ? ` (${validityHint})` : ""
                        }`
                      : "—"
                  }
                  icon={CalendarDays}
                />
              </div>
            </div>

            {/* ---------------------------------------------------------- */}
            {/* Partners                                                    */}
            {/* ---------------------------------------------------------- */}

            <div className="rounded-[5px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-blue-50 text-blue-600">
                    <Users className="h-4 w-4" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Partners
                      <span className="ml-1.5 text-slate-400">({partners.length})</span>
                    </h3>

                    <p className="text-[12px] text-slate-400">Partners linked to this member</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openNewPartnerForm}
                  className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-[4px] bg-blue-600 px-3 text-[12px] font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow sm:w-auto"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Partner
                </button>
              </div>

              {partners.length === 0 ? (
                <div className="rounded-[5px] border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-300 shadow-sm">
                    <Users className="h-5 w-5" />
                  </div>

                  <p className="mt-3 text-[13px] font-medium text-slate-600">No partners linked</p>

                  <p className="mt-1 text-[12px] text-slate-400">
                    Add a partner to associate them with this member.
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile Cards */}
                  <div className="space-y-2 md:hidden">
                    {partners.map((partner) => {
                      const active = partner.isActive && !isExpired(partner);

                      return (
                        <div
                          key={partner.id}
                          className="rounded-[5px] border border-slate-200 bg-slate-50/50 p-3 transition-colors hover:bg-slate-50"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <Link
                              to="/admin/directory/partner/$slug/details"
                              params={{
                                slug: buildPartnerSlug(partner),
                              }}
                              className="min-w-0"
                            >
                              <p className="truncate text-[13px] font-semibold text-slate-800 hover:text-sky-700 hover:underline">
                                {partner.partnerName || "Unnamed Partner"}
                              </p>

                              <p className="mt-0.5 text-[11px] text-slate-400">
                                ID: {partner.partnerId || "—"}
                              </p>
                            </Link>

                            <StatusBadge active={active} />
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-[10px] uppercase tracking-wide text-slate-400">
                                Mobile
                              </p>

                              <p className="mt-0.5 truncate text-[12px] font-medium text-slate-600">
                                {partner.mobile || "—"}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] uppercase tracking-wide text-slate-400">
                                Company
                              </p>

                              <p className="mt-0.5 truncate text-[12px] font-medium text-slate-600">
                                {partner.companyName || "—"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-end gap-4 border-t border-slate-200 pt-2.5">
                            <Link
                              to="/admin/directory/partner/$slug/details"
                              params={{
                                slug: buildPartnerSlug(partner),
                              }}
                              className="inline-flex items-center gap-1 text-[12px] font-semibold text-slate-600 hover:text-sky-700"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </Link>

                            <button
                              type="button"
                              onClick={() => openEditPartnerForm(partner)}
                              className="inline-flex items-center gap-1 text-[12px] font-semibold text-slate-600 hover:text-sky-700"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden overflow-x-auto rounded-[4px] border border-slate-200 md:block">
                    <table className="w-full min-w-[600px] text-left text-[12px]">
                      <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                        <tr>
                          <th className="px-3 py-2.5 font-semibold">Partner ID</th>

                          <th className="px-3 py-2.5 font-semibold">Name</th>

                          <th className="px-3 py-2.5 font-semibold">Mobile</th>

                          <th className="px-3 py-2.5 font-semibold">Status</th>

                          <th className="px-3 py-2.5 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {partners.map((partner) => {
                          const active = partner.isActive && !isExpired(partner);

                          return (
                            <tr
                              key={partner.id}
                              className="border-t border-slate-100 transition-colors hover:bg-slate-50"
                            >
                              <td className="px-3 py-2.5 font-medium text-slate-600">
                                {partner.partnerId || "—"}
                              </td>

                              <td className="px-3 py-2.5">
                                <Link
                                  to="/admin/directory/partner/$slug/details"
                                  params={{
                                    slug: buildPartnerSlug(partner),
                                  }}
                                  className="font-semibold text-slate-700 transition-colors hover:text-sky-700 hover:underline"
                                >
                                  {partner.partnerName || "Unnamed Partner"}
                                </Link>
                              </td>

                              <td className="px-3 py-2.5 text-slate-500">
                                {partner.mobile || "—"}
                              </td>

                              <td className="px-3 py-2.5">
                                <StatusBadge active={active} />
                              </td>

                              <td className="px-3 py-2.5">
                                <div className="flex justify-end gap-3">
                                  <Link
                                    to="/admin/directory/partner/$slug/details"
                                    params={{
                                      slug: buildPartnerSlug(partner),
                                    }}
                                    className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-sky-700"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    View
                                  </Link>

                                  <button
                                    type="button"
                                    onClick={() => openEditPartnerForm(partner)}
                                    className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-sky-700"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Edit
                                  </button>
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
            </div>

            {/* ---------------------------------------------------------- */}
            {/* Payment History                                             */}
            {/* ---------------------------------------------------------- */}

            <div className="rounded-[5px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-emerald-50 text-emerald-600">
                    <CreditCard className="h-4 w-4" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Payment & Renewal History</h3>

                    <p className="text-[12px] text-slate-400">Membership payment records</p>
                  </div>
                </div>

                {renewals.length > 0 && (
                  <button
                    type="button"
                    onClick={() => downloadRenewalsCsv(member)}
                    className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-[4px] border border-slate-300 bg-white px-3 text-[12px] font-semibold text-slate-600 transition-colors hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 sm:w-auto"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download Report
                  </button>
                )}
              </div>

              {renewals.length === 0 ? (
                <div className="rounded-[5px] border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-300 shadow-sm">
                    <CreditCard className="h-5 w-5" />
                  </div>

                  <p className="mt-3 text-[13px] font-medium text-slate-600">
                    No payment records yet
                  </p>

                  <p className="mt-1 text-[12px] text-slate-400">
                    Renewal payments will appear here.
                  </p>
                </div>
              ) : (
                <ol className="space-y-2">
                  {renewals.map((renewal, index) => {
                    const isCurrent = renewal.id === currentRenewalId;

                    return (
                      <li
                        key={renewal.id || index}
                        className={`rounded-[5px] border p-3 transition-colors ${
                          isCurrent
                            ? "border-emerald-200 bg-emerald-50/70"
                            : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[13px] font-semibold text-slate-700">
                                Paid {formatDate(renewal.paymentDate) || "—"}
                              </span>

                              {renewal.amount != null && (
                                <span className="font-semibold text-slate-800">
                                  ₹{Number(renewal.amount).toLocaleString("en-IN")}
                                </span>
                              )}

                              {isCurrent && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Current
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-[12px] text-slate-500">
                              Valid {formatDate(renewal.validityFrom) || "—"}{" "}
                              <span className="px-1 text-slate-300">→</span>{" "}
                              {formatDate(renewal.validityTo) || "—"}
                            </p>
                          </div>

                          {renewal.note && (
                            <p className="text-[12px] text-slate-500 sm:max-w-xs sm:text-right">
                              {renewal.note}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Hidden Printable Form                                               */}
      {/* ------------------------------------------------------------------ */}

      {member && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            top: 0,
            left: "-9999px",
            zIndex: -1,
          }}
        >
          <MemberPrintableForm member={member} formRef={printableFormRef} />
        </div>
      )}

      {/* ================================================================== */}
      {/* ADD / EDIT PARTNER MODAL                                           */}
      {/* ================================================================== */}

      {showPartnerForm && member && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="partner-modal-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closePartnerForm();
            }
          }}
        >
          <div className="my-3 flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-[6px] bg-white shadow-2xl sm:my-8 sm:max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
              <div>
                <h3 id="partner-modal-title" className="text-sm font-bold text-slate-800">
                  {editingPartner ? "Edit Partner" : "Add Partner"}
                </h3>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  {editingPartner
                    ? "Update partner information"
                    : "Add a new partner for this member"}
                </p>
              </div>

              <button
                type="button"
                onClick={closePartnerForm}
                aria-label="Close partner form"
                className="flex h-8 w-8 items-center justify-center rounded-[4px] text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="min-h-0 overflow-y-auto p-4 sm:p-5">
              <PartnerForm
                partner={editingPartner}
                members={[member]}
                lockedMember={member}
                onCancel={closePartnerForm}
                onSaved={handlePartnerSaved}
              />
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* RENEW MODAL                                                        */}
      {/* ================================================================== */}

      {showRenew && member && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="renew-modal-title"
          onClick={(event) => {
            if (event.target === event.currentTarget && !renewing) {
              closeRenew();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape" && !renewing) {
              closeRenew();
            }
          }}
        >
          <form
            onSubmit={confirmRenew}
            className="w-full max-w-md overflow-hidden rounded-[6px] bg-white shadow-2xl"
          >
            {/* Modal Header */}
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] bg-emerald-50 text-emerald-600">
                    <RefreshCw className="h-4 w-4" />
                  </div>

                  <div>
                    <h3 id="renew-modal-title" className="text-sm font-bold text-slate-800">
                      Renew Membership
                    </h3>

                    <p className="mt-0.5 text-[12px] text-slate-500">
                      {member.memberName || "This member"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeRenew}
                  disabled={renewing}
                  aria-label="Close renewal dialog"
                  className="flex h-7 w-7 items-center justify-center rounded-[4px] text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 p-5">
              <div className="rounded-[5px] border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] text-slate-500">Current validity</span>

                  <span className="text-[12px] font-semibold text-slate-700">
                    {formatDate(member.validityTo) || "—"}
                  </span>
                </div>
              </div>

              {/* New Validity */}
              <div>
                <label
                  htmlFor="renew-validity-date"
                  className="block text-[12px] font-semibold text-slate-700"
                >
                  New Validity To
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  id="renew-validity-date"
                  type="date"
                  required
                  value={renewDate}
                  onChange={(event) => setRenewDate(event.target.value)}
                  disabled={renewing}
                  className={`${inputClass} mt-1.5 w-full`}
                />

                <p className="mt-1 text-[11px] text-slate-400">Select a date after today.</p>
              </div>

              {/* Amount */}
              <div>
                <label
                  htmlFor="renew-amount"
                  className="block text-[12px] font-semibold text-slate-700"
                >
                  Amount Paid
                  <span className="ml-1 font-normal text-slate-400">(₹)</span>
                </label>

                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-slate-400">
                    ₹
                  </span>

                  <input
                    id="renew-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    placeholder="e.g. 5000"
                    value={renewAmount}
                    onChange={(event) => setRenewAmount(event.target.value)}
                    disabled={renewing}
                    className={`${inputClass} w-full pl-7`}
                  />
                </div>
              </div>

              {/* Error */}
              {renewError && (
                <div
                  role="alert"
                  className="rounded-[4px] border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700"
                >
                  {renewError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeRenew}
                disabled={renewing}
                className="h-9 rounded-[4px] border border-slate-300 bg-white px-4 text-[12px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={renewing}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[4px] bg-emerald-600 px-4 text-[12px] font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {renewing ? (
                  <>
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                    Renewing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    Renew Member
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
