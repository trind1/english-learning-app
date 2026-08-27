import type { VocabularyItem } from "@english-learning/contracts";

import type { FolderService } from "../folders/folder-service";
import type {
  CreateVocabularyRecord,
  VocabularyRecord,
  VocabularyRepository,
} from "./vocabulary-repository";

const toItem = (vocabulary: VocabularyRecord): VocabularyItem => ({
  createdAt: vocabulary.createdAt.toISOString(),
  folderId: vocabulary.folderId,
  id: vocabulary.id,
  ipa: vocabulary.ipa,
  meaning: vocabulary.meaning,
  updatedAt: vocabulary.updatedAt.toISOString(),
  word: vocabulary.word,
});

export class VocabularyService {
  public constructor(
    private readonly repository: VocabularyRepository,
    private readonly folderService: FolderService,
  ) {}

  public async create(
    input: Omit<CreateVocabularyRecord, "normalizedWord">,
  ): Promise<VocabularyItem> {
    await this.folderService.getById(input.folderId);
    const word = input.word.trim();
    const vocabulary = await this.repository.create({
      folderId: input.folderId,
      ipa: input.ipa?.trim() || null,
      meaning: input.meaning.trim(),
      normalizedWord: word.toLowerCase(),
      word,
    });

    return toItem(vocabulary);
  }

  public async list(folderId: string) {
    const folder = await this.folderService.getById(folderId);
    const vocabulary = (await this.repository.listByFolderId(folderId)).map(
      toItem,
    );

    return { folder, vocabulary };
  }
}
