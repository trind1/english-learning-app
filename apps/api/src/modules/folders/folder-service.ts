import type { FolderSummary } from "@english-learning/contracts";

import { FolderNotFoundError } from "./folder-errors";
import type { FolderRecord, FolderRepository } from "./folder-repository";

const toSummary = (folder: FolderRecord): FolderSummary => ({
  createdAt: folder.createdAt.toISOString(),
  id: folder.id,
  name: folder.name,
  updatedAt: folder.updatedAt.toISOString(),
  vocabularyCount: folder.vocabularyCount,
});

export class FolderService {
  public constructor(private readonly repository: FolderRepository) {}

  public async create(name: string): Promise<FolderSummary> {
    const trimmedName = name.trim();
    const folder = await this.repository.create({
      name: trimmedName,
      normalizedName: trimmedName.toLowerCase(),
    });

    return toSummary(folder);
  }

  public async getById(id: string): Promise<FolderSummary> {
    const folder = await this.repository.findById(id);
    if (!folder) throw new FolderNotFoundError();

    return toSummary(folder);
  }

  public async list(): Promise<readonly FolderSummary[]> {
    return (await this.repository.list()).map(toSummary);
  }
}
