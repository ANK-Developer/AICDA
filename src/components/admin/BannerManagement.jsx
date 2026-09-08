import { useEffect, useRef, useState } from "react";

import { Eye, ImageOff, LoaderCircle, Pencil, Plus, Trash2, Upload, X } from "lucide-react";

import { toast } from "sonner";

import {
  deleteGalleryImage,
  getGalleryImages,
  updateGalleryImage,
  uploadGalleryImage,
} from "@/lib/gallery-api";

import { getMediaUrl } from "@/lib/config";
import { BANNER_SECTIONS } from "@/lib/banner-sections";
import { invalidateBannerCache } from "@/hooks/use-banners";

/* =========================================================
   HELPERS
========================================================= */

const sectionLabel = (key) => BANNER_SECTIONS.find((section) => section.key === key)?.label || key;

/* =========================================================
   MODAL
========================================================= */

function Modal({ title, description, onClose, children, maxWidth = "max-w-lg" }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={`flex max-h-[90vh] w-full ${maxWidth} flex-col overflow-hidden rounded-2xl bg-white shadow-2xl`}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-slate-800">{title}</h3>

            {description && <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

/* =========================================================
   VIEW IMAGE MODAL
========================================================= */

function ViewBannerModal({ banner, onClose }) {
  if (!banner) return null;

  return (
    <Modal
      title={sectionLabel(banner.title)}
      description="Preview of the uploaded banner image."
      onClose={onClose}
      maxWidth="max-w-4xl"
    >
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
        <img
          src={getMediaUrl(banner.imageUrl)}
          alt={sectionLabel(banner.title)}
          className="max-h-[65vh] w-full object-contain"
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-700">{sectionLabel(banner.title)}</p>

          <p className="mt-1 text-xs text-slate-500">
            Uploaded {banner.createdAt ? new Date(banner.createdAt).toLocaleDateString() : "—"}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="h-10 rounded-lg bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}

/* =========================================================
   BANNER MANAGEMENT
========================================================= */

export function BannerManagement() {
  const [banners, setBanners] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalSection, setModalSection] = useState(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const [deletingBanner, setDeletingBanner] = useState(null);
  const [viewingBanner, setViewingBanner] = useState(null);

  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  /* =========================================================
     LOAD BANNERS
  ========================================================= */

  const loadBanners = async () => {
    setLoading(true);
    setError("");

    try {
      const { gallery } = await getGalleryImages("BANNER", {
        limit: 100,
      });

      setBanners(gallery || []);
    } catch (requestError) {
      const message = requestError?.message || "Could not load banners.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  /* =========================================================
     FILE PREVIEW
  ========================================================= */

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(file);

    setPreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  /* =========================================================
     CURRENT SECTION
  ========================================================= */

  const section = BANNER_SECTIONS.find((item) => item.key === modalSection);

  const existing = banners.find((banner) => banner.title === modalSection);

  /* =========================================================
     OPEN / CLOSE UPLOAD MODAL
  ========================================================= */

  const openModal = (key) => {
    setModalSection(key);
    setFile(null);
    setPreview(null);
    setError("");
    setDragActive(false);
  };

  const closeModal = () => {
    setModalSection(null);
    setFile(null);
    setPreview(null);
    setError("");
    setDragActive(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =========================================================
     IMPORTANT:
     CHANGE SECTION WITHOUT CLEARING SELECTED FILE
  ========================================================= */

  const handleSectionChange = (event) => {
    const newSection = event.target.value;

    /*
      Do NOT call openModal() here.

      openModal() clears the selected file.
      Therefore changing dropdown should only change
      modalSection.
    */

    setModalSection(newSection);

    /*
      Clear only the file input value if necessary.
      The selected file state itself is preserved.
    */
  };

  /* =========================================================
     FILE SELECT
  ========================================================= */

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    setFile(selectedFile);
    setError("");
  };

  /* =========================================================
     DRAG & DROP
  ========================================================= */

  const handleDrop = (event) => {
    event.preventDefault();

    setDragActive(false);

    const dropped = event.dataTransfer.files?.[0];

    if (!dropped) return;

    if (!dropped.type.startsWith("image/")) {
      toast.error("Please drop a valid image file.");
      return;
    }

    setFile(dropped);
    setError("");
  };

  /* =========================================================
     UPLOAD / UPDATE
  ========================================================= */

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!file) {
      toast.error("Please select an image.");
      return;
    }

    if (!modalSection) {
      toast.error("Please select a banner section.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const currentExisting = banners.find((banner) => banner.title === modalSection);

      if (currentExisting) {
        /*
          Existing banner:
          update the current image
        */
        await updateGalleryImage(currentExisting.id, {
          file,
        });
      } else {
        /*
          No banner:
          create new banner
        */
        await uploadGalleryImage(file, "BANNER", modalSection);
      }

      invalidateBannerCache();

      await loadBanners();

      toast.success(`${sectionLabel(modalSection)} banner updated successfully.`);

      closeModal();
    } catch (requestError) {
      const message = requestError?.message || "Could not save banner.";

      setError(message);

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     REMOVE / RESET BANNER FROM EDIT MODAL
  ========================================================= */

  const handleRemove = async () => {
    if (!existing) return;

    setRemoving(true);
    setError("");

    try {
      await deleteGalleryImage(existing.id);

      invalidateBannerCache();

      await loadBanners();

      toast.success(`${sectionLabel(existing.title)} banner reset to default.`);

      closeModal();
    } catch (requestError) {
      const message = requestError?.message || "Could not remove banner.";

      toast.error(message);
    } finally {
      setRemoving(false);
    }
  };

  /* =========================================================
     DELETE CONFIRMATION
  ========================================================= */

  const confirmDeleteBanner = async () => {
    if (!deletingBanner) return;

    setRemoving(true);

    try {
      /*
        Same existing delete API
      */
      await deleteGalleryImage(deletingBanner.id);

      invalidateBannerCache();

      await loadBanners();

      toast.success(
        `${sectionLabel(deletingBanner.title)} banner deleted. Default banner restored.`,
      );

      setDeletingBanner(null);
    } catch (requestError) {
      const message = requestError?.message || "Could not delete banner.";

      toast.error(message);
    } finally {
      setRemoving(false);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section className="w-full max-w-6xl space-y-4">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Banner Management</h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage homepage and page banners from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openModal(BANNER_SECTIONS[0]?.key)}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Upload Banner
        </button>
      </div>

      {/* =====================================================
          TABLE CONTAINER
      ===================================================== */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Error */}
        {error && !modalSection && (
          <div className="border-b border-red-100 bg-red-50 px-4 py-3">
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-56 items-center justify-center gap-2 text-sm text-slate-500">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Loading banners...
          </div>
        ) : banners.length === 0 ? (
          /* Empty State */
          <div className="flex min-h-56 flex-col items-center justify-center px-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <ImageOff className="h-7 w-7 text-slate-400" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-700">No uploaded banners</h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              All banner sections are currently using their default images.
            </p>

            <button
              type="button"
              onClick={() => openModal(BANNER_SECTIONS[0]?.key)}
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
            >
              <Plus className="h-4 w-4" />
              Upload first banner
            </button>
          </div>
        ) : (
          /* =================================================
             RESPONSIVE TABLE
          ================================================= */

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600">Banner</th>

                  <th className="px-4 py-3 font-semibold text-slate-600">Section</th>

                  <th className="px-4 py-3 font-semibold text-slate-600">Uploaded</th>

                  <th className="px-4 py-3 text-center font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>

              <tbody>
                {banners.map((banner, index) => (
                  <tr
                    key={banner.id}
                    className={`border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50 ${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                    }`}
                  >
                    {/* Image */}
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="h-16 w-28 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm">
                          <img
                            src={getMediaUrl(banner.imageUrl)}
                            alt={sectionLabel(banner.title)}
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                      </div>
                    </td>

                    {/* Section */}
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-slate-700">{sectionLabel(banner.title)}</p>

                        <p className="mt-0.5 text-xs text-slate-400">{banner.title}</p>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-slate-500">
                      {banner.createdAt ? new Date(banner.createdAt).toLocaleDateString() : "—"}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        {/* View */}
                        <button
                          type="button"
                          onClick={() => setViewingBanner(banner)}
                          title="View banner"
                          aria-label="View banner"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => openModal(banner.title)}
                          title="Edit banner"
                          aria-label="Edit banner"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => setDeletingBanner(banner)}
                          title="Delete banner"
                          aria-label="Delete banner"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-white text-red-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {modalSection && (
        <Modal
          title={existing ? "Edit Banner" : "Upload Banner"}
          description="Select a section and upload the banner image."
          onClose={closeModal}
          maxWidth="max-w-2xl"
        >
          {/* Section */}
          <div>
            <label
              htmlFor="banner-section"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Banner Section
            </label>

            <select
              id="banner-section"
              value={modalSection}
              onChange={handleSectionChange}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition-colors hover:border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
            >
              {BANNER_SECTIONS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Error */}
          {error && (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {/* Form */}
          <form className="mt-5 space-y-5" onSubmit={handleUpload}>
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-700">
                  {existing ? "Current Banner" : "Banner Image"}
                </p>

                {existing && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Uploaded
                  </span>
                )}
              </div>

              {/* Upload Area */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`group relative flex h-52 w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-all ${
                  dragActive
                    ? "border-red-500 bg-red-50"
                    : "border-slate-300 bg-slate-50 hover:border-red-400 hover:bg-red-50/40"
                }`}
              >
                {preview || existing?.imageUrl ? (
                  <>
                    <img
                      src={preview || getMediaUrl(existing.imageUrl)}
                      alt={`${sectionLabel(modalSection)} banner`}
                      className="absolute inset-0 h-full w-full object-cover"
                    />

                    <span className="absolute inset-0 flex items-center justify-center bg-slate-950/0 text-sm font-semibold text-white opacity-0 transition-all group-hover:bg-slate-950/50 group-hover:opacity-100">
                      Click or drop to replace
                    </span>
                  </>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                      <Upload className="h-5 w-5 text-red-600" />
                    </div>

                    <p className="mt-3 text-sm font-medium text-slate-600">
                      <span className="font-semibold text-red-600">Click to browse</span> or drag
                      and drop
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Select an image for this banner section
                    </p>
                  </>
                )}
              </button>

              <input
                ref={fileInputRef}
                id="banner-image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
              />

              {file && (
                <div className="mt-2 flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                  <p className="min-w-0 truncate text-xs text-slate-600">
                    Selected: <span className="font-semibold">{file.name}</span>
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);

                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-white hover:text-red-500"
                    title="Remove selected file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-between">
              <div>
                {existing && (
                  <button
                    type="button"
                    onClick={() => setDeletingBanner(existing)}
                    disabled={removing || saving}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-600 transition-all hover:bg-red-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving || removing}
                  className="h-10 rounded-lg bg-slate-100 px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!file || saving || removing}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}

                  {existing ? "Save Changes" : "Upload Banner"}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* =====================================================
          VIEW MODAL
      ===================================================== */}

      {viewingBanner && (
        <ViewBannerModal banner={viewingBanner} onClose={() => setViewingBanner(null)} />
      )}

      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ===================================================== */}

      {deletingBanner && (
        <Modal
          title="Delete Banner?"
          description={`Are you sure you want to delete the ${sectionLabel(
            deletingBanner.title,
          )} banner?`}
          onClose={() => !removing && setDeletingBanner(null)}
          maxWidth="max-w-md"
        >
          <div className="space-y-5">
            {/* Warning */}
            <div className="rounded-xl border border-red-100 bg-red-50 p-4">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-red-800">
                    This action cannot be undone.
                  </p>

                  <p className="mt-1 text-sm leading-5 text-red-700">
                    The uploaded banner will be deleted and the section will automatically use its
                    default banner again.
                  </p>
                </div>
              </div>
            </div>

            {/* Banner preview */}
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
              <img
                src={getMediaUrl(deletingBanner.imageUrl)}
                alt={sectionLabel(deletingBanner.title)}
                className="h-36 w-full object-cover"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingBanner(null)}
                disabled={removing}
                className="h-10 rounded-lg bg-slate-100 px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteBanner}
                disabled={removing}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white transition-all hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {removing ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}

                {removing ? "Deleting..." : "Delete Banner"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
