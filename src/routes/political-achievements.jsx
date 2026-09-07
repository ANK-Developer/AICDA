import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { GallerySkeleton } from "@/components/site/GallerySkeleton";
import { PageShell } from "@/components/site/PageShell";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getGalleryImages } from "@/lib/gallery-api";
import { getMediaUrl } from "@/lib/config";

export const Route = createFileRoute("/political-achievements")({
  head: () => ({
    meta: [
      { title: "Political Achievements · AICDA" },
      {
        name: "description",
        content:
          "Two and a half decades of policy advocacy that reshaped the Indian dealer landscape.",
      },
      {
        property: "og:title",
        content: "Political Achievements · AICDA",
      },
      {
        property: "og:description",
        content:
          "Two and a half decades of policy advocacy that reshaped the Indian dealer landscape.",
      },
    ],
  }),
  component: Page,
});

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

const PAGE_SIZE = 12;

function Page() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openIndex, setOpenIndex] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchImages() {
      try {
        const result = await getGalleryImages("POLITICAL_ACHIEVEMENT");

        setImages((result.gallery || []).filter((img) => imageUrl(img)));
      } catch (err) {
        console.error(err);
        setError(err.message || "Unable to load images.");
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filteredImages = images.filter((image) =>
    [image.title, image.description]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );
  const current = openIndex !== null ? filteredImages[openIndex] : null;
  const totalPages = Math.max(1, Math.ceil(filteredImages.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageImages = filteredImages.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <PageShell
      title="Political Achievements"
      subtitle="Two and a half decades of policy advocacy that reshaped the Indian dealer landscape."
      bannerKey="political-achievements"
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search"
            className="h-10 w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm"
          />
        </label>
        {!loading && !error && (
          <p className="text-sm font-semibold text-primary">
            Total Political Achievement Images Found :{" "}
            <span className="text-foreground">{filteredImages.length}</span>
          </p>
        )}
      </div>

      {loading ? (
        <GallerySkeleton />
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>
      ) : filteredImages.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          No Political Achievement Images Found
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
          {pageImages.map((item, localIndex) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setOpenIndex((currentPage - 1) * PAGE_SIZE + localIndex)}
              className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]"
            >
              <img
                src={imageUrl(item)}
                alt={item.title}
                className="aspect-[3/4] h-55 w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
              />

              <span className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-xs sm:text-sm font-semibold px-3 py-2 text-center">
                {item?.description}
              </span>
            </button>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3 text-sm font-semibold">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="rounded-lg border border-border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>
          <span className="rounded-lg border border-border px-4 py-2 text-muted-foreground">
            Page : {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="rounded-lg border border-border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <Dialog open={openIndex !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <DialogContent className="max-w-3xl border-none bg-black p-0 overflow-hidden">
          <DialogTitle className="sr-only">{current?.title ?? "Political Achievement"}</DialogTitle>

          {current && (
            <div className="relative">
              <img
                src={imageUrl(current)}
                alt={current.title}
                className="max-h-[80vh] w-full object-contain bg-black"
              />

              {filteredImages.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous"
                    onClick={() =>
                      setOpenIndex((i) => (i - 1 + filteredImages.length) % filteredImages.length)
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>

                  <button
                    type="button"
                    aria-label="Next"
                    onClick={() => setOpenIndex((i) => (i + 1) % filteredImages.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              <div className="bg-black/80 px-4 py-3 text-center text-sm font-semibold text-white">
                {current.title}
              </div>

              {current.description && (
                <div className="bg-black px-4 pb-4 text-center text-gray-300 text-sm">
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
