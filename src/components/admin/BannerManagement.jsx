import { useEffect, useRef, useState } from "react";

import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  ImageOff,
  LoaderCircle,
  Maximize2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  useDeleteGalleryImageMutation,
  useLazyGetGalleryImagesQuery,
  useReorderBannersMutation,
  useSetGalleryVisibilityMutation,
  useUpdateGalleryImageMutation,
  useUploadGalleryImageMutation,
} from "@/features/gallery/galleryApi";

import { getMediaUrl } from "@/lib/config";
import { BANNER_SECTIONS } from "@/lib/banner-sections";

// The admin list includes hidden banners; the public pages only get visible ones.
const ADMIN_BANNER_QUERY = { category: "BANNER", limit: 100, admin: true };

const MAX_FILE_SIZE_MB = 5;

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
        <p className="text-xs text-slate-500">
          Uploaded {banner.createdAt ? new Date(banner.createdAt).toLocaleDateString() : "—"}
        </p>

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
   SMALL ICON BUTTON
========================================================= */

function IconButton({ label, onClick, disabled, tone = "slate", children }) {
  const tones = {
    slate: "border-slate-200 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600",
    amber: "border-slate-200 text-slate-600 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600",
    red: "border-red-100 text-red-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700",
    green:
      "border-emerald-200 bg-emerald-50 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-100",
    muted: "border-slate-200 bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-white transition-all disabled:cursor-not-allowed disabled:opacity-40 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

/* =========================================================
   BANNER MANAGEMENT
========================================================= */

export function BannerManagement() {
  const [banners, setBanners] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // { section, banner } — banner is set when replacing an existing image.
  const [uploadTarget, setUploadTarget] = useState(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const [deletingBanner, setDeletingBanner] = useState(null);
  const [viewingBanner, setViewingBanner] = useState(null);

  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  const [fetchGallery] = useLazyGetGalleryImagesQuery();
  const [updateGalleryImage] = useUpdateGalleryImageMutation();
  const [uploadGalleryImage] = useUploadGalleryImageMutation();
  const [deleteGalleryImage] = useDeleteGalleryImageMutation();
  const [setVisibility] = useSetGalleryVisibilityMutation();
  const [reorderBanners] = useReorderBannersMutation();

  /* =========================================================
     LOAD BANNERS
  ========================================================= */

  const loadBanners = async () => {
    setError("");

    try {
      const { gallery } = await fetchGallery(ADMIN_BANNER_QUERY, false).unwrap();

      setBanners(gallery || []);
    } catch (requestError) {
      const message = requestError?.message || "Could not load banners.";

      setError(message);
      toast.error(message);
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
      return undefined;
    }

    const url = URL.createObjectURL(file);

    setPreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  /* =========================================================
     UPLOAD MODAL
  ========================================================= */

  const openUpload = (section, banner = null) => {
    setUploadTarget({ section, banner });
    setFile(null);
    setPreview(null);
    setError("");
    setDragActive(false);
  };

  const closeUpload = () => {
    setUploadTarget(null);
    setFile(null);
    setPreview(null);
    setError("");
    setDragActive(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const acceptFile = (selectedFile, verb) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      toast.error(`Please ${verb} a valid image file.`);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`Image is too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    setFile(selectedFile);
    setError("");
  };

  const handleFileChange = (event) => acceptFile(event.target.files?.[0], "select");

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    acceptFile(event.dataTransfer.files?.[0], "drop");
  };

  /* =========================================================
     UPLOAD / REPLACE
  ========================================================= */

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!file) {
      toast.error("Please select an image.");
      return;
    }

    const { section, banner } = uploadTarget;

    setSaving(true);
    setError("");

    try {
      if (banner) {
        await updateGalleryImage({ id: banner.id, file }).unwrap();
      } else {
        await uploadGalleryImage({ file, category: "BANNER", title: section }).unwrap();
      }

      await loadBanners();

      toast.success(
        banner
          ? `${sectionLabel(section)} banner replaced.`
          : `Banner added to ${sectionLabel(section)}.`,
      );

      closeUpload();
    } catch (requestError) {
      const message = requestError?.message || "Could not save banner.";

      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     SHOW / HIDE
  ========================================================= */

  const handleToggleVisibility = async (banner) => {
    setBusyId(banner.id);

    try {
      await setVisibility({ id: banner.id, isActive: !banner.isActive }).unwrap();

      await loadBanners();

      toast.success(
        banner.isActive
          ? "Banner hidden. It will not show on the website."
          : "Banner is visible on the website again.",
      );
    } catch (requestError) {
      toast.error(requestError?.message || "Could not update the banner.");
    } finally {
      setBusyId(null);
    }
  };

  /* =========================================================
     REORDER
  ========================================================= */

  const handleMove = async (section, items, index, direction) => {
    const target = index + direction;

    if (target < 0 || target >= items.length) return;

    const ids = items.map((item) => item.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];

    setBusyId(items[index].id);

    try {
      await reorderBanners({ section, ids }).unwrap();

      await loadBanners();

      toast.success("Banner order saved.");
    } catch (requestError) {
      toast.error(requestError?.message || "Could not save the banner order.");
    } finally {
      setBusyId(null);
    }
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const confirmDeleteBanner = async () => {
    if (!deletingBanner) return;

    setRemoving(true);

    try {
      await deleteGalleryImage(deletingBanner.id).unwrap();

      await loadBanners();

      toast.success(`Banner removed from ${sectionLabel(deletingBanner.title)}.`);

      setDeletingBanner(null);
    } catch (requestError) {
      toast.error(requestError?.message || "Could not delete banner.");
    } finally {
      setRemoving(false);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  const uploadSection = BANNER_SECTIONS.find((item) => item.key === uploadTarget?.section);

  return (
    <section className="w-full max-w-6xl space-y-4">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Banner Management</h2>

        <p className="mt-1 text-sm text-slate-500">
          Each section can have several banners. They play one by one in the order shown here. A
          section with a single banner shows it without sliding, and a section with none uses the
          default banners.
        </p>
      </div>

      {error && !uploadTarget && (
        <p
          role="alert"
          className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex min-h-56 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-500 shadow-sm">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Loading banners...
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {BANNER_SECTIONS.map((section) => {
            const items = banners.filter((banner) => banner.title === section.key);
            const visibleCount = items.filter((banner) => banner.isActive).length;
            const isFull = items.length >= section.max;

            return (
              <div
                key={section.key}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                {/* Section header */}
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-slate-800">{section.label}</h3>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {items.length} of {section.max} used
                      {items.length > 0 && ` · ${visibleCount} visible`}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => openUpload(section.key)}
                    disabled={isFull}
                    title={isFull ? "Maximum reached. Delete a banner to add another." : "Add banner"}
                    className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-red-600 px-3 text-xs font-semibold text-white shadow-sm transition-all hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>

                {/* Banner list */}
                {items.length === 0 ? (
                  <div className="flex items-center gap-3 px-4 py-5 text-sm text-slate-500">
                    <ImageOff className="h-5 w-5 shrink-0 text-slate-400" />
                    Using the default banners.
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {items.map((banner, index) => {
                      const busy = busyId === banner.id;

                      return (
                        <li key={banner.id} className="flex items-center gap-3 px-4 py-3">
                          <span className="w-4 shrink-0 text-center text-xs font-bold text-slate-400">
                            {index + 1}
                          </span>

                          <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                            <img
                              src={getMediaUrl(banner.imageUrl)}
                              alt={`${section.label} banner ${index + 1}`}
                              className={`h-full w-full object-cover ${banner.isActive ? "" : "opacity-40"}`}
                            />

                            {!banner.isActive && (
                              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold uppercase tracking-wide text-slate-700">
                                Hidden
                              </span>
                            )}
                          </div>

                          <div className="ml-auto flex flex-wrap justify-end gap-1.5">
                            {busy ? (
                              <LoaderCircle className="h-5 w-5 animate-spin text-slate-400" />
                            ) : (
                              <>
                                {section.max > 1 && (
                                  <>
                                    <IconButton
                                      label="Move up"
                                      disabled={index === 0}
                                      onClick={() => handleMove(section.key, items, index, -1)}
                                    >
                                      <ArrowUp className="h-4 w-4" />
                                    </IconButton>

                                    <IconButton
                                      label="Move down"
                                      disabled={index === items.length - 1}
                                      onClick={() => handleMove(section.key, items, index, 1)}
                                    >
                                      <ArrowDown className="h-4 w-4" />
                                    </IconButton>
                                  </>
                                )}

                                <IconButton
                                  label="Preview full image"
                                  onClick={() => setViewingBanner(banner)}
                                >
                                  <Maximize2 className="h-4 w-4" />
                                </IconButton>

                                <IconButton
                                  label={
                                    banner.isActive
                                      ? "Visible on website — click to hide"
                                      : "Hidden from website — click to show"
                                  }
                                  tone={banner.isActive ? "green" : "muted"}
                                  onClick={() => handleToggleVisibility(banner)}
                                >
                                  {banner.isActive ? (
                                    <Eye className="h-4 w-4" />
                                  ) : (
                                    <EyeOff className="h-4 w-4" />
                                  )}
                                </IconButton>

                                <IconButton
                                  label="Replace image"
                                  tone="amber"
                                  onClick={() => openUpload(section.key, banner)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </IconButton>

                                <IconButton
                                  label="Delete"
                                  tone="red"
                                  onClick={() => setDeletingBanner(banner)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </IconButton>
                              </>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* =====================================================
          ADD / REPLACE MODAL
      ===================================================== */}

      {uploadTarget && (
        <Modal
          title={uploadTarget.banner ? "Replace Banner" : "Add Banner"}
          description={`${uploadSection?.label || ""} · recommended size 1920 × 600, up to ${MAX_FILE_SIZE_MB} MB.`}
          onClose={() => !saving && closeUpload()}
          maxWidth="max-w-2xl"
        >
          {error && (
            <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <form className="space-y-5" onSubmit={handleUpload}>
            <div>
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
                {preview || uploadTarget.banner?.imageUrl ? (
                  <>
                    <img
                      src={preview || getMediaUrl(uploadTarget.banner.imageUrl)}
                      alt={`${uploadSection?.label || ""} banner`}
                      className="absolute inset-0 h-full w-full object-cover"
                    />

                    <span className="absolute inset-0 flex items-center justify-center bg-slate-950/0 text-sm font-semibold text-white opacity-0 transition-all group-hover:bg-slate-950/50 group-hover:opacity-100">
                      Click or drop to choose another image
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

                    <p className="mt-1 text-xs text-slate-400">JPG, PNG or WebP</p>
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

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={closeUpload}
                disabled={saving}
                className="h-10 rounded-lg bg-slate-100 px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!file || saving}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}

                {uploadTarget.banner ? "Replace Banner" : "Add Banner"}
              </button>
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
          description={`Delete this ${sectionLabel(deletingBanner.title)} banner?`}
          onClose={() => !removing && setDeletingBanner(null)}
          maxWidth="max-w-md"
        >
          <div className="space-y-5">
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
                    The image is deleted. If it was the last banner of this section, the section
                    uses its default banners again. To remove it only temporarily, hide it
                    instead.
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
              <img
                src={getMediaUrl(deletingBanner.imageUrl)}
                alt={sectionLabel(deletingBanner.title)}
                className="h-36 w-full object-cover"
              />
            </div>

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
