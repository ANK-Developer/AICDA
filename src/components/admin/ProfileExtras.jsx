import { useState } from "react";

import {
  CalendarDays,
  LoaderCircle,
  Pencil,
  Plus,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

import { inputClass } from "./directory-shared";

// Dates like birthdays and special dates are stored as UTC midnight, so format
// them in UTC to keep the day from shifting for viewers in other time zones.
export function formatCalendarDate(value) {
  if (!value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Status pill for the top-right of an information card: green thumbs-up when
// active, red thumbs-down when inactive.
export function ProfileStatusThumb({ active }) {
  const Icon = active ? ThumbsUp : ThumbsDown;
  const label = active ? "Active" : "Inactive";

  return (
    <span
      title={label}
      aria-label={label}
      className={`inline-flex shrink-0 items-center gap-2 rounded-full py-1 pl-1 pr-3 text-xs font-bold shadow-sm ring-1 ${
        active
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
          : "bg-red-50 text-red-700 ring-red-200"
      }`}
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full ${
          active ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
        }`}
      >
        <Icon className="h-3.5 w-3.5 fill-current" />
      </span>
      {label}
    </span>
  );
}

function SpecialDateModal({ entry, onClose, onSave }) {
  const isEdit = Boolean(entry);
  const [date, setDate] = useState(entry?.date ? String(entry.date).slice(0, 10) : "");
  const [note, setNote] = useState(entry?.note || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!date) {
      setError("Please choose a date.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave({ date, note: note.trim() });
      toast.success(isEdit ? "Special date updated." : "Special date added.");
      onClose();
    } catch (requestError) {
      setError(requestError?.message || "Could not save special date.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-[2px] sm:p-5">
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-special-date-title"
        className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50">
              <Sparkles className="h-5 w-5 text-amber-600" />
            </div>

            <div>
              <h3 id="add-special-date-title" className="text-base font-bold text-slate-800">
                {isEdit ? "Edit Special Date" : "Add Special Date"}
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                Anniversary, milestone or any occasion.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 px-4 py-4 sm:px-5">
          <label className="block">
            <span className="mb-1 block text-[13px] font-semibold text-slate-700">
              Date <span className="text-red-600">*</span>
            </span>

            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={inputClass}
              autoFocus
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[13px] font-semibold text-slate-700">Occasion</span>

            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={191}
              placeholder="e.g. Anniversary"
              className={inputClass}
            />
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700"
            >
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-10 rounded-lg border border-slate-200 bg-white px-5 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-[13px] font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Date"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Special dates inside the member / partner create & edit forms. Works on the
// form's own list ([{ id?, date, note }]); the whole list is saved with the form.
export function SpecialDatesField({ value, onChange }) {
  const list = Array.isArray(value) ? value : [];

  const updateRow = (index, patch) =>
    onChange(list.map((entry, position) => (position === index ? { ...entry, ...patch } : entry)));

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[13px] font-semibold text-slate-700">Special Dates</span>

        <button
          type="button"
          onClick={() => onChange([...list, { date: "", note: "" }])}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-red-600 px-3 text-[12px] font-semibold text-white transition-colors hover:bg-red-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Special Date
        </button>
      </div>

      {list.length === 0 ? (
        <p className="text-[12px] text-slate-400">No special dates (anniversary, milestone...).</p>
      ) : (
        <div className="space-y-2">
          {list.map((entry, index) => (
            <div
              key={entry.id || index}
              className="flex flex-col gap-2 sm:flex-row sm:items-center"
            >
              <input
                type="date"
                value={entry.date ? String(entry.date).slice(0, 10) : ""}
                onChange={(event) => updateRow(index, { date: event.target.value })}
                className={`sm:w-44 ${inputClass}`}
              />

              <input
                value={entry.note || ""}
                onChange={(event) => updateRow(index, { note: event.target.value })}
                maxLength={191}
                placeholder="Occasion e.g. Anniversary"
                className={inputClass}
              />

              <button
                type="button"
                onClick={() => onChange(list.filter((_, position) => position !== index))}
                aria-label="Remove special date"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Lists a profile's special dates (any number of them) with Add / Edit / Delete.
// onAdd({ date, note }), onEdit(dateId, { date, note }) and onDelete(dateId)
// return promises and are expected to refresh `specialDates` in the parent.
export function SpecialDatesSection({ specialDates, onAdd, onEdit, onDelete }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const list = Array.isArray(specialDates) ? specialDates : [];

  const handleDelete = async (entry) => {
    if (!window.confirm(`Delete ${entry.note || "this special date"}?`)) return;

    setDeletingId(entry.id);

    try {
      await onDelete(entry.id);
      toast.success("Special date deleted.");
    } catch (requestError) {
      toast.error(requestError?.message || "Could not delete special date.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Sparkles className="h-4 w-4" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800">Special Dates</h3>
            <p className="mt-0.5 text-[12px] text-slate-400">Anniversaries and other occasions</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-red-600 px-3 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Date
        </button>
      </div>

      {list.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50/50 px-4 py-6 text-center text-[13px] text-slate-400">
          No special dates added yet.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {list.map((entry) => (
            <li key={entry.id} className="flex items-center gap-3 py-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <CalendarDays className="h-4 w-4" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-slate-700">
                  {formatCalendarDate(entry.date) || "—"}
                </p>

                <p className="truncate text-xs text-slate-400">{entry.note || "No occasion"}</p>
              </div>

              <button
                type="button"
                onClick={() => setEditing(entry)}
                aria-label="Edit special date"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <Pencil className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => handleDelete(entry)}
                disabled={deletingId === entry.id}
                aria-label="Delete special date"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                {deletingId === entry.id ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {adding && <SpecialDateModal onClose={() => setAdding(false)} onSave={onAdd} />}

      {editing && (
        <SpecialDateModal
          entry={editing}
          onClose={() => setEditing(null)}
          onSave={(values) => onEdit(editing.id, values)}
        />
      )}
    </div>
  );
}
