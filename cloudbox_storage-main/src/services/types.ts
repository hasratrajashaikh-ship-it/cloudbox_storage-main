export type Folder = {
  id: string;
  name: string;
  user_id: string;
  parent_id: string | null;
  created_at: string;
  trashed_at: string | null;
};

export type DriveFile = {
  id: string;
  name: string;
  user_id: string;
  folder_id: string | null;
  file_url: string;
  size: number;
  created_at: string;
  trashed_at: string | null;
};
