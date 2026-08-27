import { Prisma, type PrismaClient } from "@prisma/client";

import { FolderNotFoundError } from "../folders/folder-errors";
import { VocabularyDuplicateError } from "./vocabulary-errors";
import type {
  CreateVocabularyRecord,
  VocabularyRecord,
  VocabularyImportRepository,
  ImportVocabularyRecord,
} from "./vocabulary-repository";

export class PrismaVocabularyRepository implements VocabularyImportRepository {
  public constructor(private readonly client: PrismaClient) {}

  public async create(
    input: CreateVocabularyRecord,
  ): Promise<VocabularyRecord> {
    try {
      return await this.client.vocabulary.create({ data: input });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") throw new VocabularyDuplicateError();
        if (error.code === "P2003") throw new FolderNotFoundError();
      }
      throw error;
    }
  }

  public async listByFolderId(
    folderId: string,
  ): Promise<readonly VocabularyRecord[]> {
    return this.client.vocabulary.findMany({
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      where: { folderId },
    });
  }

  public async importRows(
    input: readonly ImportVocabularyRecord[],
  ): Promise<readonly VocabularyRecord[]> {
    return this.client.$transaction(async (tx) => {
      const result: VocabularyRecord[] = [];
      for (const row of input) {
        try {
          result.push(await tx.vocabulary.create({ data: row }));
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
          ) {
            throw new VocabularyDuplicateError();
          }
          throw error;
        }
      }
      return result;
    });
  }
}
