import type { DriveFile } from "../services/types";

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** unitIndex).toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export default function FileCard({
  deleteLabel = "Delete",
  file,
  onDelete,
  onDownload,
}: {
  deleteLabel?: string;
  file: DriveFile;
  onDelete: (file: DriveFile) => void;
  onDownload: (file: DriveFile) => void;
}) {
  return (
    <article className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-xl font-black text-white">
        D
      </div>
      <h3 className="truncate text-base font-bold text-slate-900">{file.name}</h3>
      <p className="mt-1 text-xs font-medium text-slate-500">{formatBytes(file.size)}</p>
      <div className="mt-5 flex gap-2">
        <button
          onClick={() => onDownload(file)}
          className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          Download
        </button>
        <button
          onClick={() => onDelete(file)}
          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
        >
          {deleteLabel}
        </button>
      </div>
    </article>
  );
}
