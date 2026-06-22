import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Download, Loader2, Merge, RotateCcw } from "lucide-react";
import { Dropzone } from "./components/Dropzone";
import type { SelectedFile, Slot, UploadStatus } from "./types";
import { filenameFromDisposition } from "./lib/format";
import { apiUrl } from "./lib/api";

export function App() {
  const [media1, setMedia1] = useState<SelectedFile[]>([]);
  const [media2, setMedia2] = useState<SelectedFile | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [download, setDownload] = useState<{ url: string; filename: string } | null>(null);

  useEffect(() => {
    return () => {
      media1.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [media1]);

  useEffect(() => {
    return () => {
      if (media2?.previewUrl) URL.revokeObjectURL(media2.previewUrl);
    };
  }, [media2?.previewUrl]);

  useEffect(() => {
    return () => {
      if (download?.url) URL.revokeObjectURL(download.url);
    };
  }, [download?.url]);

  const ready = useMemo(() => Boolean(media1.length > 0 && media2 && status !== "uploading"), [media1.length, media2, status]);

  const setFiles = (slot: Slot, files: File[] | null, validationError?: string) => {
    setError(validationError ?? null);
    setStatus("idle");
    setProgress(0);
    if (download) setDownload(null);

    if (slot === "media1") {
      setMedia1(files?.map(toSelectedFile) ?? []);
      return;
    }

    setMedia2(files?.[0] ? toSelectedFile(files[0]) : null);
  };

  const reset = () => {
    setFiles("media1", null);
    setFiles("media2", null);
    setError(null);
    setStatus("idle");
    setProgress(0);
  };

  const mergeMedia = async () => {
    if (media1.length === 0 || !media2) return;

    setStatus("uploading");
    setError(null);
    setProgress(5);

    const form = new FormData();
    media1.forEach((item) => form.append("media1", item.file));
    form.append("media2", media2.file);

    try {
      await assertBackendReachable();
      const response = await uploadWithProgress(apiUrl("/api/merge"), form, setProgress);

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message ?? "Merge failed.");
      }

      setProgress(100);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const filename = filenameFromDisposition(response.headers.get("content-disposition"));
      setDownload({ url, filename });
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Merge failed.");
    }
  };

  return (
    <main className="min-h-screen bg-panel">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-line pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">Media Merge</p>
            <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">Merge visuals with source audio</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2 font-medium text-ink hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <button
              type="button"
              onClick={mergeMedia}
              disabled={!ready}
              className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {status === "uploading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Merge className="h-4 w-4" />}
              Merge
            </button>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-2">
          <Dropzone
            slot="media1"
            label="Input 1: images or videos"
            value={media1}
            multiple
            onChange={(files, nextError) => setFiles("media1", files, nextError)}
          />
          <Dropzone
            slot="media2"
            label="Input 2: audio or video with audio"
            value={media2 ? [media2] : []}
            onChange={(files, nextError) => setFiles("media2", files, nextError)}
          />
        </div>

        <section className="rounded-lg border border-line bg-white p-4 shadow-soft">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <StatusLine status={status} error={error} />
            {download ? (
              <a
                href={download.url}
                download={download.filename}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 font-semibold text-white hover:bg-teal-700"
              >
                <Download className="h-4 w-4" />
                Download MP4
              </a>
            ) : null}
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
          </div>
        </section>
      </div>
    </main>
  );
}

function toSelectedFile(file: File): SelectedFile {
  return { file, previewUrl: URL.createObjectURL(file) };
}

function StatusLine({ status, error }: { status: UploadStatus; error: string | null }) {
  if (status === "uploading") {
    return (
      <div className="flex items-center gap-2 text-slate-700">
        <Loader2 className="h-5 w-5 animate-spin text-accent" />
        <span>Processing</span>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="flex items-center gap-2 text-slate-700">
        <CheckCircle2 className="h-5 w-5 text-accent" />
        <span>MP4 ready</span>
      </div>
    );
  }

  if (status === "error" || error) {
    return (
      <div className="flex items-center gap-2 text-coral">
        <AlertCircle className="h-5 w-5" />
        <span>{error ?? "Something went wrong."}</span>
      </div>
    );
  }

  return <span className="text-slate-600">Waiting for two files</span>;
}

function uploadWithProgress(
  url: string,
  body: FormData,
  onProgress: (progress: number) => void
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.responseType = "blob";

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.min(90, Math.round((event.loaded / event.total) * 90)));
      }
    };

    xhr.onload = () => {
      const headers = new Headers();
      const rawHeaders = xhr.getAllResponseHeaders().trim().split(/[\r\n]+/);
      rawHeaders.forEach((line) => {
        const index = line.indexOf(": ");
        if (index > 0) headers.append(line.slice(0, index), line.slice(index + 2));
      });

      resolve(
        new Response(xhr.response, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers
        })
      );
    };
    xhr.onerror = () =>
      reject(
        new Error(
          "Network error while uploading files. Check that the backend URL uses HTTPS and that backend CORS_ORIGIN exactly matches this frontend URL."
        )
      );
    xhr.send(body);
  });
}

async function assertBackendReachable(): Promise<void> {
  try {
    const response = await fetch(apiUrl("/api/health"));
    if (!response.ok) {
      throw new Error(`Backend health check returned ${response.status}.`);
    }
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Backend is not reachable: ${error.message}`
        : "Backend is not reachable. Check VITE_API_BASE_URL."
    );
  }
}
