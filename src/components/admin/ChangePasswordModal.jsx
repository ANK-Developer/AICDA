import { useState } from "react";
import { useChangePasswordMutation } from "@/features/auth/authApi";
import { useResetSuperAdminPasswordMutation } from "@/features/superAdmins/superAdminsApi";

export function ChangePasswordModal({ onClose, defaultEmail, superAdminId }) {
  const [email, setEmail] = useState(defaultEmail || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [changePassword] = useChangePasswordMutation();
  const [resetSuperAdminPassword] = useResetSuperAdminPasswordMutation();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!superAdminId && !email.trim()) {
      setError("Email is required.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setSaving(true);
    try {
      if (superAdminId) {
        await resetSuperAdminPassword({
          id: superAdminId,
          payload: { newPassword, confirmPassword },
        }).unwrap();
      } else {
        await changePassword({ email: email.trim(), newPassword, confirmPassword }).unwrap();
      }
      setSuccess(true);
    } catch (requestError) {
      setError(requestError.message || "Could not update password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
        <h3 id="change-password-title" className="text-2xl font-bold text-slate-800">
          Change password
        </h3>

        {success ? (
          <>
            <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Password updated successfully.
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-deep"
              >
                Done
              </button>
            </div>
          </>
        ) : (
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            {superAdminId ? (
              <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Resetting password for{" "}
                <span className="font-semibold">{email || "this account"}</span>
              </p>
            ) : (
              <div>
                <label
                  htmlFor="change-password-email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email
                </label>
                <input
                  id="change-password-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@example.com"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  Whose password you want to change. Defaults to your own account.
                </p>
              </div>
            )}
            <div>
              <label
                htmlFor="change-new-password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                New password
              </label>
              <input
                id="change-new-password"
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"
              />
            </div>
            <div>
              <label
                htmlFor="confirm-new-password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Confirm new password
              </label>
              <input
                id="confirm-new-password"
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="h-11 rounded-lg bg-slate-100 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-deep disabled:opacity-60"
              >
                {saving ? "Updating…" : "Update password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
