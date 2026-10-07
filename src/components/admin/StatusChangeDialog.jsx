import { useEffect, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MIN_REASON_LENGTH = 3;
const MAX_REASON_LENGTH = 500;

// Manual Active / Inactive switch for a member or partner. It only changes the
// admin's own status — whether the plan has expired or is unpaid is shown
// separately and is never changed from here. Deactivating needs a reason.
//
// `target` is the record being changed (null = closed); `noun` is "member" or
// "partner"; `onConfirm(isActive, reason)` performs the request.
export function StatusChangeDialog({ target, noun, name, updating, onConfirm, onClose }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setReason("");
    setError("");
  }, [target]);

  // The manual status, not the combined one — an expired member can still be
  // manually Active, and that is what this switch flips.
  const manuallyActive = target?.status?.status !== "INACTIVE";
  const deactivating = manuallyActive;

  const submit = () => {
    const cleanReason = reason.trim();

    if (deactivating && cleanReason.length < MIN_REASON_LENGTH) {
      setError(`Please give a reason (at least ${MIN_REASON_LENGTH} characters).`);
      return;
    }

    onConfirm(!manuallyActive, cleanReason);
  };

  return (
    <AlertDialog
      open={target != null}
      onOpenChange={(open) => {
        if (!open && !updating) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {deactivating ? `Deactivate ${noun}?` : `Activate ${noun}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {deactivating
              ? `${name || `This ${noun}`} will be marked Inactive and hidden from the public directory, whatever their plan dates.`
              : `${name || `This ${noun}`} will be marked Active again. They are shown in the public directory only while their plan is valid.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {!deactivating && target?.status?.reason && (
          <p className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Deactivated earlier: {target.status.reason}
            {target.status.actionBy ? ` (by ${target.status.actionBy})` : ""}
          </p>
        )}

        <div>
          <label htmlFor="status-reason" className="mb-1.5 block text-sm font-semibold text-slate-700">
            Reason {deactivating ? <span className="text-red-600">*</span> : "(optional)"}
          </label>

          <textarea
            id="status-reason"
            value={reason}
            maxLength={MAX_REASON_LENGTH}
            rows={3}
            disabled={updating}
            onChange={(event) => {
              setReason(event.target.value);
              setError("");
            }}
            placeholder={
              deactivating
                ? "e.g. Payment dispute, complaint, left the association, wrong entry"
                : "Add a note (optional)"
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-red-500 focus:ring-2 focus:ring-red-500/15 disabled:opacity-60"
          />

          {error && (
            <p role="alert" className="mt-1 text-xs font-medium text-red-600">
              {error}
            </p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={updating}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              submit();
            }}
            disabled={updating}
          >
            {updating ? "Updating…" : "Confirm"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
