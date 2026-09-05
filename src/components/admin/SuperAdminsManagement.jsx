import { useEffect, useState } from "react";
import {
  Plus,
  ShieldCheck,
  Mail,
  Phone,
  UserRound,
  LockKeyhole,
  CheckCircle2,
  XCircle,
  Loader2,
  Users,
  X,
  AlertTriangle,
} from "lucide-react";

import { toast } from "react-toastify";

import { createSuperAdmin, getSuperAdmins, updateSuperAdminStatus } from "@/lib/super-admin-api";

import { FieldRow, inputClass } from "./directory-shared";
import { ChangePasswordModal } from "./ChangePasswordModal";

export function SuperAdminsManagement() {
  const [showForm, setShowForm] = useState(false);
  const [superAdmins, setSuperAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [passwordResetTarget, setPasswordResetTarget] = useState(null);

  // Status confirmation modal
  const [statusTarget, setStatusTarget] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // =========================================================
  // LOAD SUPER ADMINS
  // =========================================================
  const loadSuperAdmins = async () => {
    setLoading(true);

    try {
      const data = await getSuperAdmins();

      setSuperAdmins(data || []);
    } catch (requestError) {
      toast.error(requestError?.message || "Could not load Super Admins.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuperAdmins();
  }, []);

  // =========================================================
  // CREATE SUPER ADMIN
  // =========================================================
  const handleCreate = async (event) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const firstName = form.get("firstName")?.toString().trim();
    const lastName = form.get("lastName")?.toString().trim();
    const email = form.get("email")?.toString().trim();
    const phone = form.get("phone")?.toString().trim();
    const password = form.get("password")?.toString();

    setSaving(true);

    try {
      await createSuperAdmin({
        firstName,
        lastName,
        email,
        phone,
        password,
      });

      toast.success("Super Admin created successfully.");

      setShowForm(false);

      // Reload list
      await loadSuperAdmins();
    } catch (requestError) {
      toast.error(requestError?.message || "Could not create Super Admin.");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // HELPERS
  // =========================================================
  const getAdminId = (superAdmin) => {
    return superAdmin?.id || superAdmin?._id;
  };

  const getAdminName = (superAdmin) => {
    return (
      superAdmin?.name ||
      [superAdmin?.firstName, superAdmin?.lastName].filter(Boolean).join(" ") ||
      "Unnamed Admin"
    );
  };

  const getIsActive = (superAdmin) => {
    return superAdmin?.isActive ?? superAdmin?.active ?? superAdmin?.status === "ACTIVE";
  };

  // =========================================================
  // OPEN STATUS CONFIRMATION MODAL
  // =========================================================
  const handleStatusClick = (superAdmin) => {
    setStatusTarget(superAdmin);
  };

  // =========================================================
  // CONFIRM STATUS CHANGE
  // =========================================================
  const confirmStatusChange = async () => {
    if (!statusTarget) return;

    const id = getAdminId(statusTarget);

    if (!id) {
      toast.error("Super Admin ID is missing.");
      return;
    }

    const currentStatus = getIsActive(statusTarget);
    const newStatus = !currentStatus;

    setStatusUpdating(true);

    try {
      // Same API and same payload logic
      await updateSuperAdminStatus(id, {
        isActive: newStatus,
      });

      toast.success(
        newStatus ? "Super Admin activated successfully." : "Super Admin deactivated successfully.",
      );

      // Close modal
      setStatusTarget(null);

      // Reload list
      await loadSuperAdmins();
    } catch (requestError) {
      toast.error(requestError?.message || "Could not update Super Admin status.");
    } finally {
      setStatusUpdating(false);
    }
  };

  // =========================================================
  // CANCEL STATUS CHANGE
  // =========================================================
  const cancelStatusChange = () => {
    if (statusUpdating) return;

    setStatusTarget(null);
  };

  return (
    <section className="space-y-4">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">Super Admins</h2>

              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                Manage administrator accounts and access
              </p>
            </div>
          </div>

          {/* NEW SUPER ADMIN */}
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="
              inline-flex h-10 w-full items-center
              justify-center gap-2 rounded-lg
              bg-red-700 px-4 text-sm font-semibold
              text-white shadow-sm transition-all
              hover:bg-red-800 hover:shadow-md
              active:scale-[0.98]
              sm:w-auto
            "
          >
            <Plus className="h-4 w-4" />
            New Super Admin
          </button>
        </div>
      </div>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* ===================================================
            LOADING
        ==================================================== */}
        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-4">
            <Loader2 className="h-7 w-7 animate-spin text-red-700" />

            <p className="mt-3 text-sm font-medium text-slate-500">Loading Super Admins...</p>
          </div>
        ) : superAdmins.length ? (
          <>
            {/* =================================================
                MOBILE VIEW
            ================================================== */}
            <div className="space-y-3 p-3 md:hidden">
              {superAdmins.map((superAdmin) => {
                const isActive = getIsActive(superAdmin);
                const name = getAdminName(superAdmin);

                return (
                  <div
                    key={getAdminId(superAdmin) || superAdmin.email}
                    className="
                      rounded-xl border border-slate-200
                      bg-white p-4 transition-all
                      hover:border-red-200 hover:shadow-sm
                    "
                  >
                    {/* TOP */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        {/* AVATAR */}
                        <div
                          className="
                            flex h-10 w-10 shrink-0
                            items-center justify-center
                            rounded-full bg-red-50 text-red-700
                          "
                        >
                          <UserRound className="h-5 w-5" />
                        </div>

                        {/* NAME */}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">{name}</p>

                          <div
                            className="
                              mt-1 flex min-w-0
                              items-center gap-1.5
                              text-xs text-slate-500
                            "
                          >
                            <Mail className="h-3.5 w-3.5 shrink-0" />

                            <span className="truncate">{superAdmin.email || "—"}</span>
                          </div>
                        </div>
                      </div>

                      {/* STATUS */}
                      <button
                        type="button"
                        onClick={() => handleStatusClick(superAdmin)}
                        disabled={statusUpdating}
                        className={`
                          inline-flex shrink-0
                          items-center gap-1.5
                          rounded-full px-2.5 py-1
                          text-xs font-semibold
                          transition-all
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                          ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }
                        `}
                      >
                        <span
                          className={`
                            h-1.5 w-1.5 rounded-full
                            ${isActive ? "bg-emerald-500" : "bg-slate-400"}
                          `}
                        />

                        {isActive ? "Active" : "Inactive"}
                      </button>
                    </div>

                    {/* DETAILS */}
                    <div
                      className="
                        mt-4 grid grid-cols-1 gap-2
                        rounded-lg bg-slate-50 p-3
                        sm:grid-cols-2
                      "
                    >
                      {/* ROLE */}
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <ShieldCheck className="h-4 w-4 text-red-600" />

                        <span>
                          Role:{" "}
                          <strong className="text-slate-800">
                            {superAdmin.role || "SUPER_ADMIN"}
                          </strong>
                        </span>
                      </div>

                      {/* PHONE */}
                      {superAdmin.phone && (
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Phone className="h-4 w-4 text-slate-400" />

                          <span>{superAdmin.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* PASSWORD */}
                    <div
                      className="
                        mt-3 flex justify-end
                        border-t border-slate-100 pt-3
                      "
                    >
                      <button
                        type="button"
                        onClick={() => setPasswordResetTarget(superAdmin)}
                        className="
                          inline-flex items-center
                          gap-1.5 rounded-lg px-3 py-2
                          text-xs font-semibold
                          text-slate-600 transition-colors
                          hover:bg-red-50
                          hover:text-red-700
                        "
                      >
                        <LockKeyhole className="h-3.5 w-3.5" />
                        Change password
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* =================================================
                DESKTOP VIEW
            ================================================== */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th
                      className="
                        px-5 py-3 text-xs font-bold
                        uppercase tracking-wide text-slate-500
                      "
                    >
                      Admin
                    </th>

                    <th
                      className="
                        px-5 py-3 text-xs font-bold
                        uppercase tracking-wide text-slate-500
                      "
                    >
                      Contact
                    </th>

                    <th
                      className="
                        px-5 py-3 text-xs font-bold
                        uppercase tracking-wide text-slate-500
                      "
                    >
                      Role
                    </th>

                    <th
                      className="
                        px-5 py-3 text-xs font-bold
                        uppercase tracking-wide text-slate-500
                      "
                    >
                      Status
                    </th>

                    <th
                      className="
                        px-5 py-3 text-right text-xs
                        font-bold uppercase tracking-wide
                        text-slate-500
                      "
                    >
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {superAdmins.map((superAdmin, index) => {
                    const isActive = getIsActive(superAdmin);
                    const name = getAdminName(superAdmin);

                    return (
                      <tr
                        key={getAdminId(superAdmin) || superAdmin.email}
                        className={`
                          border-b border-slate-100
                          transition-colors
                          hover:bg-red-50/40
                          ${index % 2 === 0 ? "bg-white" : "bg-slate-50/40"}
                        `}
                      >
                        {/* ADMIN */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="
                                flex h-9 w-9
                                items-center justify-center
                                rounded-full bg-red-50
                                text-red-700
                              "
                            >
                              <UserRound className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                              <p
                                className="
                                  truncate text-sm
                                  font-semibold text-slate-900
                                "
                              >
                                {name}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-400">Administrator</p>
                            </div>
                          </div>
                        </td>

                        {/* CONTACT */}
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <div
                              className="
                                flex items-center gap-2
                                text-sm text-slate-600
                              "
                            >
                              <Mail className="h-3.5 w-3.5 text-slate-400" />

                              <span className="max-w-[220px] truncate">
                                {superAdmin.email || "—"}
                              </span>
                            </div>

                            {superAdmin.phone && (
                              <div
                                className="
                                  flex items-center gap-2
                                  text-xs text-slate-400
                                "
                              >
                                <Phone className="h-3.5 w-3.5" />

                                {superAdmin.phone}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* ROLE */}
                        <td className="px-5 py-4">
                          <span
                            className="
                              inline-flex items-center
                              gap-1.5 rounded-md
                              bg-red-50 px-2.5 py-1
                              text-xs font-semibold
                              text-red-700
                            "
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />

                            {superAdmin.role || "SUPER_ADMIN"}
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => handleStatusClick(superAdmin)}
                            disabled={statusUpdating}
                            className={`
                              inline-flex items-center
                              gap-1.5 rounded-full
                              px-3 py-1 text-xs
                              font-semibold transition-all
                              disabled:cursor-not-allowed
                              disabled:opacity-60
                              ${
                                isActive
                                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }
                            `}
                          >
                            {isActive ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5" />
                            )}

                            {isActive ? "Active" : "Inactive"}
                          </button>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-5 py-4">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => setPasswordResetTarget(superAdmin)}
                              className="
                                inline-flex items-center
                                gap-1.5 rounded-lg
                                px-3 py-2 text-xs
                                font-semibold text-slate-600
                                transition-all
                                hover:bg-red-50
                                hover:text-red-700
                              "
                            >
                              <LockKeyhole className="h-3.5 w-3.5" />
                              Change password
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
        ) : (
          /* =================================================
             EMPTY STATE
          ================================================== */
          <div
            className="
              flex min-h-72 flex-col
              items-center justify-center
              px-4 text-center
            "
          >
            <div
              className="
                flex h-14 w-14 items-center
                justify-center rounded-full
                bg-red-50 text-red-700
              "
            >
              <Users className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-800">No Super Admins found</h3>

            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
              Create your first Super Admin account to start managing administrator access.
            </p>

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="
                mt-4 inline-flex items-center gap-2
                rounded-lg bg-red-700 px-4 py-2
                text-xs font-semibold text-white
                transition-colors hover:bg-red-800
              "
            >
              <Plus className="h-4 w-4" />
              Create Super Admin
            </button>
          </div>
        )}
      </div>

      {/* =====================================================
          CREATE SUPER ADMIN MODAL
      ====================================================== */}
     {showForm && (
  <div
    className="
      fixed inset-0 z-50 flex items-center justify-center
      bg-slate-950/60 p-3 backdrop-blur-[2px]
      sm:p-5
    "
    role="dialog"
    aria-modal="true"
    aria-labelledby="create-super-admin-title"
  >
    <form
      onSubmit={handleCreate}
      className="
        flex max-h-[95vh] w-full max-w-2xl
        flex-col overflow-hidden
        rounded-2xl bg-white shadow-2xl
      "
    >
      {/* ================= HEADER ================= */}
      <div
        className="
          flex shrink-0 items-center justify-between
          border-b border-slate-200
          bg-white px-5 py-5
          sm:px-6 sm:py-6
        "
      >
        <div className="flex items-center gap-3">
          <div
            className="
              flex h-11 w-11 shrink-0
              items-center justify-center
              rounded-xl bg-red-50
              text-red-700
            "
          >
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div>
            <h3
              id="create-super-admin-title"
              className="
                text-lg font-bold
                text-slate-900
              "
            >
              Create Super Admin
            </h3>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Add a new administrator account
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!saving) {
              setShowForm(false);
            }
          }}
          disabled={saving}
          aria-label="Close"
          className="
            flex h-9 w-9 shrink-0
            items-center justify-center
            rounded-lg text-slate-400
            transition-all
            hover:bg-red-50 hover:text-red-700
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* ================= FORM BODY ================= */}
      <div className="flex-1 overflow-y-auto">
        <div
          className="
            grid grid-cols-1 gap-6
            p-5
            sm:grid-cols-2
            sm:p-7
          "
        >
          {/* FIRST NAME */}
          <FieldRow label="First name" required>
            <input
              name="firstName"
              type="text"
              required
              autoComplete="given-name"
              placeholder="Enter first name"
              className={`
                ${inputClass}
                h-12 w-full
                rounded-lg
                px-4
                text-sm
                transition-all
                focus:border-red-600
                focus:outline-none
                focus:ring-2
                focus:ring-red-100
              `}
            />
          </FieldRow>

          {/* LAST NAME */}
          <FieldRow label="Last name" required>
            <input
              name="lastName"
              type="text"
              required
              autoComplete="family-name"
              placeholder="Enter last name"
              className={`
                ${inputClass}
                h-12 w-full
                rounded-lg
                px-4
                text-sm
                transition-all
                focus:border-red-600
                focus:outline-none
                focus:ring-2
                focus:ring-red-100
              `}
            />
          </FieldRow>

          {/* EMAIL */}
          <FieldRow label="Email address" required>
            <div className="relative">
              <Mail
                className="
                  pointer-events-none
                  absolute left-3.5 top-1/2
                  h-4 w-4
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@example.com"
                className={`
                  ${inputClass}
                  h-12 w-full
                  rounded-lg
                  pl-11 pr-4
                  text-sm
                  transition-all
                  focus:border-red-600
                  focus:outline-none
                  focus:ring-2
                  focus:ring-red-100
                `}
              />
            </div>
          </FieldRow>

          {/* PHONE */}
          <FieldRow label="Phone number" required>
            <div className="relative">
              <Phone
                className="
                  pointer-events-none
                  absolute left-3.5 top-1/2
                  h-4 w-4
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                placeholder="Enter phone number"
                className={`
                  ${inputClass}
                  h-12 w-full
                  rounded-lg
                  pl-11 pr-4
                  text-sm
                  transition-all
                  focus:border-red-600
                  focus:outline-none
                  focus:ring-2
                  focus:ring-red-100
                `}
              />
            </div>
          </FieldRow>

          {/* PASSWORD */}
          <div className="sm:col-span-2">
            <FieldRow label="Password" required>
              <div className="relative">
                <LockKeyhole
                  className="
                    pointer-events-none
                    absolute left-3.5 top-1/2
                    h-4 w-4
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Enter a secure password"
                  className={`
                    ${inputClass}
                    h-12 w-full
                    rounded-lg
                    pl-11 pr-4
                    text-sm
                    transition-all
                    focus:border-red-600
                    focus:outline-none
                    focus:ring-2
                    focus:ring-red-100
                  `}
                />
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Password must be at least 6 characters.
              </p>
            </FieldRow>
          </div>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <div
        className="
          flex shrink-0
          flex-col-reverse gap-3
          border-t border-slate-200
          bg-slate-50
          px-5 py-4
          sm:flex-row sm:items-center
          sm:justify-end
          sm:px-7 sm:py-5
        "
      >
        {/* CANCEL */}
        <button
          type="button"
          onClick={() => setShowForm(false)}
          disabled={saving}
          className="
            h-11 w-full
            rounded-lg
            border border-slate-200
            bg-white px-6
            text-sm font-semibold
            text-slate-600
            transition-all
            hover:border-slate-300
            hover:bg-slate-100
            disabled:cursor-not-allowed
            disabled:opacity-50
            sm:w-auto
          "
        >
          Cancel
        </button>

        {/* CREATE */}
        <button
          type="submit"
          disabled={saving}
          className="
            inline-flex h-11 w-full
            items-center justify-center
            gap-2 rounded-lg
            bg-red-700 px-7
            text-sm font-semibold
            text-white
            shadow-sm
            transition-all
            hover:bg-red-800
            hover:shadow-md
            active:scale-[0.98]
            disabled:cursor-not-allowed
            disabled:opacity-60
            sm:w-auto
          "
        >
          {saving && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}

          {saving
            ? "Creating..."
            : "Create Super Admin"}
        </button>
      </div>
    </form>
  </div>
)}

      {/* =====================================================
          STATUS CONFIRMATION MODAL
      ====================================================== */}
      {statusTarget && (
        <div
          className="
            fixed inset-0 z-[60]
            flex items-center justify-center
            bg-slate-950/60 p-4
            backdrop-blur-[2px]
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="status-confirm-title"
        >
          <div
            className="
              w-full max-w-md overflow-hidden
              rounded-2xl bg-white shadow-2xl
            "
          >
            {/* CONTENT */}
            <div className="p-5 sm:p-6">
              <div className="flex items-start gap-4">
                {/* ICON */}
                <div
                  className="
                    flex h-11 w-11 shrink-0
                    items-center justify-center
                    rounded-full bg-red-50
                    text-red-700
                  "
                >
                  <AlertTriangle className="h-5 w-5" />
                </div>

                {/* TEXT */}
                <div className="min-w-0">
                  <h3
                    id="status-confirm-title"
                    className="
                      text-base font-bold
                      text-slate-900
                    "
                  >
                    {getIsActive(statusTarget)
                      ? "Deactivate Super Admin?"
                      : "Activate Super Admin?"}
                  </h3>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Are you sure you want to{" "}
                    <span className="font-semibold text-slate-700">
                      {getIsActive(statusTarget) ? "deactivate" : "activate"}
                    </span>{" "}
                    this Super Admin account?
                  </p>
                </div>
              </div>

              {/* ADMIN */}
              <div
                className="
                  mt-5 rounded-xl
                  border border-slate-200
                  bg-slate-50 p-3
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex h-10 w-10 shrink-0
                      items-center justify-center
                      rounded-full bg-red-50
                      text-red-700
                    "
                  >
                    <UserRound className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {getAdminName(statusTarget)}
                    </p>

                    <p className="truncate text-xs text-slate-500">{statusTarget.email || "—"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div
              className="
                flex flex-col-reverse gap-2
                border-t border-slate-200
                bg-slate-50 px-5 py-4
                sm:flex-row sm:justify-end
              "
            >
              {/* CANCEL */}
              <button
                type="button"
                onClick={cancelStatusChange}
                disabled={statusUpdating}
                className="
                  h-10 rounded-lg
                  border border-slate-200
                  bg-white px-5
                  text-sm font-semibold
                  text-slate-600
                  transition-colors
                  hover:bg-slate-100
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              {/* CONFIRM */}
              <button
                type="button"
                onClick={confirmStatusChange}
                disabled={statusUpdating}
                className="
                  inline-flex h-10
                  items-center justify-center
                  gap-2 rounded-lg
                  bg-red-700 px-5
                  text-sm font-semibold
                  text-white shadow-sm
                  transition-all
                  hover:bg-red-800
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {statusUpdating && <Loader2 className="h-4 w-4 animate-spin" />}

                {statusUpdating
                  ? "Updating..."
                  : getIsActive(statusTarget)
                    ? "Deactivate"
                    : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          CHANGE PASSWORD MODAL
      ====================================================== */}
      {passwordResetTarget && (
        <ChangePasswordModal
          onClose={() => setPasswordResetTarget(null)}
          defaultEmail={passwordResetTarget.email}
          superAdminId={passwordResetTarget.id || passwordResetTarget._id}
        />
      )}
    </section>
  );
}
