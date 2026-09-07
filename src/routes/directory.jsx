import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { Prose } from "@/components/site/ContentBlocks";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getGalleryImages } from "@/lib/gallery-api";
import { getMediaUrl } from "@/lib/config";

export const Route = createFileRoute("/directory")({
  head: () => ({
    meta: [
      { title: "Dealer Directory · AICDA" },
      {
        name: "description",
        content: "Verified new & used car dealers across India — searchable by state and city.",
      },
      {
        property: "og:title",
        content: "Dealer Directory · AICDA",
      },
      {
        property: "og:description",
        content: "Verified new & used car dealers across India — searchable by state and city.",
      },
    ],
  }),
  component: Page,
});

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
  const [openIndex, setOpenIndex] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchGallery() {
      try {
        const response = await getGalleryImages("DIRECTORY");
        setImages(response.gallery || []);
      } catch (error) {
        console.error("Failed to load directory images:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchGallery();
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
      title="Dealer Directory"
      subtitle="Verified new & used car dealers across India — searchable by state and city."
      bannerKey="directory"
    >
      <Prose>
        <h2
          className="text-3xl font-black text-foreground mb-6"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Search the Directory
        </h2>
      </Prose>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {!loading && (
          <p className="text-sm font-semibold text-primary">
            Total Dealers Found : <span className="text-foreground">{filteredImages.length}</span>
          </p>
        )}
        <label className="relative sm:w-72 sm:ml-auto">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search dealers"
            className="h-10 w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm"
          />
        </label>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-xl border border-border bg-card">
              <Skeleton className="h-72 w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="text-center py-10 text-lg text-gray-500">No Directory Images Found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {pageImages.map((image, localIndex) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setOpenIndex((currentPage - 1) * PAGE_SIZE + localIndex)}
              className="overflow-hidden rounded-xl border border-border shadow-[var(--shadow-card)] bg-card text-left cursor-pointer"
            >
              <img src={imageUrl(image)} alt={image.title} className="w-full h-72 object-cover" />

              <div className="p-4">
                <h3 className="font-semibold text-lg">{image.title}</h3>

                {image.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{image.description}</p>
                )}
              </div>
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
          <DialogTitle className="sr-only">{current?.title ?? "Directory Image"}</DialogTitle>

          {current && (
            <div className="relative">
              <img
                src={imageUrl(current)}
                alt={current.title}
                className="max-h-[80vh] w-full object-cover sm:object-contain bg-black"
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
