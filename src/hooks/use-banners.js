import { useMemo } from "react";
import { useGetGalleryImagesQuery } from "@/features/gallery/galleryApi";
import { getMediaUrl } from "@/lib/config";

export const BANNER_QUERY = { category: "BANNER", limit: 100 };

// Every page mounts PageShell (and SiteHeader) independently; RTK Query shares one
// cached "all BANNER images" request between them. Admin uploads/replacements/deletes
// invalidate the "Gallery" tag, so the map refreshes without a manual cache reset.
// The API already returns only visible banners, in the order the admin arranged.
export function useBannerImages(key) {
  const { data } = useGetGalleryImagesQuery(BANNER_QUERY);

  return useMemo(
    () =>
      (data?.gallery || [])
        .filter((entry) => entry.title === key)
        .map((entry) => entry.imageUrl || entry.url)
        .filter(Boolean)
        .map(getMediaUrl),
    [data, key],
  );
}

// First visible banner of a section — for places that show a single image.
export function useBanner(key) {
  const images = useBannerImages(key);
  return images[0] || null;
}
