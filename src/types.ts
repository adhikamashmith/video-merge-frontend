export type Slot = "media1" | "media2";
export type UploadStatus = "idle" | "uploading" | "done" | "error";

export interface SelectedFile {
  file: File;
  previewUrl: string;
}
