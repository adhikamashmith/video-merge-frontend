const primaryExtensions = new Set(["jpg", "jpeg", "png", "webp", "mp4", "mov", "mkv", "webm"]);
const audioSourceExtensions = new Set(["mp3", "wav", "aac", "m4a", "ogg", "mp4", "mov", "mkv", "webm"]);

export function validateSelection(file: File, slot: "media1" | "media2"): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const allowed = slot === "media1" ? primaryExtensions : audioSourceExtensions;

  if (!allowed.has(extension)) {
    return slot === "media1"
      ? "Primary media must be an image or video."
      : "Audio source must be audio or video.";
  }

  return null;
}

export function acceptFor(slot: "media1" | "media2"): string {
  return slot === "media1"
    ? ".jpg,.jpeg,.png,.webp,.mp4,.mov,.mkv,.webm,image/*,video/*"
    : ".mp3,.wav,.aac,.m4a,.ogg,.mp4,.mov,.mkv,.webm,audio/*,video/*";
}
