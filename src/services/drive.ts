import supabase from "../supabase";
import type { DriveFile, Folder } from "./types";

const STORAGE_BUCKET = "files";

function applyNullableFilter<T extends { is: (column: string, value: null) => T; eq: (column: string, value: string) => T }>(
  query: T,
  column: string,
  value: string | null,
) {
  return value ? query.eq(column, value) : query.is(column, null);
}

export async function getFolder(folderId: string) {
  const { data, error } = await supabase.from("folders").select("*").eq("id", folderId).is("trashed_at", null).single<Folder>();

  if (error) throw error;
  return data;
}

export async function getFolders(userId: string, parentId: string | null) {
  let query = supabase
    .from("folders")
    .select("*")
    .eq("user_id", userId)
    .is("trashed_at", null)
    .order("created_at", { ascending: false });
  query = applyNullableFilter(query, "parent_id", parentId);

  const { data, error } = await query.returns<Folder[]>();

  if (error) throw error;
  return data ?? [];
}

export async function createFolder(userId: string, name: string, parentId: string | null) {
  const { data, error } = await supabase
    .from("folders")
    .insert({ name, user_id: userId, parent_id: parentId })
    .select("*")
    .single<Folder>();

  if (error) throw error;
  return data;
}

export async function getFiles(userId: string, folderId: string | null) {
  let query = supabase
    .from("files")
    .select("*")
    .eq("user_id", userId)
    .is("trashed_at", null)
    .order("created_at", { ascending: false });
  query = applyNullableFilter(query, "folder_id", folderId);

  const { data, error } = await query.returns<DriveFile[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getRecentFolders(userId: string, limit = 12) {
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("user_id", userId)
    .is("trashed_at", null)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<Folder[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getRecentFiles(userId: string, limit = 12) {
  const { data, error } = await supabase
    .from("files")
    .select("*")
    .eq("user_id", userId)
    .is("trashed_at", null)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<DriveFile[]>();

  if (error) throw error;
  return data ?? [];
}

export async function uploadDriveFile(userId: string, folderId: string | null, file: File) {
  const safeName = file.name.replace(/[\\/#?%*:|"<>]/g, "-");
  const storagePath = `${userId}/${folderId ?? "root"}/${Date.now()}-${safeName}`;
  const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, file, {
    upsert: false,
  });

  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from("files")
    .insert({
      name: file.name,
      user_id: userId,
      folder_id: folderId,
      file_url: storagePath,
      size: file.size,
    })
    .select("*")
    .single<DriveFile>();

  if (error) {
    await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
    throw error;
  }

  return data;
}

export async function getDownloadUrl(filePath: string) {
  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(filePath, 60);

  if (error) throw error;
  return data.signedUrl;
}

export async function getTrashedFolders(userId: string) {
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("user_id", userId)
    .not("trashed_at", "is", null)
    .order("trashed_at", { ascending: false })
    .returns<Folder[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getTrashedFiles(userId: string) {
  const { data, error } = await supabase
    .from("files")
    .select("*")
    .eq("user_id", userId)
    .not("trashed_at", "is", null)
    .order("trashed_at", { ascending: false })
    .returns<DriveFile[]>();

  if (error) throw error;
  return data ?? [];
}

async function getChildFolders(folderId: string) {
  const { data, error } = await supabase.from("folders").select("*").eq("parent_id", folderId).returns<Folder[]>();

  if (error) throw error;
  return data ?? [];
}

async function collectFolderTree(folderId: string) {
  const folderIds = [folderId];
  const queue = [folderId];

  while (queue.length) {
    const currentId = queue.shift();
    if (!currentId) continue;

    const children = await getChildFolders(currentId);
    for (const child of children) {
      folderIds.push(child.id);
      queue.push(child.id);
    }
  }

  return folderIds;
}

export async function moveDriveFileToTrash(file: DriveFile) {
  const { error } = await supabase.from("files").update({ trashed_at: new Date().toISOString() }).eq("id", file.id);

  if (error) throw error;
}

export async function moveFolderToTrash(folder: Folder) {
  const folderIds = await collectFolderTree(folder.id);
  const trashedAt = new Date().toISOString();

  const { error: folderError } = await supabase.from("folders").update({ trashed_at: trashedAt }).in("id", folderIds);

  if (folderError) throw folderError;

  const { error: fileError } = await supabase.from("files").update({ trashed_at: trashedAt }).in("folder_id", folderIds);

  if (fileError) throw fileError;
}

export async function permanentlyDeleteDriveFile(file: DriveFile) {
  const { error: storageError } = await supabase.storage.from(STORAGE_BUCKET).remove([file.file_url]);

  if (storageError) throw storageError;

  const { error } = await supabase.from("files").delete().eq("id", file.id);

  if (error) throw error;
}

export async function permanentlyDeleteFolder(folder: Folder) {
  const folderIds = await collectFolderTree(folder.id);
  const { data: folderFiles, error: filesError } = await supabase
    .from("files")
    .select("*")
    .in("folder_id", folderIds)
    .returns<DriveFile[]>();

  if (filesError) throw filesError;

  const filePaths = (folderFiles ?? []).map((file) => file.file_url);
  if (filePaths.length) {
    const { error: storageError } = await supabase.storage.from(STORAGE_BUCKET).remove(filePaths);

    if (storageError) throw storageError;
  }

  const { error } = await supabase.from("folders").delete().eq("id", folder.id);

  if (error) throw error;
}
