import { useEffect, useState } from "react";
import FileCard from "../components/FileCard";
import FolderCard from "../components/FolderCard";
import { useAuth } from "../services/auth";
import {
  getDownloadUrl,
  getFiles,
  getFolders,
  getRecentFiles,
  getRecentFolders,
  moveDriveFileToTrash,
  moveFolderToTrash,
} from "../services/drive";
import type { DriveFile, Folder } from "../services/types";

export default function RecentPage() {
  const { user } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const [folderData, fileData] = selectedFolder
        ? await Promise.all([getFolders(user.id, selectedFolder.id), getFiles(user.id, selectedFolder.id)])
        : await Promise.all([getRecentFolders(user.id), getRecentFiles(user.id)]);

      setFolders(folderData);
      setFiles(fileData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load recent items.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [selectedFolder?.id, user?.id]);

  function handleOpenFolder(folder: Folder) {
    setSelectedFolder(folder);
  }

  async function handleDownload(file: DriveFile) {
    try {
      const url = await getDownloadUrl(file.file_url);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not download file.");
    }
  }

  async function handleDeleteFile(file: DriveFile) {
    if (!window.confirm(`Move ${file.name} to Trash?`)) return;

    try {
      setWorking(true);
      await moveDriveFileToTrash(file);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not move file to Trash.");
    } finally {
      setWorking(false);
    }
  }

  async function handleDeleteFolder(folder: Folder) {
    if (!window.confirm(`Move ${folder.name} and everything inside it to Trash?`)) return;

    try {
      setWorking(true);
      await moveFolderToTrash(folder);
      if (selectedFolder?.id === folder.id) {
        setSelectedFolder(null);
      } else {
        await refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not move folder to Trash.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <main className="p-5 md:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-950">{selectedFolder?.name ?? "Recent"}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {selectedFolder ? "Folder contents from Recent." : "Recently created folders and files."}
          </p>
        </div>
        {selectedFolder && (
          <button
            onClick={() => setSelectedFolder(null)}
            className="w-fit rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            Back to Recent
          </button>
        )}
      </div>

      {error && <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>}
      {working && <p className="mt-5 rounded-lg bg-blue-100 px-4 py-3 text-sm font-bold text-blue-700">Updating drive...</p>}

      {loading ? (
        <div className="mt-10 rounded-lg bg-white p-10 text-center font-bold text-blue-700 shadow-sm">Loading recent items...</div>
      ) : (
        <>
          <section className="mt-8">
            <h3 className="mb-4 text-lg font-black text-slate-900">Folders</h3>
            {folders.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {folders.map((folder) => (
                  <FolderCard key={folder.id} folder={folder} onOpen={handleOpenFolder} onDelete={handleDeleteFolder} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-blue-100 bg-white p-6 text-sm font-semibold text-slate-500 shadow-sm">
                {selectedFolder ? "No folders in this folder." : "No recent folders yet."}
              </div>
            )}
          </section>

          <section className="mt-8">
            <h3 className="mb-4 text-lg font-black text-slate-900">Files</h3>
            {files.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {files.map((file) => (
                  <FileCard key={file.id} file={file} onDownload={handleDownload} onDelete={handleDeleteFile} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-blue-100 bg-white p-6 text-sm font-semibold text-slate-500 shadow-sm">
                {selectedFolder ? "No files in this folder." : "No recent files yet."}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
