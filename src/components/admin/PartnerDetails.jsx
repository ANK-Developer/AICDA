import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Download,
  FileDown,
  Image as ImageIcon,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  UserRound,
  X,
} from "lucide-react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

import { getPartnerDetails, renewPartner } from "@/lib/partner-api";

import {
  buildMemberSlug,
  daysRemaining,
  expiryLabel,
  inputClass,
  isExpired,
  isTodayOrPast,
  parsePartnerSlug,
  StatusBadge,
} from "./directory-shared";

import { PartnerPrintableForm } from "./PartnerPrintableForm";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

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

function formatDateTime(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function safeText(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "object") {
    return value.name || value.label || value.cityName || value.stateName || value.title || "—";
  }

  return String(value);
}

function getId(item) {
  return item?.id || item?._id || "";
}

function toCsvCell(value) {
  const text = value == null ? "" : String(value);

  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadRenewalsCsv(partner) {
  if (!partner?.renewals?.length) {
    toast.error("No payment history available.");
    return;
  }

  try {
    const currentRenewalId = getId(partner.renewals[0]);

    const rows = [
      ["Payment Date", "Amount (₹)", "Validity From", "Validity To", "Note", "Current"],

      ...partner.renewals.map((renewal) => [
        formatDate(renewal.paymentDate) || "",
        renewal.amount ?? "",
        formatDate(renewal.validityFrom) || "",
        formatDate(renewal.validityTo) || "",
        renewal.note || "",
        getId(renewal) === currentRenewalId ? "Yes" : "No",
      ]),
    ];

    const csv = rows.map((row) => row.map(toCsvCell).join(",")).join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const fileName = `${safeText(partner.partnerName) || "partner"}_payment_history.csv`
      .replace(/\s+/g, "_")
      .replace(/[^\w.-]/g, "");

    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    toast.success("Payment report downloaded.");
  } catch (error) {
    console.error("CSV download error:", error);
    toast.error("Could not download payment report.");
  }
}

async function downloadPartnerFormImage(node, fileName) {
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
/* Reusable UI                                                               */
/* -------------------------------------------------------------------------- */

function InfoRow({ icon: Icon, label, value }) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return (
    <div className="group flex min-w-0 items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 transition-all hover:border-red-200 hover:bg-red-50/30">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-700">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>

        <p className="mt-0.5 break-words text-sm font-semibold text-slate-700">{safeText(value)}</p>
      </div>
    </div>
  );
}

function SectionHeader({ title, description, action }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">{title}</h3>

        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>

      {action}
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <Skeleton className="mx-auto h-44 w-44 rounded-xl" />
        <Skeleton className="mx-auto mt-4 h-5 w-36" />
        <Skeleton className="mx-auto mt-2 h-3 w-24" />
        <Skeleton className="mx-auto mt-3 h-7 w-20 rounded-full" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-52 w-full rounded-xl" />
        <Skeleton className="h-52 w-full rounded-xl" />
      </div>
    </div>
  );
}

function EmptyState({ message = "Partner not found." }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-5 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
        <UserRound className="h-7 w-7 text-red-700" />
      </div>

      <h3 className="mt-4 text-base font-bold text-slate-800">{message}</h3>

      <p className="mt-1 text-sm text-slate-500">Please go back to the directory and try again.</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export function PartnerDetails({ slug }) {
  const [partner, setPartner] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showRenew, setShowRenew] = useState(false);
  const [renewDate, setRenewDate] = useState("");
  const [renewAmount, setRenewAmount] = useState("");
  const [renewing, setRenewing] = useState(false);
  const [renewError, setRenewError] = useState("");

  const [downloadingForm, setDownloadingForm] = useState(false);

  const printableFormRef = useRef(null);

  /* ------------------------------------------------------------------------ */
  /* Load partner                                                              */
  /* ------------------------------------------------------------------------ */

  const loadPartner = useCallback(
    async ({ showLoader = true } = {}) => {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      try {
        const partnerId = parsePartnerSlug(slug);

        if (!partnerId) {
          throw new Error("Invalid partner URL.");
        }

        const data = await getPartnerDetails(partnerId);

        setPartner(data || null);

        return data || null;
      } catch (requestError) {
        const message = requestError?.message || "Could not load this partner.";

        setError(message);
        setPartner(null);

        throw requestError;
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [slug],
  );

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const partnerId = parsePartnerSlug(slug);

        if (!partnerId) {
          throw new Error("Invalid partner URL.");
        }

        const data = await getPartnerDetails(partnerId);

        if (mounted) {
          setPartner(data || null);
        }
      } catch (requestError) {
        if (mounted) {
          setError(requestError?.message || "Could not load this partner.");

          setPartner(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [slug]);

  /* ------------------------------------------------------------------------ */
  /* Derived values                                                            */
  /* ------------------------------------------------------------------------ */

  const isEffectivelyActive = partner ? Boolean(partner.isActive) && !isExpired(partner) : false;

  const validityHint = partner ? expiryLabel(daysRemaining(partner)) : null;

  const currentRenewalId = getId(partner?.renewals?.[0]);

  const location = [
    partner?.city?.cityName || partner?.city,
    partner?.state?.stateName || partner?.state,
  ]
    .filter(Boolean)
    .map(safeText)
    .join(", ");

  /* ------------------------------------------------------------------------ */
  /* Download partner form                                                    */
  /* ------------------------------------------------------------------------ */

  const handleDownloadForm = async () => {
    if (!printableFormRef.current || downloadingForm || !partner) {
      return;
    }

    setDownloadingForm(true);

    try {
      const baseName = (safeText(partner.partnerName) || "partner")
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^\w.-]/g, "");

      await downloadPartnerFormImage(printableFormRef.current, `${baseName}_partner_form.png`);

      toast.success("Partner form downloaded.");
    } catch (downloadError) {
      console.error("Partner form download error:", downloadError);

      toast.error("Couldn't generate the form. Please try again.");
    } finally {
      setDownloadingForm(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Renewal modal                                                             */
  /* ------------------------------------------------------------------------ */

  const openRenew = () => {
    if (!partner) return;

    setRenewDate(partner.validityTo ? String(partner.validityTo).slice(0, 10) : "");

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

    if (!partner) return;

    if (!renewDate) {
      setRenewError("Please choose the new validity date.");
      return;
    }

    if (isTodayOrPast(renewDate)) {
      setRenewError("Validity date must be after today.");
      return;
    }

    if (renewAmount !== "" && (!Number.isFinite(Number(renewAmount)) || Number(renewAmount) < 0)) {
      setRenewError("Please enter a valid non-negative amount.");
      return;
    }

    setRenewing(true);
    setRenewError("");

    try {
      await renewPartner(partner.id, {
        validityTo: renewDate,
        amount: renewAmount === "" ? undefined : Number(renewAmount),
      });

      const updatedPartner = await loadPartner({
        showLoader: false,
      });

      toast.success(
        `${safeText(
          updatedPartner?.partnerName || partner.partnerName || "Partner",
        )} renewed successfully.`,
      );

      setShowRenew(false);
      setRenewDate("");
      setRenewAmount("");
      setRenewError("");
    } catch (requestError) {
      const message = requestError?.message || "Could not renew partner.";

      setRenewError(message);
      toast.error(message);
    } finally {
      setRenewing(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Render                                                                    */
  /* ------------------------------------------------------------------------ */

  return (
    <section className="w-full space-y-4">
      {/* ------------------------------------------------------------------ */}
      {/* Top navigation / actions                                           */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          {partner?.member ? (
            <Link
              to="/admin/directory/$slug/details"
              params={{
                slug: buildMemberSlug(partner.member),
              }}
              className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700"
            >
              <ArrowLeft className="h-4 w-4" />

              <span className="truncate">Back to {safeText(partner.member.memberName)}</span>
            </Link>
          ) : (
            <Link
              to="/admin/directory"
              className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700"
            >
              <ArrowLeft className="h-4 w-4" />

              <span>Back to Directory</span>
            </Link>
          )}
        </div>

        {partner && (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={openRenew}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-700 px-4 text-sm font-bold text-white shadow-sm transition-all hover:bg-red-800 active:scale-[0.98]"
            >
              <RefreshCw className="h-4 w-4" />
              Renew Partner
            </button>

            <button
              type="button"
              onClick={handleDownloadForm}
              disabled={downloadingForm}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {downloadingForm ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
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
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100">
            <X className="h-4 w-4" />
          </div>

          <div>
            <p className="font-bold">Unable to load partner</p>

            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Loading                                                             */}
      {/* ------------------------------------------------------------------ */}

      {loading ? (
        <DetailsSkeleton />
      ) : !partner ? (
        !error && <EmptyState />
      ) : (
        <>
          {/* -------------------------------------------------------------- */}
          {/* Main details                                                     */}
          {/* -------------------------------------------------------------- */}

          <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
            {/* ------------------------------------------------------------ */}
            {/* Profile card                                                   */}
            {/* ------------------------------------------------------------ */}

            <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col items-center">
                {partner.photo ? (
                  <img
                    src={partner.photo}
                    alt={safeText(partner.partnerName)}
                    className="h-44 w-44 rounded-xl border border-slate-200 object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-44 w-44 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
                    <ImageIcon className="h-12 w-12 text-slate-300" />
                  </div>
                )}

                <h2 className="mt-4 text-center text-xl font-bold text-slate-900">
                  {safeText(partner.partnerName)}
                </h2>

                <p className="mt-1 text-center text-xs font-medium text-slate-500">
                  Partner ID: {safeText(partner.partnerId)}
                </p>

                {partner.member && (
                  <p className="mt-2 text-center text-xs text-slate-500">
                    Member:{" "}
                    <Link
                      to="/admin/directory/$slug/details"
                      params={{
                        slug: buildMemberSlug(partner.member),
                      }}
                      className="font-bold text-red-700 hover:underline"
                    >
                      {safeText(partner.member.memberName)}
                    </Link>
                  </p>
                )}

                <div className="mt-4">
                  <StatusBadge active={isEffectivelyActive} />
                </div>
              </div>

              {/* Quick contact information */}
              <div className="mt-5 space-y-2">
                <InfoRow icon={Phone} label="Mobile" value={partner.mobile} />

                <InfoRow icon={Mail} label="Email" value={partner.email} />

                <InfoRow icon={MapPin} label="Location" value={location} />
              </div>
            </aside>

            {/* ------------------------------------------------------------ */}
            {/* Right content                                                   */}
            {/* ------------------------------------------------------------ */}

            <div className="min-w-0 space-y-4">
              {/* Partner information */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <SectionHeader
                  title="Partner Information"
                  description="Personal, professional and validity details"
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <InfoRow icon={UserRound} label="Father's Name" value={partner.fatherName} />

                  <InfoRow icon={Phone} label="Mobile" value={partner.mobile} />

                  <InfoRow
                    icon={Phone}
                    label="Residential Telephone"
                    value={partner.residentialTelephone}
                  />

                  <InfoRow icon={UserRound} label="Company" value={partner.companyName} />

                  <InfoRow icon={MapPin} label="State / City" value={location} />

                  <InfoRow icon={UserRound} label="Designation" value={partner.designation} />

                  <InfoRow
                    icon={CalendarDays}
                    label="Joining Date"
                    value={formatDate(partner.dateOfJoining)}
                  />

                  <InfoRow
                    icon={CalendarDays}
                    label="Valid Until"
                    value={
                      formatDate(partner.validityTo)
                        ? `${formatDate(partner.validityTo)}${
                            validityHint ? ` (${validityHint})` : ""
                          }`
                        : "—"
                    }
                  />
                </div>
              </div>

              {/* Payment history */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <SectionHeader
                  title="Payment & Renewal History"
                  description="Previous partner renewal and payment records"
                  action={
                    partner.renewals?.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => downloadRenewalsCsv(partner)}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Download Report</span>
                        <span className="sm:hidden">CSV</span>
                      </button>
                    ) : null
                  }
                />

                {!partner.renewals?.length ? (
                  <div className="flex min-h-32 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center">
                    <CalendarDays className="h-8 w-8 text-slate-300" />

                    <p className="mt-2 text-sm font-semibold text-slate-500">
                      No payment records yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {partner.renewals.map((renewal, index) => {
                      const renewalId = getId(renewal);

                      const isCurrent = renewalId === currentRenewalId;

                      return (
                        <div
                          key={renewalId || `renewal-${index}`}
                          className={`rounded-xl border p-4 transition-colors ${
                            isCurrent
                              ? "border-red-200 bg-red-50/60"
                              : "border-slate-200 bg-slate-50 hover:bg-white"
                          }`}
                        >
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-bold text-slate-800">
                                  Payment {formatDate(renewal.paymentDate) || "—"}
                                </p>

                                {isCurrent && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-red-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Current
                                  </span>
                                )}
                              </div>

                              {renewal.amount !== null &&
                                renewal.amount !== undefined &&
                                renewal.amount !== "" && (
                                  <p className="mt-1 text-base font-bold text-red-700">
                                    ₹{Number(renewal.amount).toLocaleString("en-IN")}
                                  </p>
                                )}
                            </div>

                            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                              <p>
                                <span className="font-bold">Valid:</span>{" "}
                                {formatDate(renewal.validityFrom) || "—"} →{" "}
                                {formatDate(renewal.validityTo) || "—"}
                              </p>
                            </div>
                          </div>

                          {renewal.note && (
                            <div className="mt-3 border-t border-slate-200 pt-3">
                              <p className="text-xs leading-relaxed text-slate-600">
                                <span className="font-bold text-slate-700">Note:</span>{" "}
                                {safeText(renewal.note)}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* Hidden printable form                                            */}
          {/* -------------------------------------------------------------- */}

          <div
            aria-hidden="true"
            style={{
              position: "fixed",
              top: 0,
              left: "-9999px",
              zIndex: -1,
            }}
          >
            <PartnerPrintableForm partner={partner} formRef={printableFormRef} />
          </div>
        </>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Renewal modal                                                       */}
      {/* ------------------------------------------------------------------ */}

      {showRenew && partner && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-[2px] sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="renew-partner-title"
          onMouseDown={(event) => {
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
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal header */}
            <div className="border-b border-red-100 bg-red-50 px-5 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-700 text-white">
                      <RefreshCw className="h-4 w-4" />
                    </div>

                    <div>
                      <h3 id="renew-partner-title" className="text-base font-bold text-slate-900">
                        Renew Partner
                      </h3>

                      <p className="mt-0.5 text-xs text-slate-500">Update membership validity</p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeRenew}
                  disabled={renewing}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Close renewal dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="space-y-4 p-5 sm:p-6">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Partner
                </p>

                <p className="mt-1 text-sm font-bold text-slate-800">
                  {safeText(partner.partnerName)}
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  Current validity: {formatDate(partner.validityTo) || "—"}
                </p>
              </div>

              {/* Date */}
              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  New Validity To
                  <span className="ml-1 text-red-700">*</span>
                </span>

                <input
                  type="date"
                  required
                  value={renewDate}
                  onChange={(event) => {
                    setRenewDate(event.target.value);
                    setRenewError("");
                  }}
                  className={`${inputClass} mt-1.5 w-full rounded-lg border-slate-300 focus:border-red-700 focus:ring-red-700`}
                />

                <span className="mt-1 block text-[11px] text-slate-400">
                  Select a date after today.
                </span>
              </label>

              {/* Amount */}
              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Amount Paid
                  <span className="ml-1 text-xs font-normal text-slate-400">(Optional)</span>
                </span>

                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    ₹
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter amount"
                    value={renewAmount}
                    onChange={(event) => {
                      setRenewAmount(event.target.value);
                      setRenewError("");
                    }}
                    className={`${inputClass} w-full rounded-lg border-slate-300 pl-8 focus:border-red-700 focus:ring-red-700`}
                  />
                </div>
              </label>

              {/* Error */}
              {renewError && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700"
                >
                  {renewError}
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={closeRenew}
                disabled={renewing}
                className="h-10 rounded-lg border border-slate-300 bg-white px-5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={renewing}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-700 px-5 text-sm font-bold text-white shadow-sm transition-all hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {renewing ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Renewing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Renew Partner
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
