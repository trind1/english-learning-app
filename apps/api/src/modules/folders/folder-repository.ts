export type FolderRecord = Readonly<{
  createdAt: Date;
  id: string;
  name: string;
  updatedAt: Date;
  vocabularyCount: number;
}>;

export type CreateFolderRecord = Readonly<{
  name: string;
  normalizedName: string;
}>;

export interface FolderRepository {
  create(input: CreateFolderRecord): Promise<FolderRecord>;
  findById(id: string): Promise<FolderRecord | null>;
  list(): Promise<readonly FolderRecord[]>;
}
