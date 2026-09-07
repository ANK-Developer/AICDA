import { useEffect, useState } from "react";

import { createFileRoute } from "@tanstack/react-router";

import { ChevronLeft, ChevronRight, Play } from "lucide-react";

import { GallerySkeleton } from "@/components/site/GallerySkeleton";
import { PageShell } from "@/components/site/PageShell";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getGalleryImages, isVideoUrl } from "@/lib/gallery-api";
import { getMediaUrl } from "@/lib/config";

export const Route = createFileRoute("/image")({
  head: () => ({
    meta: [
      { title: "Gallery · AICDA" },
      {
        name: "description",
        content:
          "A visual record of AICDA conventions, meetings and dealer felicitations — images and videos.",
      },
    ],
  }),
  component: Page,
});

const TYPE_FILTERS = [
  ["all", "All"],
  ["image", "Image"],
  ["video", "Video"],
];

const PAGE_SIZE = 12;

function imageUrl(image) {
  const filePath =
    image?.imageUrl ||
    image?.url ||
    image?.secure_url ||
    image?.image?.url ||
    image?.image?.secure_url ||
    "";

  return getMediaUrl(filePath);
}

function Page() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openIndex, setOpenIndex] = useState(null);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    async function fetchImages() {
      try {
        setLoading(true);
        setError("");

        const result = await getGalleryImages("IMAGE");

        const galleryImages = Array.isArray(result?.gallery) ? result.gallery : [];

        setImages(galleryImages.filter((img) => Boolean(imageUrl(img))));
      } catch (err) {
        console.error(err);
        setError(err?.message || "Unable to load images.");
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, []);

  useEffect(() => {
    setPage(1);
    setOpenIndex(null);
  }, [typeFilter]);

  const filteredImages = images.filter((image) => {
    if (typeFilter === "all") {
      return true;
    }

    const video = isVideoUrl(imageUrl(image));

    return typeFilter === "video" ? video : !video;
  });

  const current = openIndex !== null ? filteredImages[openIndex] : null;

  const totalPages = Math.max(1, Math.ceil(filteredImages.length / PAGE_SIZE));

  const currentPage = Math.min(page, totalPages);

  const pageImages = filteredImages.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <PageShell
      title="Gallery"
      subtitle="A visual record of AICDA conventions, meetings and dealer felicitations — images and videos."
      bannerKey="image"
    >
      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 items-center sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {TYPE_FILTERS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTypeFilter(value)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                typeFilter === value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {!loading && !error && (
          <p className="text-sm font-semibold text-primary">
            Total Found : <span className="text-foreground">{filteredImages.length}</span>
          </p>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <GallerySkeleton />
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>
      ) : filteredImages.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">No Results Found</div>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {pageImages.map((image, localIndex) => {
            const url = imageUrl(image);
            const video = isVideoUrl(url);

            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setOpenIndex((currentPage - 1) * PAGE_SIZE + localIndex)}
                className="group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]"
              >
                {/* Image / Video */}
                {video ? (
                  <video
                    src={url}
                    muted
                    preload="metadata"
                    className="aspect-[3/4] h-55 w-full bg-black object-contain object-top transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <img
                    src={url}
                    alt={image?.description || image?.title || "Gallery image"}
                    className="aspect-[3/4] h-55 w-full object-fill transition-transform duration-300 group-hover:scale-105"
                  />
                )}

                {/* Video Play Button */}
                {video && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50">
                      <Play className="h-6 w-6 fill-white text-white" />
                    </span>
                  </span>
                )}

                {/* ONLY DESCRIPTION ON IMAGE BOTTOM */}
                {image?.description && (
                  <span className="absolute inset-x-0 bottom-0 bg-black/70 px-3 py-2 text-center text-xs font-semibold text-white sm:text-sm">
                    {image.description}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="rounded-lg border border-border px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>

          <span className="rounded-lg border border-border px-4 py-2 text-muted-foreground">
            Page : {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="rounded-lg border border-border px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Image / Video Preview Dialog */}
      <Dialog
        open={openIndex !== null}
        onOpenChange={(open) => {
          if (!open) {
            setOpenIndex(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl overflow-hidden border-none bg-black p-0">
          <DialogTitle className="sr-only">
            {current?.description || current?.title || "Gallery Image"}
          </DialogTitle>

          {current && (
            <div className="relative">
              {/* Main Media */}
              {isVideoUrl(imageUrl(current)) ? (
                <video
                  key={imageUrl(current)}
                  src={imageUrl(current)}
                  controls
                  autoPlay
                  className="max-h-[80vh] w-full bg-black"
                />
              ) : (
                <img
                  src={imageUrl(current)}
                  alt={current?.description || current?.title || "Gallery Image"}
                  className="max-h-[80vh] w-full object-fill bg-black"
                />
              )}

              {/* Previous / Next */}
              {filteredImages.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous Image"
                    onClick={() =>
                      setOpenIndex((i) => (i - 1 + filteredImages.length) % filteredImages.length)
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>

                  <button
                    type="button"
                    aria-label="Next Image"
                    onClick={() => setOpenIndex((i) => (i + 1) % filteredImages.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* ONLY DESCRIPTION IN MODAL */}
              {current.description && (
                <div className="bg-black/80 px-4 py-3 text-center text-sm font-semibold text-white">
                  {current.description}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
