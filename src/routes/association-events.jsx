import { useEffect, useState } from "react";

import { createFileRoute } from "@tanstack/react-router";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import { GallerySkeleton } from "@/components/site/GallerySkeleton";
import { PageShell } from "@/components/site/PageShell";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getGalleryImages } from "@/lib/gallery-api";
import { getMediaUrl } from "../lib/config";

export const Route = createFileRoute("/association-events")({
  head: () => ({
    meta: [
      { title: "Association Events · AICDA" },
      {
        name: "description",
        content: "National conventions, regional meets and skill workshops organised by AICDA.",
      },
      {
        property: "og:title",
        content: "Association Events · AICDA",
      },
      {
        property: "og:description",
        content: "National conventions, regional meets and skill workshops organised by AICDA.",
      },
    ],
  }),

  component: Page,
});

const PAGE_SIZE = 12;

function Page() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getGalleryImages("ASSOCIATION");
        setEvents(response.gallery || []);
      } catch (error) {
        console.error("Failed to fetch gallery:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filteredEvents = events.filter((event) =>
    [event.title, event.description]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  const current = openIndex !== null ? filteredEvents[openIndex] : null;

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));

  const currentPage = Math.min(page, totalPages);

  const pageEvents = filteredEvents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (loading) {
    return (
      <PageShell title="Association Events" subtitle="Loading..." bannerKey="association-events">
        <GallerySkeleton />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Association Events"
      subtitle="National conventions, regional meets and skill workshops organised by AICDA."
      bannerKey="association-events"
    >
      {/* Search + Total */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search events"
            className="h-10 w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <p className="text-sm font-semibold text-primary">
          Total Association Events Found :{" "}
          <span className="text-foreground">{filteredEvents.length}</span>
        </p>
      </div>

      {/* Events */}
      {filteredEvents.length === 0 ? (
        <div className="py-20 text-center text-lg text-muted-foreground">
          No Association Events Found
        </div>
      ) : (
        <div className="grid grid-cols-1   px-4 md:px-0 gap-6 sm:grid-cols-3 lg:grid-cols-3">
          {pageEvents.map((event, localIndex) => (
            <button
              key={event.id}
              type="button"
              onClick={() => setOpenIndex((currentPage - 1) * PAGE_SIZE + localIndex)}
              className="group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-card text-left shadow-[var(--shadow-card)]"
            >
              {/* Image */}
              <img
                src={getMediaUrl(event.imageUrl)}
                alt={event.title || "Association Event"}
                className="aspect-[3/4] h-55 w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
              />

              {/* Bottom Content */}
              <div className="absolute inset-x-0 bottom-0 bg-black/75 px-3 py-2 text-center">
                {/* Title */}
                {/* {event.title && (
                  <div className="text-xs font-semibold text-white sm:text-sm">{event.title}</div>
                )} */}

                {/* Description */}
                {event.description && (
                  <div className="mt-1 text-xs font-normal text-gray-300">{event.description}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3 text-sm font-semibold">
          <button
            type="button"
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
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="rounded-lg border border-border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Image Dialog */}
      <Dialog
        open={openIndex !== null}
        onOpenChange={(open) => {
          if (!open) {
            setOpenIndex(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl overflow-hidden border-none bg-black p-0">
          <DialogTitle className="sr-only">{current?.title ?? "Association Event"}</DialogTitle>

          {current && (
            <div className="relative">
              {/* Large Image */}
              <img
                src={getMediaUrl(current.imageUrl)}
                alt={current.title || "Association Event"}
                className="max-h-[80vh] w-full object-contain bg-black"
              />

              {/* Previous / Next */}
              {filteredEvents.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous"
                    onClick={() =>
                      setOpenIndex((index) =>
                        index === null
                          ? index
                          : (index - 1 + filteredEvents.length) % filteredEvents.length,
                      )
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>

                  <button
                    type="button"
                    aria-label="Next"
                    onClick={() =>
                      setOpenIndex((index) =>
                        index === null ? index : (index + 1) % filteredEvents.length,
                      )
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Title */}
              {current.title && (
                <div className="bg-black/80 px-4 py-3 text-center text-sm font-semibold text-white">
                  {current.title}
                </div>
              )}

              {/* Description */}
              {current.description && (
                <div className="bg-black px-4 pb-4 text-center text-sm text-gray-300">
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
