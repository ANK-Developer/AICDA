import { useEffect, useRef, useState } from "react";
import { ImageOff, LoaderCircle, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
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

const sectionLabel = (key) => BANNER_SECTIONS.find((s) => s.key === key)?.label || key;

function Modal({ title, description, onClose, children, maxWidth = "max-w-lg" }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={`flex max-h-[85vh] w-full ${maxWidth} animate-in flex-col rounded-xl bg-white shadow-2xl fade-in-0 zoom-in-95 duration-150`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <p className="text-lg font-bold text-slate-800">{title}</p>
            {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

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
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const loadBanners = async () => {
    setLoading(true);
    setError("");
    try {
      const { gallery } = await getGalleryImages("BANNER", { limit: 100 });
      setBanners(gallery);
    } catch (requestError) {
      setError(requestError.message || "Could not load banners.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const section = BANNER_SECTIONS.find((s) => s.key === modalSection);
  const existing = banners.find((banner) => banner.title === modalSection);

  const openModal = (key) => {
    setModalSection(key);
    setFile(null);
  };

  const closeModal = () => {
    setModalSection(null);
    setFile(null);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith("image/")) setFile(dropped);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file) return;
    setSaving(true);
    setError("");
    try {
      if (existing) {
        await updateGalleryImage(existing.id, { file });
      } else {
        await uploadGalleryImage(file, "BANNER", modalSection);
      }
      invalidateBannerCache();
      await loadBanners();
      toast.success(`${section.label} banner updated.`);
      closeModal();
    } catch (requestError) {
      const message = requestError.message || "Could not save banner.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!existing) return;
    setRemoving(true);
    try {
      await deleteGalleryImage(existing.id);
      invalidateBannerCache();
      await loadBanners();
      toast.success(`${section.label} banner reset to default.`);
      closeModal();
    } catch (requestError) {
      toast.error(requestError.message || "Could not remove banner.");
    } finally {
      setRemoving(false);
    }
  };

  const confirmDeleteBanner = async () => {
    if (!deletingBanner) return;
    setRemoving(true);
    try {
      await deleteGalleryImage(deletingBanner.id);
      invalidateBannerCache();
      await loadBanners();
      toast.success(`${sectionLabel(deletingBanner.title)} banner reset to default.`);
      setDeletingBanner(null);
    } catch (requestError) {
      toast.error(requestError.message || "Could not remove banner.");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <section className="max-w-5xl space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[3px] border border-slate-300 bg-white px-3 py-2">
        <h2 className="text-lg font-bold">Banner Master</h2>
        <button
          type="button"
          onClick={() => openModal(BANNER_SECTIONS[0].key)}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[3px] bg-blue-600 px-3 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Upload banner
        </button>
      </div>

      <div className="rounded-[3px] border border-slate-300 bg-white p-3">
        {error && !modalSection && (
          <p
            role="alert"
            className="mb-3 rounded-[3px] bg-red-50 px-3 py-2 text-[13px] text-red-700"
          >
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-slate-500">
            <LoaderCircle className="h-5 w-5 animate-spin" /> Loading banners…
          </div>
        ) : banners.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-400">
            <ImageOff className="h-8 w-8" />
            <p className="mt-2 text-sm">
              No banners uploaded yet — every section is using its default image
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2 md:hidden">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-2.5"
                >
                  <img
                    src={getMediaUrl(banner?.imageUrl)}
                    alt={sectionLabel(banner?.title)}
                    className="h-14 w-14 shrink-0 rounded-lg border border-slate-200 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-700">
                      {sectionLabel(banner.title)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {banner.createdAt ? new Date(banner.createdAt).toLocaleDateString() : "—"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5 text-sm font-semibold">
                    <button
                      onClick={() => openModal(banner.title)}
                      className="inline-flex items-center gap-1 text-slate-600 transition-colors hover:text-sky-700"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    {/* <button
                      onClick={() => setDeletingBanner(banner)}
                      className="inline-flex items-center gap-1 text-red-600 transition-colors hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button> */}
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto rounded-lg border border-slate-200 md:block">
              <table className="w-full min-w-150 text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Image</th>
                    <th className="px-3 py-2">Section</th>
                    <th className="px-3 py-2">Uploaded</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.map((banner, index) => (
                    <tr
                      key={banner.id}
                      className={`border-t border-slate-200 ${index % 2 === 0 ? "bg-rose-50/70" : "bg-white"}`}
                    >
                      <td className="px-3 py-2">
                        <img
                          src={getMediaUrl(banner.imageUrl)}
                          alt={sectionLabel(banner.title)}
                          className="h-14 w-14 rounded-lg border border-slate-200 object-cover"
                        />
                      </td>
                      <td className="px-3 py-2 font-medium text-slate-700">
                        {sectionLabel(banner.title)}
                      </td>
                      <td className="px-3 py-2 text-slate-500">
                        {banner.createdAt ? new Date(banner.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => openModal(banner.title)}
                            className="inline-flex items-center gap-1 font-semibold text-slate-600 transition-colors hover:text-sky-700"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          {/* <button
                            onClick={() => setDeletingBanner(banner)}
                            className="inline-flex items-center gap-1 font-semibold text-red-600 transition-colors hover:text-red-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {modalSection && (
        <Modal
          title="Banner Master"
          // description="Choose which page's hero banner (or the header's Become Member button) to change, then upload a new image. Sections without an uploaded banner keep using their default image."
          onClose={closeModal}
        >
          <div>
            <label
              htmlFor="banner-section"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Section
            </label>
            <select
              id="banner-section"
              value={modalSection}
              onChange={(e) => openModal(e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition-colors hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              {BANNER_SECTIONS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleUpload}>
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">
                {existing ? "Current banner" : "Banner image"}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`group relative flex h-44 w-full flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed text-slate-400 transition-colors ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-slate-300 hover:border-primary/50 hover:bg-slate-50"
                }`}
              >
                {preview || existing?.imageUrl ? (
                  <>
                    <img
                      src={preview || getMediaUrl(existing.imageUrl)}
                      alt={`${section.label} banner`}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-slate-900/0 text-sm font-semibold text-white opacity-0 transition-all group-hover:bg-slate-900/50 group-hover:opacity-100">
                      Click or drop to replace
                    </span>
                  </>
                ) : (
                  <>
                    <ImageOff className="h-8 w-8 transition-colors group-hover:text-primary" />
                    <p className="mt-2 text-sm">
                      <span className="font-semibold text-primary">Click to browse</span> or drag
                      and drop
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      No banner uploaded — using the default image
                    </p>
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                id="banner-image"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="sr-only"
              />
              {file && (
                <p className="mt-2 truncate text-xs text-slate-500">Selected: {file.name}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!file || saving}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
              >
                {saving ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {existing ? "Save new image" : "Upload banner"}
              </button>
              {existing && (
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={removing}
                  className="inline-flex h-11 items-center gap-2 rounded-lg border border-red-200 px-5 text-sm font-semibold text-red-600 transition-all hover:bg-red-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
                >
                  {removing ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Remove
                </button>
              )}
            </div>
          </form>
        </Modal>
      )}

      {deletingBanner && (
        <Modal
          title={`Reset the ${sectionLabel(deletingBanner.title)} banner?`}
          description="This removes the uploaded image and the section falls back to its default banner."
          onClose={() => setDeletingBanner(null)}
          maxWidth="max-w-sm"
        >
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setDeletingBanner(null)}
              className="h-9 rounded-lg bg-slate-100 px-4 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-200 active:scale-95"
            >
              Cancel
            </button>
            {/* <button
              onClick={confirmDeleteBanner}
              disabled={removing}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition-all hover:bg-red-700 active:scale-95 disabled:opacity-60 disabled:active:scale-100"
            >
              {removing && <LoaderCircle className="h-4 w-4 animate-spin" />}
              Delete
            </button> */}
          </div>
        </Modal>
      )}
    </section>
  );
}
