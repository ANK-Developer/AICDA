import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Loader2, Share2, ThumbsUp, User } from "lucide-react";
import { toCanvas } from "html-to-image";
import { toast } from "sonner";
import { PageShell } from "@/components/site/PageShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MemberIdCard, MemberIdCardBack } from "@/components/site/MemberIdCard";
import { getPublicMembers } from "@/lib/member-api";
import { getPublicPartners } from "@/lib/partner-api";
import { getMediaUrl } from "@/lib/config";

export const Route = createFileRoute("/management")({
  head: () => ({
    meta: [
      { title: "Management Committee · AICDA" },
      {
        name: "description",
        content: "The elected office bearers and national executive of AICDA.",
      },
      { property: "og:title", content: "Management Committee · AICDA" },
      {
        property: "og:description",
        content: "The elected office bearers and national executive of AICDA.",
      },
    ],
  }),
  component: Page,
});

function mapMemberToBearer(member) {
  return {
    id: member.id,
    name: member.memberName || "",
    designation: member.designation || "",
    companyName: member.companyName || "",
    sOf: member.fatherName || "",
    officeAddress: member.companyAddress || "",
    city: member.city?.cityName || "",
    state: member.state?.stateName || "",
    companyTel: member.companyTelephone || "",
    pNo: member.packetNo || "",
    residence: member.residentialAddress || "",
    residentTel: member.residentialTelephone || "",
    dateOfJoining: member.dateOfJoining || "",
    mobile: member.mobile || "",
    memberId: member.memberId || "",
    validityFrom: member.validityFrom || "",
    validityTo: member.validityTo || "",
    photo: member.photo ? getMediaUrl(member.photo) : null,
  };
}

function mapPartnerToBearer(partner) {
  return {
    id: `partner-${partner.id}`,
    name: partner.partnerName || "",
    designation: partner.designation || "Partner",
    companyName: partner.companyName || "",
    sOf: partner.fatherName || "",
    officeAddress: partner.companyAddress || "",
    city: partner.city?.cityName || "",
    state: partner.state?.stateName || "",
    companyTel: partner.companyTelephone || "",
    pNo: partner.packetNo || "",
    residence: partner.residentialAddress || "",
    residentTel: partner.residentialTelephone || "",
    dateOfJoining: partner.dateOfJoining || "",
    mobile: partner.mobile || "",
    memberId: partner.partnerId || "",
    validityFrom: partner.validityFrom || "",
    validityTo: partner.validityTo || "",
    photo: isDisplayableUrl(partner.photo) ? partner.photo : null,
  };
}

function matchesSearch(bearer, query) {
  const trimmedQuery = String(query ?? "").trim();
  if (!trimmedQuery) return true;
  const haystack = [
    bearer.memberId,
    bearer.name,
    bearer.designation,
    bearer.city,
    bearer.state,
    bearer.sOf,
    bearer.mobile,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(trimmedQuery.toLowerCase());
}

async function combineCardCanvases(frontNode, backNode) {
  const [frontCanvas, backCanvas] = await Promise.all([
    toCanvas(frontNode, {
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      cacheBust: true,
      filter: (el) => el.dataset?.exportIgnore !== "true",
    }),
    toCanvas(backNode, { pixelRatio: 2, backgroundColor: "#ffffff", cacheBust: true }),
  ]);

  const gap = 48;
  const width = Math.max(frontCanvas.width, backCanvas.width);
  const height = frontCanvas.height + gap + backCanvas.height;

  const combined = document.createElement("canvas");
  combined.width = width;
  combined.height = height;
  const ctx = combined.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(frontCanvas, (width - frontCanvas.width) / 2, 0);
  ctx.drawImage(backCanvas, (width - backCanvas.width) / 2, frontCanvas.height + gap);

  return combined;
}

function canvasToBlob(canvas, quality = 0.95) {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

async function downloadCombinedCard(frontNode, backNode, fileName) {
  const canvas = await combineCardCanvases(frontNode, backNode);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function cardSummary(bearer) {
  return [
    bearer.name.trim(),
    bearer.designation,
    bearer.officeAddress,
    [bearer.city, bearer.state].filter(Boolean).join(", "),
    bearer.mobile && `Mobile: ${bearer.mobile}`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function shareCard(bearer, frontNode, backNode) {
  const title = bearer.name.trim() || "AICDA Member";
  const text = cardSummary(bearer);
  const baseName = title.replace(/\s+/g, "_");

  let file = null;
  try {
    if (frontNode && backNode) {
      const canvas = await combineCardCanvases(frontNode, backNode);
      const blob = await canvasToBlob(canvas);
      if (blob) file = new File([blob], `${baseName}_id_card.jpg`, { type: "image/jpeg" });
    }
  } catch {
    // fall through to text sharing below
  }

  if (file && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ title, text, files: [file] });
      return;
    } catch (err) {
      if (err && err.name === "AbortError") return; // user cancelled the share sheet
      // otherwise fall through to the text-only share below
    }
  }

  if (navigator.share) {
    try {
      await navigator.share({ title, text });
      return;
    } catch (err) {
      if (err && err.name === "AbortError") return;
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    toast.success("Member details copied to clipboard");
  } catch {
    toast.error("Couldn't share the card. Please try again.");
  }
}

function DetailRow({ label, value }) {
  return (
    <p className="text-sm">
      <span className="font-bold text-foreground">{label} :</span>{" "}
      <span className="text-foreground/80">{value}</span>
    </p>
  );
}

function OfficeBearerSlide({ bearer }) {
  const idCardRef = useRef(null);
  const backCardRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [sharing, setSharing] = useState(false);

  const handleDownload = async () => {
    if (!idCardRef.current || !backCardRef.current || exporting) return;
    setExporting(true);
    try {
      const baseName = bearer.name.trim().replace(/\s+/g, "_") || "member";
      await downloadCombinedCard(idCardRef.current, backCardRef.current, `${baseName}_id_card.jpg`);
    } catch {
      toast.error("Couldn't generate the image. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      await shareCard(bearer, idCardRef.current, backCardRef.current);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-[220px_1fr]">
      <div className="flex h-72 w-full items-start justify-center overflow-hidden rounded-lg sm:h-45">
        {bearer.photo ? (
          <img
            src={bearer.photo}
            alt={bearer.name}
            className="w-full object-contain"
            crossOrigin="anonymous"
          />
        ) : (
          <User className="h-16 w-16 text-muted-foreground/40" />
        )}
      </div>
      <div className="relative rounded-xl border border-border bg-card p-6 shadow-(--shadow-card)">
        <div className="relative">
          <h3 className="text-center text-lg font-bold text-primary">Member Detail</h3>
          <div className="absolute right-0 top-0 flex gap-1.5">
            <button
              type="button"
              onClick={handleDownload}
              disabled={exporting}
              title="Download ID card"
              aria-label="Download ID card"
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
            >
              {exporting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Download className="h-5 w-5" />
              )}
            </button>
            <button
              type="button"
              onClick={handleShare}
              disabled={sharing}
              title="Share card"
              aria-label="Share card"
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
            >
              {sharing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Share2 className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        {isValidityActive(bearer.validityTo) && (
          <span
            title="Membership valid"
            aria-label="Membership valid"
            className="absolute bottom-3 right-3 flex items-center justify-center text-emerald-500"
          >
            <ThumbsUp className="h-8 w-8 fill-emerald-500" />
          </span>
        )}
        <div className="mt-3 space-y-2">
          <DetailRow label="Name" value={bearer.name} />
          <DetailRow label="ID" value={bearer.memberId} />
          <DetailRow label="Designation" value={bearer.designation} />
          <DetailRow label="S/o" value={bearer.sOf} />
          <DetailRow label="Office Address" value={bearer.officeAddress} />
          <DetailRow label="City" value={bearer.city} />
          <DetailRow label="State" value={bearer.state} />
          <DetailRow label="Company Tel" value={bearer.companyTel} />
          <DetailRow label="P.No." value={bearer.pNo} />
          <DetailRow label="Residence" value={bearer.residence} />
          <DetailRow label="Resident Tel" value={bearer.residentTel} />
          <DetailRow label="Date of Joining" value={bearer.dateOfJoining} />
          <DetailRow label="Mobile" value={bearer.mobile} />
        </div>
      </div>

      {/* Rendered off-screen purely so it can be captured as the downloaded JPG */}
      <div aria-hidden="true" style={{ position: "fixed", top: 0, left: "-9999px", zIndex: -1 }}>
        <MemberIdCard bearer={bearer} cardRef={idCardRef} />
        <MemberIdCardBack bearer={bearer} cardRef={backCardRef} />
      </div>
    </div>
  );
}

function OfficeBearerSlideSkeleton() {
  return (
    <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-[220px_1fr]">
      <Skeleton className="h-45 w-full rounded-lg" />
      <div className="rounded-xl border border-border bg-card p-6 shadow-(--shadow-card)">
        <Skeleton className="mx-auto h-5 w-32" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-3.5 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

function OfficeBearersListSkeleton() {
  return (
    <div className="mt-4 space-y-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <OfficeBearerSlideSkeleton key={index} />
      ))}
    </div>
  );
}

function OfficeBearersList({ bearers }) {
  if (bearers.length === 0) {
    return (
      <p className="mt-4 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No office bearers match your search.
      </p>
    );
  }

  return (
    <div className="mt-4 h-[65vh] space-y-6 overflow-y-auto scrollbar-hide sm:h-185">
      {bearers.map((bearer, index) => (
        <OfficeBearerSlide key={bearer.id || `${bearer.name}-${index}`} bearer={bearer} />
      ))}
    </div>
  );
}

function isDisplayableUrl(value) {
  return typeof value === "string" && /^(https?:)?\/\//.test(value);
}

function isValidityActive(validityTo) {
  if (!validityTo) return false;
  const expiry = new Date(validityTo);
  if (Number.isNaN(expiry.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return expiry >= today;
}

function SearchSuggestions({ suggestions, onSelect }) {
  if (suggestions.length === 0) return null;
  return (
    <ul className="absolute left-0 top-full z-20 mt-1 max-h-72 w-full overflow-auto rounded-md border border-border bg-popover py-1 text-sm shadow-lg">
      {suggestions.map((bearer) => (
        <li key={bearer.id}>
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelect(bearer)}
            className="flex w-full flex-col items-start px-3 py-1.5 text-left transition-colors hover:bg-accent"
          >
            <span className="font-semibold text-foreground">
              {bearer.memberId} — {bearer.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {[bearer.designation, bearer.companyName].filter(Boolean).join(" · ")}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function Page() {
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const searchBoxRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([getPublicMembers().catch(() => []), getPublicPartners().catch(() => [])])
      .then(([memberData, partnerData]) => {
        if (!mounted) return;
        setMembers(memberData);
        setPartners(partnerData);
      })
      .finally(() => mounted && setLoading(false));
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

  const officeBearers = useMemo(
    () => [...members.map(mapMemberToBearer), ...partners.map(mapPartnerToBearer)],
    [members, partners],
  );
  const filteredBearers = useMemo(
    () => officeBearers.filter((bearer) => matchesSearch(bearer, search)),
    [officeBearers, search],
  );
  const suggestions = useMemo(() => {
    if (!search.trim()) return [];
    return filteredBearers.slice(0, 8);
  }, [filteredBearers, search]);

  const selectSuggestion = (bearer) => {
    setSearch(String(bearer.memberId));
    setSuggestionsOpen(false);
  };

  return (
    <PageShell
      title="Management Committee"
      subtitle="The elected office bearers and national executive of AICDA."
      bannerKey="management"
    >
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-foreground">All Members</h2>

        <div ref={searchBoxRef} className="relative flex">
          <Input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSuggestionsOpen(true);
            }}
            onFocus={() => setSuggestionsOpen(true)}
            placeholder="Search Member ID, Partner ID or name"
            className="w-48 rounded-r-none focus-visible:ring-0 sm:w-64"
          />
          <Button type="button" variant="secondary" className="rounded-l-none border border-l-0">
            Search
          </Button>
          {suggestionsOpen && (
            <SearchSuggestions suggestions={suggestions} onSelect={selectSuggestion} />
          )}
        </div>
      </div>

      {loading ? <OfficeBearersListSkeleton /> : <OfficeBearersList bearers={filteredBearers} />}
    </PageShell>
  );
}
