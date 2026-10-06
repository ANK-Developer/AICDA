import { toast } from "react-toastify";

// react-toastify has no built-in action buttons, so the delete prompts render
// their own Delete / Cancel buttons inside a toast that stays until answered.
export function confirmToast({ title, description, confirmLabel = "Delete", onConfirm }) {
  toast(
    ({ closeToast }) => (
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {description && <p className="mt-0.5 text-xs opacity-80">{description}</p>}
        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={closeToast}
            className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              closeToast();
              onConfirm();
            }}
            className="rounded-md bg-red-700 px-3 py-1 text-xs font-semibold text-white hover:bg-red-800"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    ),
    { autoClose: false, closeOnClick: false, draggable: false },
  );
}
