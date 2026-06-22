import { ChangeEvent, DragEvent, useId, useState } from "react";
import { FileAudio, FileImage, FileVideo, Upload, X } from "lucide-react";
import type { SelectedFile, Slot } from "../types";
import { acceptFor, maxFileSizeMb, validateSelection } from "../lib/validation";
import { formatBytes } from "../lib/format";

interface DropzoneProps {
  slot: Slot;
  label: string;
  value: SelectedFile[];
  multiple?: boolean;
  onChange: (files: File[] | null, error?: string) => void;
}

export function Dropzone({ slot, label, value, multiple = false, onChange }: DropzoneProps) {
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);

  const chooseFiles = (fileList: FileList | undefined | null) => {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;

    const selected = multiple ? files : files.slice(0, 1);
    const invalid = selected
      .map((file) => validateSelection(file, slot))
      .find((message): message is string => Boolean(message));

    if (invalid) {
      onChange(null, invalid);
      return;
    }

    const error = slot === "media1" && selected.length > 10 ? "Input 1 supports up to 10 files." : null;
    if (error) {
      onChange(null, error);
      return;
    }

    onChange(selected);
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    chooseFiles(event.dataTransfer.files);
  };

  const onInput = (event: ChangeEvent<HTMLInputElement>) => {
    chooseFiles(event.target.files);
    event.target.value = "";
  };

  return (
    <section className="rounded-lg border border-line bg-white shadow-soft">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          {slot === "media1" ? <FileVideo className="h-5 w-5 text-accent" /> : <FileAudio className="h-5 w-5 text-coral" />}
          <h2 className="truncate text-base font-semibold text-ink">{label}</h2>
        </div>
        {value.length > 0 ? (
          <button
            type="button"
            aria-label={`Remove ${label}`}
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-ink"
            onClick={() => onChange(null)}
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`block cursor-pointer p-4 transition ${
          isDragging ? "bg-teal-50" : "bg-white hover:bg-panel"
        }`}
      >
        <input id={inputId} className="sr-only" type="file" accept={acceptFor(slot)} multiple={multiple} onChange={onInput} />
        {value.length > 0 ? <PreviewList selected={value} /> : <EmptyState slot={slot} multiple={multiple} />}
      </label>
    </section>
  );
}

function EmptyState({ slot, multiple }: { slot: Slot; multiple: boolean }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-md border border-dashed border-slate-300 bg-panel px-4 text-center">
      <Upload className="h-8 w-8 text-slate-500" />
      <div>
        <p className="font-medium text-ink">Drop file or browse</p>
        {multiple ? <p className="mt-1 text-sm text-slate-600">Select multiple files to build the visual sequence</p> : null}
        <p className="mt-1 text-sm text-slate-600">
          {slot === "media1"
            ? "Image/video: jpg, png, webp, mp4, mov, mkv, webm"
            : "Audio/video: mp3, wav, aac, m4a, ogg, mp4, mov, mkv, webm"}
        </p>
        <p className="mt-1 text-sm text-slate-600">Max {maxFileSizeMb} MB</p>
      </div>
    </div>
  );
}

function PreviewList({ selected }: { selected: SelectedFile[] }) {
  return (
    <div className="grid gap-4">
      {selected.map((item, index) => (
        <Preview key={`${item.file.name}-${item.file.size}-${index}`} selected={item} index={index} />
      ))}
    </div>
  );
}

function Preview({ selected, index }: { selected: SelectedFile; index: number }) {
  const { file, previewUrl } = selected;
  const mime = file.type;
  const ext = file.name.split(".").pop()?.toLowerCase();
  const isImage = mime.startsWith("image/") || ["jpg", "jpeg", "png", "webp"].includes(ext ?? "");
  const isVideo = mime.startsWith("video/") || ["mp4", "mov", "mkv", "webm"].includes(ext ?? "");
  const isAudio = mime.startsWith("audio/") || ["mp3", "wav", "aac", "m4a", "ogg"].includes(ext ?? "");

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
      <div className="min-w-0">
        <p className="truncate font-semibold text-ink">{index + 1}. {file.name}</p>
        <p className="mt-1 text-sm text-slate-600">{formatBytes(file.size)}</p>
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-700">
          {isImage ? <FileImage className="h-4 w-4" /> : isVideo ? <FileVideo className="h-4 w-4" /> : <FileAudio className="h-4 w-4" />}
          <span>{isImage ? "Image" : isVideo ? "Video" : isAudio ? "Audio" : "Media"}</span>
        </div>
      </div>
      <div className="flex aspect-video items-center justify-center overflow-hidden rounded-md bg-slate-100">
        {isImage ? <img src={previewUrl} alt="" className="h-full w-full object-contain" /> : null}
        {isVideo ? <video src={previewUrl} controls className="h-full w-full object-contain" /> : null}
        {isAudio ? <audio src={previewUrl} controls className="w-full px-3" /> : null}
      </div>
    </div>
  );
}
