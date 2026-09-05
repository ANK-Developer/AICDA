import { useEffect, useMemo, useRef, useState } from "react";

import { Image as ImageIcon } from "lucide-react";

import { toast } from "sonner";

import { createPartner, updatePartner } from "@/lib/partner-api";

import {
  CityCombobox,
  DesignationCombobox,
  FieldRow,
  StateCombobox,
  digitsOnly,
  fieldClass,
  inputClass,
  textareaClass,
} from "./directory-shared";

function buildInitialForm(partner, lockedMember) {
  if (!partner) {
    return {
      memberId: lockedMember?.memberId || "",
      partnerName: "",
      fatherName: "",
      photo: null,
      residentialAddress: "",
      mobile: "",
      residentialTelephone: "",
      panCardNo: "",
      aadharNo: "",
      designation: "",
      companyName: lockedMember?.companyName || "",
      companyAddress: lockedMember?.companyAddress || "",
      companyTelephone: lockedMember?.companyTelephone || "",
      packetNo: lockedMember?.packetNo || "",
      state: lockedMember?.state?.stateName || lockedMember?.state || "",
      city: lockedMember?.city?.cityName || lockedMember?.city || "",
      dateOfJoining: "",
      validityTo: "",
      amount: "",
      note: "",
    };
  }

  return {
    memberId: partner.member?.memberId || "",
    partnerName: partner.partnerName || "",
    fatherName: partner.fatherName || "",
    photo: null,
    residentialAddress: partner.residentialAddress || "",
    mobile: partner.mobile || "",
    residentialTelephone: partner.residentialTelephone || "",
    panCardNo: partner.panCardNo || "",
    aadharNo: partner.aadharNo || "",
    designation: partner.designation || "",
    companyName: partner.companyName || "",
    companyAddress: partner.companyAddress || "",
    companyTelephone: partner.companyTelephone || "",
    packetNo: partner.packetNo || "",
    state: partner.state?.stateName || partner.state || "",
    city: partner.city?.cityName || partner.city || "",
    dateOfJoining: partner.dateOfJoining ? partner.dateOfJoining.slice(0, 10) : "",
    validityTo: partner.validityTo ? partner.validityTo.slice(0, 10) : "",
    amount: "",
    note: "",
  };
}

function MemberPicker({ members = [], selectedMember, onSelect, disabled }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) {
      return members.slice(0, 20);
    }

    return members
      .filter((member) =>
        [member.memberId, member.memberName, member.companyName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 20);
  }, [members, query]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (selectedMember) {
    return (
      <div className="flex min-h-10 items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
        <div className="min-w-0">
          <p className="truncate text-sm text-slate-700">
            <span className="font-semibold text-slate-900">{selectedMember.memberId}</span> —{" "}
            {selectedMember.memberName}
          </p>

          {selectedMember.companyName && (
            <p className="mt-0.5 truncate text-xs text-slate-500">{selectedMember.companyName}</p>
          )}
        </div>

        {!disabled && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="shrink-0 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline"
          >
            Change
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search Member ID, name or company"
        className={inputClass}
      />

      {open && (
        <ul className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-xl">
          {filtered.length === 0 ? (
            <li className="px-3 py-3 text-center text-sm text-slate-400">No members found</li>
          ) : (
            filtered.map((member) => (
              <li key={member.id}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onSelect(member);
                    setQuery("");
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate">
                      <span className="font-semibold text-slate-900">{member.memberId}</span> —{" "}
                      {member.memberName}
                    </p>

                    {member.companyName && (
                      <p className="mt-0.5 truncate text-xs text-slate-500">{member.companyName}</p>
                    )}
                  </div>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

function FormSection({ title, description, children }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 py-3.5 sm:px-5">
        <h2 className="text-sm font-bold text-slate-800">{title}</h2>

        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>

      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function PartnerForm({ partner, members = [], lockedMember, onCancel, onSaved }) {
  const isEdit = Boolean(partner);

  // Locked: the caller already knows which member this is for.
  const isMemberLocked = Boolean(lockedMember) && !isEdit;

  const [form, setForm] = useState(() => buildInitialForm(partner, lockedMember));

  const [selectedMember, setSelectedMember] = useState(partner?.member || lockedMember || null);

  const [existingPhotoUrl, setExistingPhotoUrl] = useState(
    typeof partner?.photo === "string" && /^https?:\/\//.test(partner.photo) ? partner.photo : null,
  );

  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const fileInputRef = useRef(null);

  useEffect(() => {
    setForm(buildInitialForm(partner, lockedMember));

    setSelectedMember(partner?.member || lockedMember || null);

    setExistingPhotoUrl(
      typeof partner?.photo === "string" && /^https?:\/\//.test(partner.photo)
        ? partner.photo
        : null,
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Only re-initialize when switching which partner/member is being edited.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partner?.id, lockedMember?.id]);

  useEffect(() => {
    if (!form.photo) {
      setPhotoPreview(null);
      return;
    }

    const url = URL.createObjectURL(form.photo);

    setPhotoPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [form.photo]);

  const updateField = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));

      setError("");
    }
  };

  const failValidation = (name, message) => {
    setError(message);
    setFieldErrors({ [name]: message });
    toast.error(message);
  };

  const selectMember = (member) => {
    setSelectedMember(member);

    setForm((prev) => ({
      ...prev,
      memberId: member?.memberId || "",
      companyName: member?.companyName || "",
      companyAddress: member?.companyAddress || "",
      companyTelephone: member?.companyTelephone || "",
      packetNo: member?.packetNo || "",
      state: member?.state?.stateName || member?.state || "",
      city: member?.city?.cityName || member?.city || "",
    }));

    if (fieldErrors.memberId) {
      setFieldErrors((prev) => ({
        ...prev,
        memberId: undefined,
      }));

      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isEdit && !form.memberId) {
      failValidation("memberId", "Choose the Member this partner belongs to.");
      return;
    }

    if (!form.partnerName.trim()) {
      failValidation("partnerName", "Partner Name is required.");
      return;
    }

    if (form.mobile && form.mobile.length !== 10) {
      failValidation("mobile", "Mobile number must be exactly 10 digits.");
      return;
    }

    if (form.aadharNo && form.aadharNo.length !== 12) {
      failValidation("aadharNo", "Aadhar Card No. must be exactly 12 digits.");
      return;
    }

    setError("");
    setFieldErrors({});
    setSaving(true);

    try {
      const saved = isEdit ? await updatePartner(partner.id, form) : await createPartner(form);

      toast.success(isEdit ? "Partner updated." : "Partner added.");

      onSaved(saved);
    } catch (requestError) {
      const message = requestError?.message || "Could not save partner.";

      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-2">
      {/* ==================== PHOTO ==================== */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Choose partner photo"
            className="group relative mx-auto shrink-0 cursor-pointer overflow-hidden rounded-xl sm:mx-0"
          >
            {photoPreview || existingPhotoUrl ? (
              <>
                <img
                  src={photoPreview || existingPhotoUrl}
                  alt="Partner preview"
                  className="h-28 w-28 rounded-xl border border-slate-200 object-cover shadow-sm sm:h-32 sm:w-32"
                />

                <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-slate-900/55 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                  Change Photo
                </span>
              </>
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-300 transition-colors group-hover:border-blue-400 group-hover:bg-blue-50 group-hover:text-blue-400 sm:h-32 sm:w-32">
                <ImageIcon className="h-9 w-9" />
              </div>
            )}
          </button>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h2 className="text-sm font-bold text-slate-800">Partner Photo</h2>

            <p className="mt-1 text-xs text-slate-500">
              Upload a clear and centered profile photo.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => updateField("photo", e.target.files?.[0] || null)}
              className="mt-3 block w-full text-xs text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border file:border-slate-200 file:bg-slate-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700 file:transition-colors hover:file:bg-slate-100"
            />
          </div>
        </div>
      </section>

      {/* ==================== MEMBER ==================== */}
      <FormSection title="Linked Member" description="Select the member this partner belongs to.">
        <FieldRow label="Linked Member" required error={fieldErrors.memberId}>
          <MemberPicker
            members={members}
            selectedMember={selectedMember}
            onSelect={selectMember}
            disabled={isEdit || isMemberLocked}
          />
        </FieldRow>
      </FormSection>

      {/* ==================== PERSONAL DETAILS ==================== */}
      <FormSection
        title="Personal Details"
        description="Enter the partner's personal and contact information."
      >
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Partner Name */}
          <FieldRow label="Partner Name" required error={fieldErrors.partnerName}>
            <input
              value={form.partnerName}
              onChange={(e) => updateField("partnerName", e.target.value)}
              className={fieldClass(fieldErrors.partnerName)}
              placeholder="Enter partner name"
            />
          </FieldRow>

          {/* Father's Name */}
          <FieldRow label="Father's Name">
            <input
              value={form.fatherName}
              onChange={(e) => updateField("fatherName", e.target.value)}
              className={inputClass}
              placeholder="Enter father's name"
            />
          </FieldRow>

          {/* Mobile */}
          <FieldRow label="Mobile" error={fieldErrors.mobile}>
            <input
              value={form.mobile}
              onChange={(e) => updateField("mobile", digitsOnly(e.target.value, 10))}
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit mobile number"
              className={fieldClass(fieldErrors.mobile)}
            />
          </FieldRow>

          {/* Residential Telephone */}
          <FieldRow label="Residential Telephone">
            <input
              value={form.residentialTelephone}
              onChange={(e) => updateField("residentialTelephone", e.target.value)}
              className={inputClass}
              placeholder="Residential telephone"
            />
          </FieldRow>

          {/* PAN */}
          <FieldRow label="PAN Card No.">
            <input
              value={form.panCardNo}
              onChange={(e) => updateField("panCardNo", e.target.value)}
              className={inputClass}
              placeholder="Enter PAN number"
            />
          </FieldRow>

          {/* Aadhar */}
          <FieldRow label="Aadhar Card No." error={fieldErrors.aadharNo}>
            <input
              value={form.aadharNo}
              onChange={(e) => updateField("aadharNo", digitsOnly(e.target.value, 12))}
              inputMode="numeric"
              maxLength={12}
              placeholder="12-digit Aadhar number"
              className={fieldClass(fieldErrors.aadharNo)}
            />
          </FieldRow>

          {/* Designation */}
          <FieldRow label="Designation">
            <DesignationCombobox
              value={form.designation}
              onChange={(value) => updateField("designation", value)}
            />
          </FieldRow>

          {/* Residential Address */}
          <div className="md:col-span-2 lg:col-span-3">
            <FieldRow label="Residential Address">
              <textarea
                value={form.residentialAddress}
                onChange={(e) => updateField("residentialAddress", e.target.value)}
                rows={3}
                placeholder="Enter complete residential address"
                className={textareaClass}
              />
            </FieldRow>
          </div>
        </div>
      </FormSection>

      {/* ==================== COMPANY DETAILS ==================== */}
      <FormSection
        title="Company Details"
        description="Company information is automatically filled from the linked member."
      >
        {!isEdit && (
          <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs leading-5 text-amber-700">
            Auto-filled from the linked member. You can adjust these details before saving.
          </div>
        )}

        <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Company Name */}
          <FieldRow label="Company Name">
            <input
              value={form.companyName}
              onChange={(e) => updateField("companyName", e.target.value)}
              className={inputClass}
              placeholder="Company name"
            />
          </FieldRow>

          {/* Company Address */}
          <FieldRow label="Company Address">
            <input
              value={form.companyAddress}
              onChange={(e) => updateField("companyAddress", e.target.value)}
              className={inputClass}
              placeholder="Company address"
            />
          </FieldRow>

          {/* Company Telephone */}
          <FieldRow label="Company Tel.">
            <input
              value={form.companyTelephone}
              onChange={(e) => updateField("companyTelephone", e.target.value)}
              className={inputClass}
              placeholder="Company telephone"
            />
          </FieldRow>

          {/* State */}
          <FieldRow label="State">
            <StateCombobox
              value={form.state}
              onChange={(value) => {
                updateField("state", value);

                // StateCombobox fires onChange on every keystroke
                // and on re-picking the same option.
                // Only clear city when state actually changes.
                if (value !== form.state) {
                  updateField("city", "");
                }
              }}
            />
          </FieldRow>

          {/* City */}
          <FieldRow label="City">
            <CityCombobox value={form.city} onChange={(value) => updateField("city", value)} />
          </FieldRow>

          {/* Packet Number */}
          <FieldRow label="Packet No.">
            <input
              value={form.packetNo}
              onChange={(e) => updateField("packetNo", e.target.value)}
              className={inputClass}
              placeholder="Packet number"
            />
          </FieldRow>
        </div>
      </FormSection>

      {/* ==================== MEMBERSHIP & PAYMENT ==================== */}
      <FormSection
        title="Membership & Payment"
        description="Manage joining date, validity and payment information."
      >
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Date of Joining */}
          <FieldRow label="Date of Joining">
            <input
              type="date"
              value={form.dateOfJoining}
              onChange={(e) => updateField("dateOfJoining", e.target.value)}
              className={inputClass}
            />
          </FieldRow>

          {/* Validity */}
          <FieldRow label="Validity To">
            <input
              type="date"
              value={form.validityTo}
              onChange={(e) => updateField("validityTo", e.target.value)}
              className={inputClass}
            />
          </FieldRow>

          {/* Amount */}
          <FieldRow label="Amount Paid">
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => updateField("amount", e.target.value)}
              className={inputClass}
              placeholder="Optional"
            />
          </FieldRow>

          {/* Note */}
          <div className="md:col-span-2 lg:col-span-3">
            <FieldRow label="Note">
              <textarea
                value={form.note}
                onChange={(e) => updateField("note", e.target.value)}
                rows={2}
                className={textareaClass}
                placeholder="Optional note"
              />
            </FieldRow>
          </div>
        </div>
      </FormSection>

      {/* ==================== ERROR ==================== */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* ==================== ACTIONS ==================== */}
      <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-2 border-t border-slate-200 bg-white/95 py-3 backdrop-blur sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="h-10 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="h-10 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : isEdit ? "Save Partner" : "Add Partner"}
        </button>
      </div>
    </form>
  );
}
