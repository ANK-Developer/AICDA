import { useGetGalleryImagesQuery } from "./galleryApi";

const EMPTY = [];

// Gallery images for one category, with a stable empty array while loading/failed.
export function useGalleryImages(category, options) {
  const { data, isLoading, error } = useGetGalleryImagesQuery({ category, ...options });
  return { images: data?.gallery ?? EMPTY, isLoading, error };
}
