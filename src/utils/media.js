export function isVideoUrl(url = "") {
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);
}

export function isVideoFile(file) {
  return Boolean(file?.type?.startsWith("video/"));
}

// The stored resourceType is authoritative; the extension check covers older rows.
export function isVideoMedia(item, url = "") {
  return item?.resourceType === "VIDEO" || isVideoUrl(url);
}

// Video links: YouTube / Vimeo play in an iframe, anything else as a direct <video> source.
export function getVideoEmbedUrl(url = "") {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    let id = "";

    if (host === "youtu.be") {
      id = parsed.pathname.slice(1);
    } else if (host.endsWith("youtube.com")) {
      id =
        parsed.searchParams.get("v") ||
        parsed.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] ||
        "";
    }

    if (id) return `https://www.youtube.com/embed/${id}`;

    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const vimeoId = parsed.pathname.match(/(\d+)/)?.[1];

      if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}`;
    }
  } catch {
    // not an absolute URL
  }

  return "";
}

export function getVideoThumbnail(url = "") {
  const embed = getVideoEmbedUrl(url);
  const match = embed.match(/youtube\.com\/embed\/([^/?]+)/);

  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : "";
}
