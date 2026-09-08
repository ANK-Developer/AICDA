import { useEffect, useMemo, useRef, useState } from "react";

import {
  Cake,
  CalendarDays,
  Image as ImageIcon,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { toast } from "sonner";

import {
  createImportantDate,
  deleteImportantDate,
  getImportantDates,
  getUpcomingBirthdays,
  updateImportantDate,
} from "@/lib/important-date-api";

import { fieldClass, FieldRow, textareaClass } from "./directory-shared";

import { DirectoryTableSkeleton } from "./DirectoryManagement";

const emptyForm = {
  title: "",
  date: "",
  description: "",
  image: null,
};

function ImportantDateForm({ importantDate, onCancel, onSaved }) {
  const isEdit = Boolean(importantDate);

  const [form, setForm] = useState(
    importantDate
      ? {
          title: importantDate.title || "",
          date: importantDate.date ? importantDate.date.slice(0, 10) : "",
          description: importantDate.description || "",
          image: null,
        }
      : emptyForm,
  );

  const [existingImageUrl, setExistingImageUrl] = useState(importantDate?.imageUrl || null);

  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!form.image) {
      setImagePreview(null);
      return;
    }

    const url = URL.createObjectURL(form.image);

    setImagePreview(url);

    return () => URL.revokeObjectURL(url);
  }, [form.image]);

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
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Title is required.");
      setFieldErrors({
        title: "Title is required.",
      });
      return;
    }

    if (!form.date) {
      setError("Date is required.");
      setFieldErrors({
        date: "Date is required.",
      });
      return;
    }

    setError("");
    setFieldErrors({});
    setSaving(true);

    try {
      const saved = isEdit
        ? await updateImportantDate(importantDate.id, form)
        : await createImportantDate(form);

      toast.success(isEdit ? "Important date updated." : "Important date added.");

      onSaved(saved);
    } catch (requestError) {
      const message = requestError?.message || "Could not save important date.";

      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
        <FieldRow label="Title" required error={fieldErrors.title}>
          <input
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Enter important date title"
            className={fieldClass(fieldErrors.title)}
          />
        </FieldRow>

        <FieldRow label="Date" required error={fieldErrors.date}>
          <input
            type="date"
            value={form.date}
            onChange={(e) => updateField("date", e.target.value)}
            className={fieldClass(fieldErrors.date)}
          />
        </FieldRow>
      </div>

      <FieldRow label="Description">
        <textarea
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          rows={3}
          placeholder="Enter description..."
          className={textareaClass}
        />
      </FieldRow>

      <FieldRow label="Image (optional)">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Choose image"
            className="group relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-lg"
          >
            {imagePreview || existingImageUrl ? (
              <img
                src={imagePreview || existingImageUrl}
                alt="Preview"
                className="h-20 w-20 rounded-lg border border-slate-300 object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-300 transition-colors group-hover:border-red-400 group-hover:text-red-400">
                <ImageIcon className="h-7 w-7" />
              </div>
            )}
          </button>

          <div className="min-w-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => updateField("image", e.target.files?.[0] || null)}
              className="block w-full text-[13px] text-slate-600 file:mr-3 file:rounded-lg file:border file:border-slate-300 file:bg-slate-50 file:px-3 file:py-1.5 file:text-[13px] file:font-semibold file:text-slate-700 hover:file:bg-slate-100"
            />

            {(imagePreview || existingImageUrl) && (
              <button
                type="button"
                onClick={() => {
                  updateField("image", null);
                  setExistingImageUrl(null);

                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                className="mt-1.5 text-xs font-semibold text-red-600 hover:text-red-700"
              >
                Remove image
              </button>
            )}
          </div>
        </div>
      </FieldRow>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700"
        >
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="h-10 rounded-lg bg-slate-100 px-5 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-[13px] font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}

          {saving ? "Saving..." : isEdit ? "Save Date" : "Add Date"}
        </button>
      </div>
    </form>
  );
}

function birthdayLabel(daysLeft) {
  if (daysLeft === 0) return "Today";
  if (daysLeft === 1) return "Tomorrow";

  return `In ${daysLeft} days`;
}

function birthdayToRow(member) {
  return {
    id: `birthday-${member.id}`,
    title: `${member.memberName}'s Birthday`,
    date: member.nextBirthday,
    isBirthday: true,
    photo: member.photo,
    daysLeft: member.daysLeft,
  };
}

export function ImportantDatesManagement() {
  const [dates, setDates] = useState([]);
  const [birthdays, setBirthdays] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingDate, setEditingDate] = useState(null);

  // Delete state
  const [deletingDate, setDeletingDate] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadDates = async () => {
    setLoading(true);
    setError("");

    try {
      const [datesResult, birthdaysResult] = await Promise.all([
        getImportantDates(),
        getUpcomingBirthdays().catch(() => []),
      ]);

      setDates(datesResult);
      setBirthdays(birthdaysResult);
    } catch (requestError) {
      setError(requestError?.message || "Could not load important dates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDates();
  }, []);

  const combined = useMemo(
    () =>
      [...dates, ...birthdays.map(birthdayToRow)].sort(
        (a, b) => new Date(a.date) - new Date(b.date),
      ),
    [dates, birthdays],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return combined;

    return combined.filter((entry) =>
      [entry.title, entry.description].filter(Boolean).join(" ").toLowerCase().includes(query),
    );
  }, [combined, search]);

  const closeForm = () => {
    setShowForm(false);
    setEditingDate(null);
  };

  const handleSaved = async () => {
    closeForm();
    await loadDates();
  };

  const editDate = (entry) => {
    setEditingDate(entry);
    setShowForm(true);
  };

  // Open delete confirmation
  const openDeleteModal = (entry) => {
    if (entry?.isBirthday) return;

    setDeletingDate(entry);
  };

  // Delete important date
  const confirmDelete = async () => {
    if (!deletingDate) return;

    setDeleting(true);

    try {
      await deleteImportantDate(deletingDate.id);

      toast.success("Important date deleted successfully.");

      setDeletingDate(null);

      await loadDates();
    } catch (requestError) {
      toast.error(requestError?.message || "Could not delete important date.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="space-y-3">
      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
                <CalendarDays className="h-5 w-5 text-red-700" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-red-700 sm:text-xl">Important Dates</h2>

                <p className="mt-0.5 text-[12px] leading-5 text-slate-500 sm:text-[13px]">
                  Anniversaries, meetings, and other dates the association wants to track.
                </p>
              </div>
            </div>
          </div>

          {!showForm && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-red-600 px-4 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-red-700 sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Add Date
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="mb-4 flex flex-col gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {editingDate ? "Edit Important Date" : "New Important Date"}
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                {editingDate
                  ? "Update the important date details."
                  : "Add a new date to the association calendar."}
              </p>
            </div>

            {editingDate && (
              <span className="w-fit rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                Editing
              </span>
            )}
          </div>

          <ImportantDateForm
            importantDate={editingDate}
            onCancel={closeForm}
            onSaved={handleSaved}
          />
        </div>
      )}

      {/* Table */}
      {!showForm && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Search */}
          <div className="border-b border-slate-200 p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">All Important Dates</h3>

                <p className="text-xs text-slate-500">
                  {filtered.length} {filtered.length === 1 ? "record" : "records"}
                </p>
              </div>

              <label className="relative block w-full sm:w-72">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search title or description..."
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white py-1 pl-9 pr-3 text-[13px] outline-none transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </label>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700"
              >
                {error}
              </p>
            )}
          </div>

          {loading ? (
            <div className="p-3">
              <DirectoryTableSkeleton columns={4} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="m-3 flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-5 text-center sm:m-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <CalendarDays className="h-6 w-6 text-slate-400" />
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-600">
                {search ? "No important dates match your search" : "No important dates yet"}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {search
                  ? "Try a different search term."
                  : "Add your first important date to get started."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop / Tablet Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[650px] text-left text-[13px]">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Sr. No.</th>

                      <th className="px-4 py-3">Title</th>

                      <th className="px-4 py-3">Date</th>

                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((entry, index) => (
                      <tr
                        key={entry.id}
                        className="border-t border-slate-200 transition-colors hover:bg-slate-50"
                      >
                        {/* Title */}
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex min-w-0 items-center gap-3">
                            {entry.photo || entry.imageUrl ? (
                              <img
                                src={entry.photo || entry.imageUrl}
                                alt={entry.title}
                                className={`h-9 w-9 shrink-0 object-cover ${
                                  entry.isBirthday ? "rounded-full" : "rounded-lg"
                                }`}
                              />
                            ) : entry.isBirthday ? (
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-50">
                                <Cake className="h-4 w-4 text-pink-600" />
                              </div>
                            ) : (
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                                <CalendarDays className="h-4 w-4 text-slate-400" />
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="truncate font-semibold text-slate-800">
                                {entry.title}
                              </div>

                              {entry.description && (
                                <div className="mt-0.5 max-w-[420px] truncate text-xs text-slate-400">
                                  {entry.description}
                                </div>
                              )}

                              {entry.isBirthday && (
                                <span className="mt-0.5 inline-block text-[11px] font-semibold text-pink-600">
                                  Birthday
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 text-slate-600">
                          <div className="font-medium">
                            {entry.date ? new Date(entry.date).toLocaleDateString() : "—"}
                          </div>

                          {entry.isBirthday && (
                            <span className="mt-0.5 inline-block text-xs font-semibold text-pink-600">
                              {birthdayLabel(entry.daysLeft)}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          {!entry.isBirthday && (
                            <div className="flex justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => editDate(entry)}
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => openDeleteModal(entry)}
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-red-700 px-3 text-xs font-semibold text-white transition-all hover:bg-red-800"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            </div>
                          )}

                          {entry.isBirthday && (
                            <div className="flex justify-end">
                              <span className="rounded-full bg-pink-50 px-2.5 py-1 text-[11px] font-semibold text-pink-600">
                                Member Birthday
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="space-y-2 p-3 md:hidden">
                {filtered.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-xl border border-slate-200 bg-white p-3 transition-colors hover:border-slate-300 hover:bg-slate-50/50"
                  >
                    <div className="flex items-start gap-3">
                      {/* Image */}
                      {entry.photo || entry.imageUrl ? (
                        <img
                          src={entry.photo || entry.imageUrl}
                          alt={entry.title}
                          className={`h-11 w-11 shrink-0 object-cover ${
                            entry.isBirthday ? "rounded-full" : "rounded-lg"
                          }`}
                        />
                      ) : entry.isBirthday ? (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-50">
                          <Cake className="h-5 w-5 text-pink-600" />
                        </div>
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          <CalendarDays className="h-5 w-5 text-slate-400" />
                        </div>
                      )}

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="min-w-0 break-words text-sm font-semibold text-slate-800">
                              {entry.title}
                            </h4>

                            {entry.isBirthday && (
                              <span className="shrink-0 rounded-full bg-pink-50 px-2 py-0.5 text-[10px] font-bold text-pink-600">
                                Birthday
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <CalendarDays className="h-3.5 w-3.5" />

                            {entry.date ? new Date(entry.date).toLocaleDateString() : "—"}

                            {entry.isBirthday && (
                              <span className="font-semibold text-pink-600">
                                • {birthdayLabel(entry.daysLeft)}
                              </span>
                            )}
                          </div>

                          {entry.description && (
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                              {entry.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mobile Actions */}
                    {!entry.isBirthday && (
                      <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                        <button
                          type="button"
                          onClick={() => editDate(entry)}
                          className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => openDeleteModal(entry)}
                          className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-700 text-xs font-semibold text-white transition-colors hover:bg-red-800"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-[2px] sm:p-5">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-important-date-title"
            className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                  <Trash2 className="h-5 w-5 text-red-700" />
                </div>

                <div>
                  <h3 id="delete-important-date-title" className="text-base font-bold text-red-700">
                    Delete Important Date
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-500">This action cannot be undone.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !deleting && setDeletingDate(null)}
                disabled={deleting}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-4 py-5 sm:px-5">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-800">
                  Are you sure you want to delete this important date?
                </p>

                <p className="mt-1 text-xs leading-5 text-red-700">
                  The selected date will be permanently removed from the important dates list.
                </p>
              </div>

              {/* Selected Date */}
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
                    <CalendarDays className="h-4 w-4 text-red-600" />
                  </div>

                  <div className="min-w-0">
                    <p className="break-words text-sm font-bold text-slate-800">
                      {deletingDate.title}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {deletingDate.date
                        ? new Date(deletingDate.date).toLocaleDateString()
                        : "No date"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
              <button
                type="button"
                onClick={() => setDeletingDate(null)}
                disabled={deleting}
                className="h-10 rounded-lg border border-slate-200 bg-white px-5 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-700 px-5 text-[13px] font-bold text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
