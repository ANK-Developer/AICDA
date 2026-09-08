import { useEffect, useState } from "react";
import { getGalleryImages } from "@/lib/gallery-api";

// Every page mounts PageShell (and SiteHeader) independently, so without a
// shared cache each navigation would re-issue the same "give me all BANNER
// images" request. One in-flight/resolved promise, shared module-wide.
let cachedBannersPromise = null;

function fetchBannerMap() {
  if (!cachedBannersPromise) {
    cachedBannersPromise = getGalleryImages("BANNER", { limit: 100 })
      .then(({ gallery }) => {
        const map = {};
        for (const item of gallery) {
          if (item.title) map[item.title] = item.imageUrl || item.url;
        }
        return map;
      })
      .catch(() => ({}));
  }
  console.log("Banner Image:")
  return cachedBannersPromise;
}

// Call after an admin upload/replace/delete so the next page load reflects
// the change instead of serving the stale cached map.
export function invalidateBannerCache() {
  cachedBannersPromise = null;
}

export function useBanner(key) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchBannerMap().then((map) => {
      if (mounted) setUrl(map[key] || null);
    });
    return () => {
      mounted = false;
    };
  }, [key]);

  return url;
}
