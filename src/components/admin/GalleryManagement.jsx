import { useCallback, useEffect, useState } from "react";

import {
  CalendarDays,
  Eye,
  ImageOff,
  LoaderCircle,
  Pencil,
  Play,
  Plus,
  Search,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";

import { toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";
import { getMediaUrl } from "@/lib/config";

import {
  getGalleryImages,
  isVideoFile,
  isVideoUrl,
  updateGalleryImage,
  uploadGalleryImage,
} from "@/lib/gallery-api";

import { inputClass } from "./directory-shared";

/* -------------------------------------------------------------------------- */
/* CONSTANTS                                                                  */
/* -------------------------------------------------------------------------- */

const CATEGORIES = [
  ["ASSOCIATION", "Association"],
  ["POLITICAL_ACHIEVEMENT", "Political Achievement"],
  ["IMAGE", "Image / Video"],
  ["DIRECTORY", "Directory"],
  ["LETTER", "Letter"],
];

const PAGE_SIZE = 12;

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

const imageUrl = (image) => {
  const filePath =
    image?.imageUrl ||
    image?.url ||
    image?.secure_url ||
    image?.image?.url ||
    image?.image?.secure_url ||
    "";

  return getMediaUrl(filePath);
};

const imageId = (image) => image?.id || image?._id;

const categoryLabel = (value) =>
  CATEGORIES.find(([key]) => key === value)?.[1] || value || "Unknown";

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* -------------------------------------------------------------------------- */
/* MODAL                                                                      */
/* -------------------------------------------------------------------------- */

function Modal({ title, description, onClose, children, maxWidth = "max-w-2xl" }) {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-slate-950/65
        p-3 sm:p-5
        backdrop-blur-[3px]
      "
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={`
          ${maxWidth}
          w-full
          max-h-[94vh]
          overflow-hidden
          rounded-xl
          border border-slate-200
          bg-white
          shadow-2xl
          animate-in
          fade-in-0
          zoom-in-95
          duration-150
        `}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="
            flex items-start justify-between
            gap-4
            border-b border-slate-200
            bg-slate-50
            px-4 py-4
            sm:px-6
          "
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div
                className="
                  flex h-9 w-9 shrink-0
                  items-center justify-center
                  rounded-lg
                  bg-blue-50
                  text-blue-700
                "
              >
                <ShieldCheck className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-slate-900 sm:text-base">{title}</h3>

                {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex h-8 w-8 shrink-0
              items-center justify-center
              rounded-lg
              text-slate-400
              transition-all
              hover:bg-red-50
              hover:text-red-700
              focus:outline-none
              focus:ring-2
              focus:ring-red-200
            "
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="max-h-[calc(94vh-80px)] overflow-y-auto p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MEDIA VIEW MODAL                                                           */
/* -------------------------------------------------------------------------- */

function MediaViewModal({ image, onClose }) {
  if (!image) return null;

  const url = imageUrl(image);
  const video = isVideoUrl(url);

  return (
    <Modal
      title={image.title || "Gallery Preview"}
      description={`${categoryLabel(image.category)} • ${formatDate(image.createdAt)}`}
      onClose={onClose}
      maxWidth="max-w-4xl"
    >
      {/* Media */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
        {video ? (
          <video
            src={url}
            controls
            autoPlay
            className="
              max-h-[68vh]
              w-full
              object-contain
              bg-black
            "
          />
        ) : (
          <img
            src={url}
            alt={image.title || "Gallery"}
            className="
              max-h-[68vh]
              w-full
              object-contain
              bg-slate-950
            "
          />
        )}
      </div>

      {/* Description */}
      {image.description && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Description
          </p>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {image.description}
          </p>
        </div>
      )}

      {/* Details */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Category</p>

          <p className="mt-1 text-sm font-semibold text-slate-800">
            {categoryLabel(image.category)}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Uploaded</p>

          <p className="mt-1 text-sm font-semibold text-slate-800">{formatDate(image.createdAt)}</p>
        </div>
      </div>

      {/* Close */}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="
            inline-flex h-10
            items-center justify-center
            rounded-lg
            border border-slate-200
            bg-white
            px-5
            text-sm font-semibold
            text-slate-600
            transition-all
            hover:bg-slate-100
          "
        >
          Close
        </button>
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/* GALLERY FORM                                                               */
/* -------------------------------------------------------------------------- */

function GalleryForm({ image, onClose, onSaved }) {
  const [category, setCategory] = useState(image?.category || "ASSOCIATION");

  const [description, setDescription] = useState(image?.description || "");

  const [file, setFile] = useState(null);

  const [preview, setPreview] = useState(imageUrl(image));

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  /* ---------------------------------------------------------------------- */
  /* FILE PREVIEW                                                            */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!file) {
      setPreview(imageUrl(image));
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);

    setPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file, image]);

  const previewIsVideo = file ? isVideoFile(file) : isVideoUrl(preview);

  /* ---------------------------------------------------------------------- */
  /* FILE CHANGE                                                             */
  /* ---------------------------------------------------------------------- */

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const isImage = selectedFile.type.startsWith("image/");
    const isVideo = selectedFile.type.startsWith("video/");

    if (!isImage && !isVideo) {
      setError("Please select a valid image or video file.");
      event.target.value = "";
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  /* ---------------------------------------------------------------------- */
  /* SUBMIT                                                                  */
  /* ---------------------------------------------------------------------- */

  const submit = async (event) => {
    event.preventDefault();

    if (!image && !file) {
      const message = "Please select an image or video.";

      setError(message);
      toast.error(message);

      return;
    }

    setSaving(true);
    setError("");

    try {
      if (image) {
        await updateGalleryImage(imageId(image), {
          file,
          category,
          description: description.trim(),
        });

        toast.success("Gallery media updated successfully.");
      } else {
        await uploadGalleryImage(file, category, "", description.trim());

        toast.success("Image uploaded successfully.");
      }

      await onSaved();
    } catch (requestError) {
      const message = requestError?.message || "Unable to save the gallery media.";

      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* ------------------------------------------------------------------ */}
      {/* CATEGORY                                                            */}
      {/* ------------------------------------------------------------------ */}

      <div>
        <label
          htmlFor="gallery-category"
          className="mb-1.5 block text-xs font-bold text-slate-700 sm:text-sm"
        >
          Category
          <span className="ml-1 text-red-600">*</span>
        </label>

        <select
          id="gallery-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className={`
            ${inputClass}
            mt-0
            h-11
            w-full
            rounded-lg
            border-slate-300
            bg-white
            px-3
            text-sm
            text-slate-700
            transition-all
            focus:border-blue-600
            focus:ring-2
            focus:ring-blue-100
          `}
        >
          {CATEGORIES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* DESCRIPTION                                                         */}
      {/* ------------------------------------------------------------------ */}

      <div>
        <label
          htmlFor="gallery-description"
          className="mb-1.5 block text-xs font-bold text-slate-700 sm:text-sm"
        >
          Description
          <span className="ml-1 text-red-600">*</span>
        </label>

        <textarea
          id="gallery-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Enter image or video description..."
          rows={4}
          required
          className="
            w-full
            resize-none
            rounded-lg
            border
            border-slate-300
            bg-white
            px-3
            py-2.5
            text-sm
            text-slate-700
            outline-none
            transition-all
            placeholder:text-slate-400
            hover:border-slate-400
            focus:border-blue-600
            focus:ring-2
            focus:ring-blue-100
          "
        />

        <p className="mt-1 text-[11px] text-slate-400">
          Add a short description for this gallery media.
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* FILE                                                                 */}
      {/* ------------------------------------------------------------------ */}

      <div>
        <label
          htmlFor="gallery-file"
          className="mb-1.5 block text-xs font-bold text-slate-700 sm:text-sm"
        >
          {image ? "Replace image or video" : "Image or video"}

          {!image && <span className="ml-1 text-red-600">*</span>}
        </label>

        <label
          htmlFor="gallery-file"
          className="
            flex min-h-12
            cursor-pointer
            items-center
            gap-3
            rounded-lg
            border border-dashed
            border-slate-300
            bg-slate-50
            px-3
            transition-all
            hover:border-blue-400
            hover:bg-blue-50/40
          "
        >
          <div
            className="
              flex h-8 w-8 shrink-0
              items-center justify-center
              rounded-lg
              bg-blue-100
              text-blue-700
            "
          >
            <Upload className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-700 sm:text-sm">
              {file ? file.name : "Choose image or video"}
            </p>

            <p className="text-[11px] text-slate-400">
              JPG, PNG, WEBP, MP4 and other supported formats
            </p>
          </div>

          <span
            className="
              hidden shrink-0
              rounded-md
              border border-slate-200
              bg-white
              px-3 py-1.5
              text-xs font-semibold
              text-slate-600
              sm:block
            "
          >
            Browse
          </span>

          <input
            id="gallery-file"
            type="file"
            accept="image/*,video/*"
            required={!image}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* PREVIEW                                                             */}
      {/* ------------------------------------------------------------------ */}

      {preview && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-700 sm:text-sm">Preview</p>

            {previewIsVideo && (
              <span
                className="
                  inline-flex items-center gap-1
                  rounded-full
                  bg-slate-100
                  px-2.5 py-1
                  text-[11px]
                  font-semibold
                  text-slate-600
                "
              >
                <Play className="h-3 w-3 fill-current" />
                Video
              </span>
            )}
          </div>

          <div
            className="
              overflow-hidden
              rounded-xl
              border border-slate-200
              bg-slate-950
              shadow-sm
            "
          >
            {previewIsVideo ? (
              <video
                src={preview}
                controls
                muted
                className="
                  h-56
                  w-full
                  object-contain
                  sm:h-72
                "
              />
            ) : (
              <img
                src={preview}
                alt="Gallery preview"
                className="
                  h-56
                  w-full
                  object-contain
                  sm:h-72
                "
              />
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* ERROR                                                               */}
      {/* ------------------------------------------------------------------ */}

      {error && (
        <div
          role="alert"
          className="
            rounded-lg
            border border-red-200
            bg-red-50
            px-3 py-2.5
            text-xs font-medium
            text-red-700
          "
        >
          {error}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* FOOTER                                                              */}
      {/* ------------------------------------------------------------------ */}

      <div
        className="
          flex flex-col-reverse
          gap-2
          border-t border-slate-200
          pt-4
          sm:flex-row
          sm:justify-end
        "
      >
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="
            h-10
            rounded-lg
            border border-slate-200
            bg-white
            px-5
            text-sm font-semibold
            text-slate-600
            transition-all
            hover:bg-slate-100
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving || (!image && !file) || !description.trim()}
          className="
            inline-flex
            h-10
            items-center
            justify-center
            gap-2
            rounded-lg
            bg-[#b00000]
            px-5
            text-sm font-semibold
            text-white
            shadow-sm
            transition-all
            hover:bg-[#8f0000]
            focus:outline-none
            focus:ring-2
            focus:ring-red-200
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {saving ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : image ? (
            <Pencil className="h-4 w-4" />
          ) : (
            <Upload className="h-4 w-4" />
          )}

          {saving
            ? image
              ? "Saving..."
              : "Uploading..."
            : image
              ? "Save changes"
              : "Upload image"}
        </button>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* SKELETONS                                                                  */
/* -------------------------------------------------------------------------- */

function GalleryCardSkeleton() {
  return (
    <div
      className="
        flex items-center gap-3
        rounded-xl
        border border-slate-200
        bg-white
        p-3
      "
    >
      <Skeleton className="h-16 w-16 shrink-0 rounded-lg" />

      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-28 rounded-full" />
        <Skeleton className="h-3 w-20" />
      </div>

      <Skeleton className="h-8 w-14 rounded-lg" />
    </div>
  );
}

function GalleryTableSkeleton({ rows = 6 }) {
  return (
    <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3">
              <Skeleton className="h-3 w-16" />
            </th>

            <th className="px-4 py-3">
              <Skeleton className="h-3 w-20" />
            </th>

            <th className="px-4 py-3">
              <Skeleton className="h-3 w-16" />
            </th>

            <th className="px-4 py-3">
              <Skeleton className="h-3 w-32" />
            </th>

            <th className="px-4 py-3 text-right">
              <Skeleton className="ml-auto h-3 w-20" />
            </th>
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: rows }).map((_, index) => (
            <tr key={index} className="border-t border-slate-100">
              <td className="px-4 py-3">
                <Skeleton className="h-14 w-14 rounded-lg" />
              </td>

              <td className="px-4 py-3">
                <Skeleton className="h-6 w-28 rounded-full" />
              </td>

              <td className="px-4 py-3">
                <Skeleton className="h-4 w-24" />
              </td>

              <td className="px-4 py-3">
                <Skeleton className="h-4 w-40" />
              </td>

              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Skeleton className="h-8 w-16 rounded-lg" />
                  <Skeleton className="h-8 w-16 rounded-lg" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MEDIA THUMBNAIL                                                            */
/* -------------------------------------------------------------------------- */

function MediaThumbnail({ image, size = "normal" }) {
  const url = imageUrl(image);
  const video = isVideoUrl(url);

  const sizeClass = size === "small" ? "h-14 w-14" : "h-16 w-16";

  return (
    <div
      className={`
        ${sizeClass}
        relative
        shrink-0
        overflow-hidden
        rounded-lg
        border border-slate-200
        bg-slate-100
      `}
    >
      {url ? (
        video ? (
          <video src={url} muted preload="metadata" className="h-full w-full object-cover" />
        ) : (
          <img src={url} alt={image?.title || "Gallery"} className="h-full w-full object-cover" />
        )
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <ImageOff className="h-5 w-5 text-slate-300" />
        </div>
      )}

      {video && (
        <span
          className="
            absolute inset-0
            flex items-center justify-center
            bg-black/25
          "
        >
          <span
            className="
              flex h-7 w-7
              items-center justify-center
              rounded-full
              bg-black/55
              text-white
            "
          >
            <Play className="h-3.5 w-3.5 fill-white" />
          </span>
        </span>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

export function GalleryManagement() {
  const [images, setImages] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [category, setCategory] = useState("");

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState(undefined);

  const [viewing, setViewing] = useState(null);

  /* ---------------------------------------------------------------------- */
  /* LOAD IMAGES                                                             */
  /* ---------------------------------------------------------------------- */

  const loadImages = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getGalleryImages(category);

      const gallery = Array.isArray(result?.gallery) ? result.gallery : [];

      // BANNER is handled separately in Banner Master.
      const filteredGallery = gallery.filter((image) => image?.category !== "BANNER");

      setImages(filteredGallery);
    } catch (requestError) {
      const message = requestError?.message || "Could not load gallery images.";

      setError(message);
      toast.error(message);
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  /* ---------------------------------------------------------------------- */
  /* SEARCH                                                                  */
  /* ---------------------------------------------------------------------- */

  const visibleImages = images.filter((image) =>
    [image?.title, image?.description, image?.category]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  /* ---------------------------------------------------------------------- */
  /* PAGINATION                                                              */
  /* ---------------------------------------------------------------------- */

  const totalPages = Math.max(1, Math.ceil(visibleImages.length / PAGE_SIZE));

  const currentPage = Math.min(page, totalPages);

  const pageImages = visibleImages.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [category, search]);

  /* ---------------------------------------------------------------------- */
  /* SAVED                                                                   */
  /* ---------------------------------------------------------------------- */

  const saved = async () => {
    setEditing(undefined);
    await loadImages();
  };

  /* ---------------------------------------------------------------------- */
  /* RENDER                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <section className="min-h-full space-y-4">
      {/* ------------------------------------------------------------------ */}
      {/* PAGE HEADER                                                         */}
      {/* ------------------------------------------------------------------ */}

      <div
        className="
          rounded-xl
          border border-slate-200
          bg-white
          p-4
          shadow-sm
          sm:p-5
        "
      >
        <div
          className="
            flex flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                flex h-11 w-11
                shrink-0
                items-center justify-center
                rounded-xl
                bg-blue-50
                text-blue-700
              "
            >
              <ImageOff className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Image Gallery</h2>

              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                Manage association, achievement, directory and letter media.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setEditing(null)}
            className="
              inline-flex
              h-10
              w-full
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-[#b00000]
              px-4
              text-sm
              font-bold
              text-white
              shadow-sm
              transition-all
              hover:bg-[#8f0000]
              hover:shadow-md
              focus:outline-none
              focus:ring-2
              focus:ring-red-200
              sm:w-auto
            "
          >
            <Plus className="h-4 w-4" />
            Add Image
          </button>
        </div>

        {/* Stats */}
        <div className="mt-4 flex flex-wrap gap-2">
          <div
            className="
              inline-flex items-center gap-2
              rounded-full
              bg-blue-50
              px-3 py-1.5
              text-xs
              font-semibold
              text-blue-700
            "
          >
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            {visibleImages.length} total media
          </div>

          {category && (
            <div
              className="
                inline-flex items-center
                rounded-full
                bg-slate-100
                px-3 py-1.5
                text-xs
                font-semibold
                text-slate-600
              "
            >
              {categoryLabel(category)}
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* FILTERS                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div
        className="
          rounded-xl
          border border-slate-200
          bg-white
          p-3
          shadow-sm
          sm:p-4
        "
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[auto_1fr]">
          {/* Category */}
          <div>
            <label
              htmlFor="gallery-filter"
              className="
                mb-1.5
                block
                text-xs
                font-bold
                text-slate-600
              "
            >
              Category
            </label>

            <select
              id="gallery-filter"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="
                h-10
                w-full
                min-w-[190px]
                rounded-lg
                border
                border-slate-300
                bg-white
                px-3
                text-sm
                text-slate-700
                outline-none
                transition-all
                hover:border-slate-400
                focus:border-blue-600
                focus:ring-2
                focus:ring-blue-100
              "
            >
              <option value="">All categories</option>

              {CATEGORIES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label
              htmlFor="gallery-search"
              className="
                mb-1.5
                block
                text-xs
                font-bold
                text-slate-600
              "
            >
              Search
            </label>

            <div className="relative">
              <Search
                className="
                  pointer-events-none
                  absolute
                  left-3
                  top-1/2
                  h-4
                  w-4
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <input
                id="gallery-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search gallery..."
                className="
                  h-10
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  bg-white
                  py-2
                  pl-9
                  pr-3
                  text-sm
                  text-slate-700
                  outline-none
                  transition-all
                  placeholder:text-slate-400
                  hover:border-slate-400
                  focus:border-blue-600
                  focus:ring-2
                  focus:ring-blue-100
                "
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="
              mt-3
              rounded-lg
              border border-red-200
              bg-red-50
              px-3 py-2.5
              text-xs
              font-medium
              text-red-700
            "
          >
            {error}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* CONTENT                                                           */}
        {/* ---------------------------------------------------------------- */}

        {loading ? (
          <>
            {/* Mobile Skeleton */}
            <div className="mt-4 space-y-2 md:hidden">
              {Array.from({ length: 5 }).map((_, index) => (
                <GalleryCardSkeleton key={index} />
              ))}
            </div>

            {/* Desktop Skeleton */}
            <div className="mt-4">
              <GalleryTableSkeleton />
            </div>
          </>
        ) : visibleImages.length === 0 ? (
          <div
            className="
              mt-4
              flex
              min-h-[260px]
              flex-col
              items-center
              justify-center
              rounded-xl
              border
              border-dashed
              border-slate-300
              bg-slate-50/60
              px-4
              text-center
            "
          >
            <div
              className="
                flex h-14 w-14
                items-center justify-center
                rounded-full
                bg-white
                shadow-sm
              "
            >
              <ImageOff className="h-6 w-6 text-slate-300" />
            </div>

            <p className="mt-4 text-sm font-bold text-slate-600">No images found</p>

            <p className="mt-1 max-w-sm text-xs text-slate-400">
              Try changing the category or search keyword.
            </p>
          </div>
        ) : (
          <>
            {/* ============================================================ */}
            {/* MOBILE CARDS                                                  */}
            {/* ============================================================ */}

            <div className="mt-4 space-y-2 md:hidden">
              {pageImages.map((image) => {
                const id = imageId(image);

                return (
                  <div
                    key={id}
                    className="
                      group
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      p-3
                      shadow-sm
                      transition-all
                      hover:border-blue-200
                      hover:shadow-md
                    "
                  >
                    <div className="flex items-center gap-3">
                      <MediaThumbnail image={image} size="small" />

                      <div className="min-w-0 flex-1">
                        <span
                          className="
                            inline-flex
                            max-w-full
                            rounded-full
                            bg-blue-50
                            px-2.5 py-1
                            text-[10px]
                            font-bold
                            text-blue-700
                          "
                        >
                          <span className="truncate">{categoryLabel(image.category)}</span>
                        </span>

                        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                          <CalendarDays className="h-3 w-3" />

                          {formatDate(image.createdAt)}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setViewing(image)}
                          className="
                            flex h-8 w-8
                            items-center justify-center
                            rounded-lg
                            bg-blue-50
                            text-blue-700
                            transition-all
                            hover:bg-blue-100
                          "
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditing(image)}
                          className="
                            flex h-8 w-8
                            items-center justify-center
                            rounded-lg
                            bg-slate-100
                            text-slate-600
                            transition-all
                            hover:bg-slate-200
                            hover:text-slate-900
                          "
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Mobile Description */}
                    {image.description && (
                      <p
                        className="
                          mt-3
                          border-t
                          border-slate-100
                          pt-3
                          text-xs
                          leading-5
                          text-slate-500
                          line-clamp-2
                        "
                      >
                        {image.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ============================================================ */}
            {/* DESKTOP TABLE                                                 */}
            {/* ============================================================ */}

            <div
              className="
                mt-4
                hidden
                overflow-hidden
                rounded-xl
                border
                border-slate-200
                bg-white
                md:block
              "
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead>
                    <tr
                      className="
                        border-b
                        border-slate-200
                        bg-slate-50
                      "
                    >
                      <th
                        className="
                          px-4 py-3
                          text-[11px]
                          font-bold
                          uppercase
                          tracking-wider
                          text-slate-500
                        "
                      >
                        Media
                      </th>

                      <th
                        className="
                          px-4 py-3
                          text-[11px]
                          font-bold
                          uppercase
                          tracking-wider
                          text-slate-500
                        "
                      >
                        Category
                      </th>

                      <th
                        className="
                          px-4 py-3
                          text-[11px]
                          font-bold
                          uppercase
                          tracking-wider
                          text-slate-500
                        "
                      >
                        Description
                      </th>

                      <th
                        className="
                          px-4 py-3
                          text-[11px]
                          font-bold
                          uppercase
                          tracking-wider
                          text-slate-500
                        "
                      >
                        Uploaded
                      </th>

                      <th
                        className="
                          px-4 py-3
                          text-right
                          text-[11px]
                          font-bold
                          uppercase
                          tracking-wider
                          text-slate-500
                        "
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {pageImages.map((image) => {
                      const id = imageId(image);

                      return (
                        <tr
                          key={id}
                          className="
                            border-b
                            border-slate-100
                            transition-colors
                            last:border-b-0
                            hover:bg-blue-50/40
                          "
                        >
                          {/* Media */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <MediaThumbnail image={image} />

                              <div className="hidden lg:block">
                                <p className="max-w-[200px] truncate text-sm font-semibold text-slate-800">
                                  {image.title || "Gallery media"}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-400">
                                  {isVideoUrl(imageUrl(image)) ? "Video" : "Image"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-4 py-3">
                            <span
                              className="
                                inline-flex
                                items-center
                                rounded-full
                                bg-blue-50
                                px-2.5 py-1
                                text-[11px]
                                font-bold
                                text-blue-700
                              "
                            >
                              {categoryLabel(image.category)}
                            </span>
                          </td>

                          {/* Description */}
                          <td className="px-4 py-3">
                            <p
                              className="
                                max-w-[300px]
                                truncate
                                text-xs
                                leading-5
                                text-slate-500
                              "
                              title={image.description || ""}
                            >
                              {image.description || "—"}
                            </p>
                          </td>

                          {/* Date */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <CalendarDays className="h-3.5 w-3.5 text-slate-400" />

                              {formatDate(image.createdAt)}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              {/* VIEW */}
                              <button
                                type="button"
                                onClick={() => setViewing(image)}
                                className="
                                  inline-flex
                                  h-8
                                  items-center
                                  gap-1.5
                                  rounded-lg
                                  border
                                  border-blue-200
                                  bg-blue-50
                                  px-3
                                  text-xs
                                  font-bold
                                  text-blue-700
                                  transition-all
                                  hover:border-blue-300
                                  hover:bg-blue-100
                                "
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View
                              </button>

                              {/* EDIT */}
                              <button
                                type="button"
                                onClick={() => setEditing(image)}
                                className="
                                  inline-flex
                                  h-8
                                  items-center
                                  gap-1.5
                                  rounded-lg
                                  border
                                  border-slate-200
                                  bg-white
                                  px-3
                                  text-xs
                                  font-bold
                                  text-slate-600
                                  transition-all
                                  hover:border-slate-300
                                  hover:bg-slate-100
                                  hover:text-slate-900
                                "
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* PAGINATION                                                        */}
        {/* ---------------------------------------------------------------- */}

        {!loading && visibleImages.length > 0 && (
          <div
            className="
              mt-4
              flex
              flex-col
              gap-3
              border-t
              border-slate-100
              pt-4
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-bold text-slate-700">{(currentPage - 1) * PAGE_SIZE + 1}</span>{" "}
              -{" "}
              <span className="font-bold text-slate-700">
                {Math.min(currentPage * PAGE_SIZE, visibleImages.length)}
              </span>{" "}
              of <span className="font-bold text-slate-700">{visibleImages.length}</span>
            </p>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={currentPage <= 1}
                  className="
                    h-9
                    rounded-lg
                    border
                    border-slate-200
                    bg-white
                    px-3
                    text-xs
                    font-bold
                    text-slate-600
                    transition-all
                    hover:border-blue-200
                    hover:bg-blue-50
                    hover:text-blue-700
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  Prev
                </button>

                <span
                  className="
                    inline-flex
                    h-9
                    items-center
                    rounded-lg
                    bg-slate-900
                    px-3
                    text-xs
                    font-bold
                    text-white
                  "
                >
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={currentPage >= totalPages}
                  className="
                    h-9
                    rounded-lg
                    border
                    border-slate-200
                    bg-white
                    px-3
                    text-xs
                    font-bold
                    text-slate-600
                    transition-all
                    hover:border-blue-200
                    hover:bg-blue-50
                    hover:text-blue-700
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* VIEW MODAL                                                         */}
      {/* ------------------------------------------------------------------ */}

      {viewing && <MediaViewModal image={viewing} onClose={() => setViewing(null)} />}

      {/* ------------------------------------------------------------------ */}
      {/* EDIT / UPLOAD MODAL                                                */}
      {/* ------------------------------------------------------------------ */}

      {editing !== undefined && (
        <Modal
          title={editing ? "Edit Gallery Media" : "Upload Gallery Media"}
          description={
            editing
              ? "Update the category, description or replace the current media."
              : "Choose a category, add a description and upload an image or video."
          }
          onClose={() => setEditing(undefined)}
          maxWidth="max-w-2xl"
        >
          <GalleryForm image={editing} onClose={() => setEditing(undefined)} onSaved={saved} />
        </Modal>
      )}
    </section>
  );
}
