import { useEffect, useState } from "react";
import FileCard from "../components/FileCard";
import FolderCard from "../components/FolderCard";
import { useAuth } from "../services/auth";
import {
  getDownloadUrl,
  getTrashedFiles,
  getTrashedFolders,
  permanentlyDeleteDriveFile,
  permanentlyDeleteFolder,
} from "../services/drive";
import type { DriveFile, Folder } from "../services/types";

export default function TrashPage() {
  const { user } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const [folderData, fileData] = await Promise.all([getTrashedFolders(user.id), getTrashedFiles(user.id)]);
      setFolders(folderData);
      setFiles(fileData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load Trash.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [user?.id]);

  async function handleDownload(file: DriveFile) {
    try {
      const url = await getDownloadUrl(file.file_url);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not download file.");
    }
  }

  async function handleFinalDeleteFile(file: DriveFile) {
    if (!window.confirm(`Permanently delete ${file.name}? This cannot be undone.`)) return;

    try {
      setWorking(true);
      await permanentlyDeleteDriveFile(file);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not permanently delete file.");
    } finally {
      setWorking(false);
    }
  }

  async function handleFinalDeleteFolder(folder: Folder) {
    if (!window.confirm(`Permanently delete ${folder.name} and everything inside it? This cannot be undone.`)) return;

    try {
      setWorking(true);
      await permanentlyDeleteFolder(folder);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not permanently delete folder.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <main className="p-5 md:p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-black text-slate-950">Trash</h2>
        <p className="mt-1 text-sm text-slate-500">Items stay here until you use Final Delete.</p>
      </div>

      {error && <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>}
      {working && <p className="mt-5 rounded-lg bg-blue-100 px-4 py-3 text-sm font-bold text-blue-700">Updating Trash...</p>}

      {loading ? (
        <div className="mt-10 rounded-lg bg-white p-10 text-center font-bold text-blue-700 shadow-sm">Loading Trash...</div>
      ) : (
        <>
          <section className="mt-8">
            <h3 className="mb-4 text-lg font-black text-slate-900">Folders</h3>
            {folders.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {folders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    onDelete={handleFinalDeleteFolder}
                    deleteLabel="Final Delete"
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-blue-100 bg-white p-6 text-sm font-semibold text-slate-500 shadow-sm">
                No folders in Trash.
              </div>
            )}
          </section>

          <section className="mt-8">
            <h3 className="mb-4 text-lg font-black text-slate-900">Files</h3>
            {files.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {files.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    onDownload={handleDownload}
                    onDelete={handleFinalDeleteFile}
                    deleteLabel="Final Delete"
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-blue-100 bg-white p-6 text-sm font-semibold text-slate-500 shadow-sm">
                No files in Trash.
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
