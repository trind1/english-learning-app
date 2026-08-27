export type VocabularyRecord = Readonly<{
  createdAt: Date;
  folderId: string;
  id: string;
  ipa: string | null;
  meaning: string;
  updatedAt: Date;
  word: string;
}>;

export type CreateVocabularyRecord = Readonly<{
  folderId: string;
  ipa: string | null;
  meaning: string;
  normalizedWord: string;
  word: string;
}>;

export interface VocabularyRepository {
  create(input: CreateVocabularyRecord): Promise<VocabularyRecord>;
  listByFolderId(folderId: string): Promise<readonly VocabularyRecord[]>;
}

export type ImportVocabularyRecord = CreateVocabularyRecord;

export interface VocabularyImportRepository extends VocabularyRepository {
  importRows(
    input: readonly ImportVocabularyRecord[],
  ): Promise<readonly VocabularyRecord[]>;
}
