import { Prisma, type PrismaClient } from "@prisma/client";

import { FolderDuplicateError } from "./folder-errors";
import type {
  CreateFolderRecord,
  FolderRecord,
  FolderRepository,
} from "./folder-repository";

type FolderWithCount = Prisma.FolderGetPayload<{
  include: { _count: { select: { vocabulary: true } } };
}>;

const toRecord = (folder: FolderWithCount): FolderRecord => ({
  createdAt: folder.createdAt,
  id: folder.id,
  name: folder.name,
  updatedAt: folder.updatedAt,
  vocabularyCount: folder._count.vocabulary,
});

export class PrismaFolderRepository implements FolderRepository {
  public constructor(private readonly client: PrismaClient) {}

  public async create(input: CreateFolderRecord): Promise<FolderRecord> {
    try {
      return toRecord(
        await this.client.folder.create({
          data: input,
          include: { _count: { select: { vocabulary: true } } },
        }),
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new FolderDuplicateError();
      }
      throw error;
    }
  }

  public async findById(id: string): Promise<FolderRecord | null> {
    const folder = await this.client.folder.findUnique({
      include: { _count: { select: { vocabulary: true } } },
      where: { id },
    });

    return folder ? toRecord(folder) : null;
  }

  public async list(): Promise<readonly FolderRecord[]> {
    const folders = await this.client.folder.findMany({
      include: { _count: { select: { vocabulary: true } } },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    return folders.map(toRecord);
  }
}
