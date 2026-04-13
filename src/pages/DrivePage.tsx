import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FileCard from "../components/FileCard";
import FolderCard from "../components/FolderCard";
import UploadDropzone from "../components/UploadDropzone";
import { useAuth } from "../services/auth";
import {
  createFolder,
  getDownloadUrl,
  getFiles,
  getFolder,
  getFolders,
  moveDriveFileToTrash,
  moveFolderToTrash,
  uploadDriveFile,
} from "../services/drive";
import type { DriveFile, Folder } from "../services/types";

export default function DrivePage() {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentFolderId = folderId ?? null;
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  const folderTitle = useMemo(() => currentFolder?.name ?? "My Drive", [currentFolder]);

  async function refresh() {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const [folderData, fileData, currentFolderData] = await Promise.all([
        getFolders(user.id, currentFolderId),
        getFiles(user.id, currentFolderId),
        currentFolderId ? getFolder(currentFolderId) : Promise.resolve(null),
      ]);

      setFolders(folderData);
      setFiles(fileData);
      setCurrentFolder(currentFolderData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load drive.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [currentFolderId, user?.id]);

  async function handleCreateFolder() {
    if (!user) return;

    const name = window.prompt("Folder name")?.trim();
    if (!name) return;

    try {
      setWorking(true);
      await createFolder(user.id, name, currentFolderId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create folder.");
    } finally {
      setWorking(false);
    }
  }

  async function handleUpload(fileList: FileList) {
    if (!user) return;

    try {
      setWorking(true);

      for (const file of Array.from(fileList)) {
        await uploadDriveFile(user.id, currentFolderId, file);
      }

      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload file.");
    } finally {
      setWorking(false);
    }
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
      await refresh();
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
          <button
            onClick={() => navigate("/drive")}
            className="mb-2 text-sm font-bold text-blue-600 transition hover:text-blue-800"
          >
            My Drive
          </button>
          <h2 className="text-3xl font-black text-slate-950">{folderTitle}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {folders.length} folders, {files.length} files
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {currentFolder?.parent_id && (
            <button
              onClick={() => navigate(`/drive/${currentFolder.parent_id}`)}
              className="rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Back
            </button>
          )}
          {currentFolder && !currentFolder.parent_id && (
            <button
              onClick={() => navigate("/drive")}
              className="rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Back
            </button>
          )}
          <button
            onClick={handleCreateFolder}
            disabled={working}
            className="rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
          >
            New Folder
          </button>
          <button
            onClick={() => document.getElementById("hidden-upload")?.click()}
            disabled={working}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg disabled:bg-blue-300"
          >
            Upload
          </button>
          <input id="hidden-upload" type="file" multiple className="hidden" onChange={(event) => event.target.files && handleUpload(event.target.files)} />
        </div>
      </div>

      <UploadDropzone onUpload={handleUpload} />

      {error && <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>}
      {working && <p className="mt-5 rounded-lg bg-blue-100 px-4 py-3 text-sm font-bold text-blue-700">Updating drive...</p>}

      {loading ? (
        <div className="mt-10 rounded-lg bg-white p-10 text-center font-bold text-blue-700 shadow-sm">Loading files...</div>
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
                    onOpen={(item) => navigate(`/drive/${item.id}`)}
                    onDelete={handleDeleteFolder}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-blue-100 bg-white p-6 text-sm font-semibold text-slate-500 shadow-sm">
                No folders here yet.
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
                No files in this folder.
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
