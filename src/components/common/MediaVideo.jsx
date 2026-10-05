import { getVideoEmbedUrl } from "@/utils/media";

// Plays a video link: embeds YouTube/Vimeo, otherwise uses a native <video> element.
export function MediaVideo({ url, className = "", autoPlay = false, muted = false }) {
  const embed = getVideoEmbedUrl(url);

  if (embed) {
    return (
      <iframe
        key={embed}
        src={autoPlay ? `${embed}?autoplay=1` : embed}
        title="Video"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        className={`aspect-video w-full bg-black ${className}`}
      />
    );
  }

  return (
    <video key={url} src={url} controls autoPlay={autoPlay} muted={muted} className={className} />
  );
}
