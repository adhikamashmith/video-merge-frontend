export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function filenameFromDisposition(disposition: string | null): string {
  const match = disposition?.match(/filename="?([^"]+)"?/i);
  return match?.[1] ?? "merged-output.mp4";
}
