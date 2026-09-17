import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Building2,
  CalendarDays,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  MapPin,
  Phone,
  Share2,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Skeleton } from "@/components/ui/skeleton";
import { getMediaUrl } from "@/lib/config";
import { getPublicMember } from "@/lib/member-api";
import { getPublicPartner } from "@/lib/partner-api";
import { daysRemaining, expiryLabel, isExpired } from "@/components/admin/directory-shared";

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function InfoRow({ label, value, icon: Icon }) {
  if (!value) return null;
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/60">
      {Icon && (
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 wrap-break-word text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function StatusPill({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
        active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function ProfileSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-(--shadow-card)">
        <Skeleton className="mx-auto h-40 w-40 rounded-2xl" />
        <Skeleton className="mx-auto mt-4 h-5 w-36" />
        <Skeleton className="mx-auto mt-2 h-3.5 w-24" />
        <Skeleton className="mx-auto mt-4 h-6 w-20 rounded-full" />
      </div>
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-(--shadow-card)">
          <Skeleton className="mb-4 h-4 w-40" />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NotFoundState({ type }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center shadow-(--shadow-card)">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <UserRound className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-foreground">
        {type === "partner" ? "Partner" : "Member"} not found
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        This link may be incorrect, or the record may have been removed.
      </p>
      <Link
        to="/management"
        className="mt-5 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        Browse Directory
      </Link>
    </div>
  );
}

async function copyLink(url) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    toast.success("Link copied to clipboard");
  } catch {
    toast.error("Couldn't copy the link");
  }
}

async function shareProfile(url, name) {
  if (navigator.share) {
    try {
      await navigator.share({ title: name || "AICDA Profile", url });
      return;
    } catch (err) {
      if (err && err.name === "AbortError") return;
    }
  }
  await copyLink(url);
}

// Renders a Member's or a Partner's public profile from the no-auth
// GET /members/public/:id or GET /partners/public/:id endpoints. One shared
// layout backs both /public/member/$id and /public/partner/$id so the admin
// only ever has to share (or the visitor open) one kind of link.
export function PublicProfileView({ type, id }) {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setNotFound(false);
    setRecord(null);

    const fetcher = type === "partner" ? getPublicPartner : getPublicMember;

    fetcher(id)
      .then((data) => {
        if (!mounted) return;
        if (!data) {
          setNotFound(true);
        } else {
          setRecord(data);
        }
      })
      .catch(() => {
        if (mounted) setNotFound(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [type, id]);

  const isPartner = type === "partner";
  const idLabel = isPartner ? "Partner ID" : "Member ID";
  const displayId = isPartner ? record?.partnerId : record?.memberId;
  const name = isPartner ? record?.partnerName : record?.memberName;
  const active = record ? Boolean(record.isActive && !isExpired(record)) : false;
  const validityHint = record ? expiryLabel(daysRemaining(record)) : null;
  const partners = Array.isArray(record?.partners) ? record.partners : [];
  const parentMember = isPartner ? record?.member : null;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <div className="border-b border-border bg-primary/5">
        <div className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            AICDA Public Directory
          </p>
          <h1
            className="text-2xl font-black text-foreground sm:text-3xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {isPartner ? "Partner Profile" : "Member Profile"}
          </h1>
        </div>
      </div>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <ProfileSkeleton />
        ) : notFound || !record ? (
          <NotFoundState type={type} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
            {/* Profile card */}
            <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-(--shadow-card)">
              <div className="flex flex-col items-center">
                {record.photo ? (
                  <div className="overflow-hidden rounded-2xl border border-border bg-muted">
                    <img
                      src={getMediaUrl(record.photo)}
                      alt={name || "Photo"}
                      className="h-40 w-40 object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-40 w-40 items-center justify-center rounded-2xl border border-dashed border-border bg-muted text-muted-foreground/50">
                    <ImageIcon className="h-12 w-12" />
                  </div>
                )}

                <h2 className="mt-4 max-w-full wrap-break-word text-center text-lg font-bold text-foreground">
                  {name || "Unnamed"}
                </h2>

                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>{idLabel}:</span>
                  <span className="font-semibold text-foreground">{displayId || "—"}</span>
                </div>

                <div className="mt-3">
                  <StatusPill active={active} />
                </div>
              </div>

              <div className="mt-5 border-t border-border pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Valid Until
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">
                      {formatDate(record.validityTo) || "—"}
                    </p>
                  </div>
                </div>
                {validityHint && (
                  <div className="mt-3 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                    {validityHint}
                  </div>
                )}
              </div>

              {isPartner && parentMember && (
                <div className="mt-5 border-t border-border pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Registered Under Member
                  </p>
                  <Link
                    to="/profile/member/$id"
                    params={{ id: String(parentMember.id) }}
                    className="mt-1.5 flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
                  >
                    <span className="truncate">
                      {parentMember.memberName} · {parentMember.memberId}
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </Link>
                </div>
              )}

              <div className="mt-5 flex gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => copyLink(shareUrl)}
                  className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-background text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy Link
                </button>
                <button
                  type="button"
                  onClick={() => shareProfile(shareUrl, name)}
                  className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Share2 className="h-3.5 w-3.5" /> Share
                </button>
              </div>
            </aside>

            {/* Details */}
            <div className="min-w-0 space-y-6">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card) sm:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <UserRound className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      {isPartner ? "Partner Information" : "Member Information"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Personal and professional details
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                  <InfoRow label="Father's Name" value={record.fatherName} icon={UserRound} />
                  <InfoRow label="Mobile" value={record.mobile} icon={Phone} />
                  <InfoRow
                    label="Residential Telephone"
                    value={record.residentialTelephone}
                    icon={Phone}
                  />
                  <InfoRow
                    label="Residential Address"
                    value={record.residentialAddress}
                    icon={MapPin}
                  />
                  <InfoRow label="Designation" value={record.designation} icon={Building2} />
                  <InfoRow
                    label="State / City"
                    value={[record.city, record.state].filter(Boolean).join(", ")}
                    icon={MapPin}
                  />
                  <InfoRow
                    label="Joining Date"
                    value={formatDate(record.dateOfJoining)}
                    icon={CalendarDays}
                  />
                  <InfoRow label="Packet No." value={record.packetNo} icon={Building2} />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card) sm:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Company Information</h3>
                    <p className="text-xs text-muted-foreground">Business details on record</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                  <InfoRow label="Company Name" value={record.companyName} icon={Building2} />
                  <InfoRow
                    label="Company Telephone"
                    value={record.companyTelephone}
                    icon={Phone}
                  />
                  <InfoRow
                    label="Company Address"
                    value={record.companyAddress}
                    icon={MapPin}
                  />
                </div>
              </div>

              {!isPartner && (
                <div className="rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card) sm:p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        Partners <span className="text-muted-foreground">({partners.length})</span>
                      </h3>
                      <p className="text-xs text-muted-foreground">Partners linked to this member</p>
                    </div>
                  </div>

                  {partners.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-muted/40 px-5 py-8 text-center">
                      <p className="text-sm font-medium text-muted-foreground">
                        No partners linked
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {partners.map((partner) => {
                        const partnerActive = Boolean(partner.isActive && !isExpired(partner));
                        return (
                          <Link
                            key={partner.id}
                            to="/profile/partner/$id"
                            params={{ id: String(partner.id) }}
                            className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/60"
                          >
                            {partner.photo ? (
                              <img
                                src={getMediaUrl(partner.photo)}
                                alt={partner.partnerName}
                                className="h-11 w-11 shrink-0 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground/50">
                                <UserRound className="h-5 w-5" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {partner.partnerName || "Unnamed Partner"}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {partner.partnerId} · {partner.designation || "Partner"}
                              </p>
                            </div>
                            <StatusPill active={partnerActive} />
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
