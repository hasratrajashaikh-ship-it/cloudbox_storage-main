import type { Folder } from "../services/types";

export default function FolderCard({
  folder,
  onDelete,
  onOpen,
  deleteLabel = "Delete",
}: {
  folder: Folder;
  onDelete?: (folder: Folder) => void;
  onOpen?: (folder: Folder) => void;
  deleteLabel?: string;
}) {
  return (
    <article className="group rounded-lg border border-blue-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-xl font-black text-blue-700">
        F
      </div>
      <h3 className="truncate text-base font-bold text-slate-900 group-hover:text-blue-700">{folder.name}</h3>
      <p className="mt-1 text-xs font-medium text-slate-500">Folder</p>
      <div className="mt-5 flex gap-2">
        {onOpen && (
          <button
            onClick={() => onOpen(folder)}
            className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            Open
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(folder)}
            className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
          >
            {deleteLabel}
          </button>
        )}
      </div>
    </article>
  );
}
