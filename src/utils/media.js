export function isVideoUrl(url = "") {
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);
}

export function isVideoFile(file) {
  return Boolean(file?.type?.startsWith("video/"));
}
