import { User } from "lucide-react";
import logoAICDA from "@/assets/logoAICDA.png";
import presidentSignature from "@/assets/aicda-president-signature.png";
import { getMediaUrl } from "@/lib/config";
import { isExpired } from "./directory-shared";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function InfoLine({ label, value }) {
  return (
    <tr>
      <td className="w-44 py-1 pr-2 align-top text-[13px] font-bold text-slate-800">{label}</td>
      <td className="w-3 py-1 align-top text-[13px] font-bold text-slate-800">:</td>
      <td className="py-1 pl-2 align-top text-[13px] text-slate-700">{value || "—"}</td>
    </tr>
  );
}

// Rendered off-screen and captured to an image via html-to-image — see
// MemberDetails.jsx's handleDownloadForm. Plain bordered-table styling
// (rather than the app's compact admin look) on purpose: this is meant to
// read as a printable official form, not a UI screen.
export function MemberPrintableForm({ member, formRef }) {
  if (!member) return null;
  const isActive = member.isActive && !isExpired(member);
  const partners = member.partners || [];
  const renewals = member.renewals || [];
  const currentRenewalId = renewals[0]?.id;

  return (
    <div ref={formRef} className="w-195 bg-white p-8 text-slate-900">
      <div className="flex items-center justify-center gap-3 border-b-2 border-slate-800 pb-3">
        <img src={logoAICDA} alt="AICDA" className="h-14 w-14 rounded-full object-contain" />
        <div className="text-center">
          <h1 className="text-xl font-extrabold uppercase tracking-wide text-slate-900">
            All India Car Dealers Association
          </h1>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
            AICDA · Since 1998
          </p>
        </div>
      </div>
      <h2 className="mt-3 text-center text-base font-bold uppercase tracking-widest text-slate-700">
        Member Form
      </h2>

      <div className="mt-5 flex gap-5">
        <div className="shrink-0">
          {member.photo ? (
            <img
              src={getMediaUrl(member.photo)}
              alt={member.memberName}
              crossOrigin="anonymous"
              className="h-32 w-28 rounded-md border border-slate-300 object-cover"
            />
          ) : (
            <div className="flex h-32 w-28 items-center justify-center rounded-md border border-dashed border-slate-300 text-slate-300">
              <User className="h-10 w-10" />
            </div>
          )}
        </div>
        <table className="flex-1 border-collapse">
          <tbody>
            <InfoLine label="Name" value={member.memberName} />
            <InfoLine label="Father's Name" value={member.fatherName} />
            <InfoLine label="Mobile" value={member.mobile} />
            <InfoLine label="Residential Telephone" value={member.residentialTelephone} />
            <InfoLine
              label="Address (State / City)"
              value={[member.city?.cityName || member.city, member.state?.stateName || member.state]
                .filter(Boolean)
                .join(", ")}
            />
            <InfoLine label="Company" value={member.companyName} />
            <InfoLine label="Designation" value={member.designation} />
            <InfoLine label="Valid Until" value={formatDate(member.validityTo)} />
            <InfoLine label="Status" value={isActive ? "Active" : "Inactive"} />
            <InfoLine label="Joining Date" value={formatDate(member.dateOfJoining)} />
            <InfoLine label="Member ID" value={member.memberId} />
          </tbody>
        </table>
      </div>

      {partners.length > 0 && (
        <div className="mt-6">
          <h3 className="border-b border-slate-800 pb-1 text-[13px] font-bold uppercase tracking-wide text-slate-700">
            Partner Details
          </h3>
          <table className="mt-2 w-full border-collapse text-[12px]">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 px-2 py-1.5 text-left">Partner ID</th>
                <th className="border border-slate-300 px-2 py-1.5 text-left">Name</th>
                <th className="border border-slate-300 px-2 py-1.5 text-left">Mobile</th>
                <th className="border border-slate-300 px-2 py-1.5 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((partner) => (
                <tr key={partner.id}>
                  <td className="border border-slate-300 px-2 py-1.5 font-medium">
                    {partner.partnerId}
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5">{partner.partnerName}</td>
                  <td className="border border-slate-300 px-2 py-1.5">{partner.mobile || "—"}</td>
                  <td className="border border-slate-300 px-2 py-1.5">
                    {partner.isActive && !isExpired(partner) ? "Active" : "Inactive"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6">
        <h3 className="border-b border-slate-800 pb-1 text-[13px] font-bold uppercase tracking-wide text-slate-700">
          Payment &amp; Renewal History
        </h3>
        {renewals.length === 0 ? (
          <p className="mt-2 text-[12px] text-slate-500">No payment records yet.</p>
        ) : (
          <table className="mt-2 w-full border-collapse text-[12px]">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 px-2 py-1.5 text-left">Payment Date</th>
                <th className="border border-slate-300 px-2 py-1.5 text-left">Amount (₹)</th>
                <th className="border border-slate-300 px-2 py-1.5 text-left">Valid From</th>
                <th className="border border-slate-300 px-2 py-1.5 text-left">Valid Until</th>
                <th className="border border-slate-300 px-2 py-1.5 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {renewals.map((renewal) => (
                <tr key={renewal.id}>
                  <td className="border border-slate-300 px-2 py-1.5">
                    {formatDate(renewal.paymentDate)}
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5">{renewal.amount ?? "—"}</td>
                  <td className="border border-slate-300 px-2 py-1.5">
                    {formatDate(renewal.validityFrom)}
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5">
                    {formatDate(renewal.validityTo)}
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5">
                    {renewal.id === currentRenewalId ? "Current" : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-16 flex items-end justify-between px-6">
        <div className="w-56 text-center">
          <div className="h-10" />
          <div className="border-t border-slate-500" />
          <p className="mt-1.5 text-[12px] font-semibold text-slate-700">Member Signature</p>
        </div>
        <div className="w-56 text-center">
          <img
            src={presidentSignature}
            alt="Authorized signature"
            className="mx-auto h-10 w-32 object-contain"
          />
          <div className="border-t border-slate-500" />
          <p className="mt-1.5 text-[12px] font-semibold text-slate-700">Authorized Signature</p>
        </div>
      </div>
    </div>
  );
}
