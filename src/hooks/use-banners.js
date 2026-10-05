import { useMemo } from "react";
import { useGetGalleryImagesQuery } from "@/features/gallery/galleryApi";

export const BANNER_QUERY = { category: "BANNER", limit: 100 };

// Every page mounts PageShell (and SiteHeader) independently; RTK Query shares one
// cached "all BANNER images" request between them. Admin uploads/replacements/deletes
// invalidate the "Gallery" tag, so the map refreshes without a manual cache reset.
export function useBanner(key) {
  const { data } = useGetGalleryImagesQuery(BANNER_QUERY);

  return useMemo(() => {
    const item = data?.gallery?.find((entry) => entry.title === key);
    return item ? item.imageUrl || item.url || null : null;
  }, [data, key]);
}
