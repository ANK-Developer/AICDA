import { useEffect, useMemo, useRef, useState } from "react";

import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Image as ImageIcon,
  MapPin,
  Phone,
  Save,
  User,
  Users,
  X,
} from "lucide-react";

import { toast } from "sonner";

import { createMember, updateMember } from "@/lib/member-api";
import { getDistrictsForStateName } from "@/lib/india-districts";

import {
  DesignationCombobox,
  DistrictSelect,
  PROFILE_FIELD_KEYS,
  StateCombobox,
  digitsOnly,
  fieldClass,
  inputClass,
  textareaClass,
} from "./directory-shared";

/* =========================================================
   INITIAL FORM
========================================================= */

function buildInitialForm(member) {
  if (!member) {
    return {
      memberId: "",
      memberName: "",
      fatherName: "",
      dateOfBirth: "",
      photo: null,
      residentialAddress: "",
      mobile: "",
      residentialTelephone: "",
      panCardNo: "",
      designation: "",
      companyName: "",
      companyAddress: "",
      state: "",
      district: "",
      city: "",
      companyTelephone: "",
      packetNo: "",
      dateOfJoining: "",
      aadharNo: "",
      validityTo: "",
      amount: "",
      note: "",
    };
  }

  return {
    memberId: member.memberId != null ? String(member.memberId) : "",
    memberName: member.memberName || "",
    fatherName: member.fatherName || "",
    dateOfBirth: member.dateOfBirth ? member.dateOfBirth.slice(0, 10) : "",
    photo: null,
    residentialAddress: member.residentialAddress || "",
    mobile: member.mobile || "",
    residentialTelephone: member.residentialTelephone || "",
    panCardNo: member.panCardNo || "",
    designation: member.designation || "",
    companyName: member.companyName || "",
    companyAddress: member.companyAddress || "",
    state: member.state?.stateName || member.state || "",
    district: member.district || "",
    city: member.city?.cityName || member.city || "",
    companyTelephone: member.companyTelephone || "",
    packetNo: member.packetNo || "",
    dateOfJoining: member.dateOfJoining ? member.dateOfJoining.slice(0, 10) : "",
    aadharNo: member.aadharNo || "",
    validityTo: member.validityTo ? member.validityTo.slice(0, 10) : "",
    amount: "",
    note: "",
  };
}

/* =========================================================
   SECTION
========================================================= */

function FormSection({ icon: Icon, title, description, children }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Icon className="h-[18px] w-[18px]" />
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>

          {description && <p className="mt-0.5 text-[11px] text-slate-500">{description}</p>}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

/* =========================================================
   FORM INPUT
========================================================= */

function FormInput({ label, required = false, error, children }) {
  return (
    <div className="min-w-0 space-y-1.5">
      <label className="block truncate text-[12px] font-semibold text-slate-600">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {children}

      {error && <p className="text-[11px] font-medium text-red-500">{error}</p>}
    </div>
  );
}

/* =========================================================
   MEMBER FORM
========================================================= */

export function MemberForm({ member, onCancel, onSaved }) {
  const isEdit = Boolean(member);

  const [form, setForm] = useState(() => buildInitialForm(member));

  const [existingPhotoUrl, setExistingPhotoUrl] = useState(
    typeof member?.photo === "string" && /^https?:\/\//.test(member.photo) ? member.photo : null,
  );

  const [photoPreview, setPhotoPreview] = useState(null);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});

  const fileInputRef = useRef(null);

  /* =======================================================
     INITIALIZE FORM
  ======================================================= */

  useEffect(() => {
    setForm(buildInitialForm(member));

    setExistingPhotoUrl(
      typeof member?.photo === "string" && /^https?:\/\//.test(member.photo) ? member.photo : null,
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member?.id]);

  /* =======================================================
     PHOTO PREVIEW
  ======================================================= */

  useEffect(() => {
    if (!form.photo) {
      setPhotoPreview(null);
      return;
    }

    const url = URL.createObjectURL(form.photo);

    setPhotoPreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [form.photo]);

  /* =======================================================
     DISTRICTS
  ======================================================= */

  const districtOptions = useMemo(() => getDistrictsForStateName(form.state), [form.state]);

  /* =======================================================
     MISSING PROFILE FIELDS
  ======================================================= */

  const missingProfileFields = useMemo(() => {
    return PROFILE_FIELD_KEYS.filter(([key]) => {
      if (key === "photo") {
        return !(form.photo || existingPhotoUrl);
      }

      return !String(form[key] || "").trim();
    }).map(([, label]) => label);
  }, [form, existingPhotoUrl]);

  /* =======================================================
     UPDATE FIELD
  ======================================================= */

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

  /* =======================================================
     VALIDATION ERROR
  ======================================================= */

  const failValidation = (name, message) => {
    setError(message);

    setFieldErrors({
      [name]: message,
    });

    toast.error(message);
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.memberId.trim()) {
      failValidation("memberId", "Member ID is required.");
      return;
    }

    if (!form.memberName.trim()) {
      failValidation("memberName", "Member Name is required.");
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
      const saved = isEdit ? await updateMember(member.id, form) : await createMember(form);

      toast.success(isEdit ? "Member updated." : "Member added.");

      onSaved(saved);
    } catch (requestError) {
      const message = requestError.message || "Could not save member.";

      setError(message);

      if (/member id.*already in use/i.test(message)) {
        setFieldErrors({
          memberId: message,
        });
      }

      toast.error(message, {
        duration: 6000,
      });
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     JSX
  ======================================================= */

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-2">
      {/* ===================================================
          PROFILE PHOTO
      =================================================== */}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
          {/* Photo */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Choose member photo"
            className="group relative mx-auto shrink-0 cursor-pointer overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mx-0"
          >
            {photoPreview || existingPhotoUrl ? (
              <>
                <img
                  src={photoPreview || existingPhotoUrl}
                  alt="Member preview"
                  className="h-28 w-28 rounded-xl border border-slate-200 object-cover shadow-sm transition-transform duration-200 group-hover:scale-105 sm:h-32 sm:w-32"
                />

                <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-slate-900/60 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                  Change Photo
                </span>
              </>
            ) : (
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 transition-all group-hover:border-blue-400 group-hover:bg-blue-50 group-hover:text-blue-500 sm:h-32 sm:w-32">
                <ImageIcon className="h-8 w-8" />

                <span className="mt-2 text-[10px] font-semibold">Upload Photo</span>
              </div>
            )}
          </button>

          {/* Photo Info */}
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-bold text-slate-800">Member Profile</h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Add a clear profile photo and basic member information.
                </p>
              </div>

              {isEdit && (
                <span className="mx-auto inline-flex w-fit items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600 sm:ml-2 sm:mr-0">
                  <CheckCircle2 className="h-3 w-3" />
                  Editing Member
                </span>
              )}
            </div>

            <div className="mt-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => updateField("photo", e.target.files?.[0] || null)}
                className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border file:border-slate-200 file:bg-slate-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-100"
              />

              <p className="mt-1.5 text-[11px] text-slate-400">
                JPG, PNG or other image format. A clear, centered photo works best.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          PERSONAL DETAILS
      =================================================== */}

      <FormSection
        icon={User}
        title="Personal Details"
        description="Basic information about the member"
      >
        {/* 3 columns on LG */}
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
          <FormInput label="Member ID" required error={fieldErrors.memberId}>
            <input
              value={form.memberId}
              onChange={(e) => updateField("memberId", e.target.value)}
              placeholder="Enter member ID"
              className={fieldClass(fieldErrors.memberId)}
            />
          </FormInput>

          <FormInput label="Member Name" required error={fieldErrors.memberName}>
            <input
              value={form.memberName}
              onChange={(e) => updateField("memberName", e.target.value)}
              placeholder="Enter member name"
              className={fieldClass(fieldErrors.memberName)}
            />
          </FormInput>

          <FormInput label="Father's Name">
            <input
              value={form.fatherName}
              onChange={(e) => updateField("fatherName", e.target.value)}
              placeholder="Enter father's name"
              className={inputClass}
            />
          </FormInput>

          <FormInput label="Mobile" error={fieldErrors.mobile}>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={form.mobile}
                onChange={(e) => updateField("mobile", digitsOnly(e.target.value, 10))}
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile"
                className={`pl-9 ${fieldClass(fieldErrors.mobile)}`}
              />
            </div>
          </FormInput>

          <FormInput label="Residential Telephone">
            <input
              value={form.residentialTelephone}
              onChange={(e) => updateField("residentialTelephone", e.target.value)}
              placeholder="Enter telephone"
              className={inputClass}
            />
          </FormInput>

          <FormInput label="PAN Card No.">
            <input
              value={form.panCardNo}
              onChange={(e) => updateField("panCardNo", e.target.value)}
              placeholder="Enter PAN number"
              className={inputClass}
            />
          </FormInput>

          <FormInput label="Aadhar Card No." error={fieldErrors.aadharNo}>
            <input
              value={form.aadharNo}
              onChange={(e) => updateField("aadharNo", digitsOnly(e.target.value, 12))}
              inputMode="numeric"
              maxLength={12}
              placeholder="12-digit Aadhar"
              className={fieldClass(fieldErrors.aadharNo)}
            />
          </FormInput>

          <FormInput label="Designation">
            <DesignationCombobox
              value={form.designation}
              onChange={(value) => updateField("designation", value)}
            />
          </FormInput>

          {/* Address full width */}
          <div className="lg:col-span-3">
            <FormInput label="Residential Address">
              <textarea
                value={form.residentialAddress}
                onChange={(e) => updateField("residentialAddress", e.target.value)}
                rows={2}
                placeholder="Enter complete residential address"
                className={textareaClass}
              />
            </FormInput>
          </div>
        </div>
      </FormSection>

      {/* ===================================================
          COMPANY DETAILS
      =================================================== */}

      <FormSection
        icon={Users}
        title="Company Details"
        description="Professional and workplace information"
      >
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
          <FormInput label="Company Name">
            <input
              value={form.companyName}
              onChange={(e) => updateField("companyName", e.target.value)}
              placeholder="Enter company name"
              className={inputClass}
            />
          </FormInput>

          <FormInput label="Company Address">
            <input
              value={form.companyAddress}
              onChange={(e) => updateField("companyAddress", e.target.value)}
              placeholder="Enter company address"
              className={inputClass}
            />
          </FormInput>

          <FormInput label="Company Telephone">
            <input
              value={form.companyTelephone}
              onChange={(e) => updateField("companyTelephone", e.target.value)}
              placeholder="Enter company telephone"
              className={inputClass}
            />
          </FormInput>

          <FormInput label="State">
            <StateCombobox
              value={form.state}
              onChange={(value) => {
                updateField("state", value);

                if (value !== form.state) {
                  updateField("district", "");

                  updateField("city", "");
                }
              }}
            />
          </FormInput>

          <FormInput label="District">
            <DistrictSelect
              value={form.district}
              onChange={(value) => updateField("district", value)}
              districts={districtOptions}
              disabled={districtOptions.length === 0}
            />
          </FormInput>

          <FormInput label="City">
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="Type city name"
                className={`pl-9 ${inputClass}`}
              />
            </div>
          </FormInput>

          <FormInput label="Packet No.">
            <input
              value={form.packetNo}
              onChange={(e) => updateField("packetNo", e.target.value)}
              maxLength={10}
              placeholder="Enter packet number"
              className={inputClass}
            />
          </FormInput>

          <FormInput label="Birth Day">
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => updateField("dateOfBirth", e.target.value)}
                className={`pl-9 ${inputClass}`}
              />
            </div>
          </FormInput>
        </div>
      </FormSection>

      {/* ===================================================
          MEMBERSHIP & PAYMENT
      =================================================== */}

      <FormSection
        icon={CreditCard}
        title="Membership & Payment"
        description="Membership dates and payment information"
      >
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
          <FormInput label="Date of Joining">
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="date"
                value={form.dateOfJoining}
                onChange={(e) => updateField("dateOfJoining", e.target.value)}
                className={`pl-9 ${inputClass}`}
              />
            </div>
          </FormInput>

          <FormInput label="Validity To">
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="date"
                value={form.validityTo}
                onChange={(e) => updateField("validityTo", e.target.value)}
                className={`pl-9 ${inputClass}`}
              />
            </div>
          </FormInput>

          <FormInput label="Amount Paid">
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => updateField("amount", e.target.value)}
              placeholder="Optional"
              className={inputClass}
            />
          </FormInput>

          <div className="lg:col-span-3">
            <FormInput label="Note">
              <input
                value={form.note}
                onChange={(e) => updateField("note", e.target.value)}
                placeholder="Optional note"
                className={inputClass}
              />
            </FormInput>
          </div>
        </div>
      </FormSection>

      {/* ===================================================
          INCOMPLETE PROFILE
      =================================================== */}

      {missingProfileFields.length > 0 && (
        <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <span className="text-sm font-bold">!</span>
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold text-amber-800">Profile is still incomplete</p>

            <p className="mt-0.5 text-[11px] leading-5 text-amber-700">
              Missing: {missingProfileFields.join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <X className="h-4 w-4" />
          </div>

          <div>
            <p className="text-xs font-bold text-red-800">Unable to save member</p>

            <p className="mt-0.5 text-[11px] text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* ===================================================
          ACTION BUTTONS
      =================================================== */}

      <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-white pt-4 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {isEdit ? "Save Member" : "Add Member"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
