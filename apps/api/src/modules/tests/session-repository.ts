import type { PrismaClient } from "@prisma/client";

export type SessionAnswerInput = Readonly<{
  vocabularyId: string;
  questionWord: string;
  selectedMeaning: string;
  correctMeaning: string;
  isCorrect: boolean;
}>;
export type SessionPublic = Readonly<{
  sessionId: string;
  folderId: string;
  correctCount: number;
  incorrectCount: number;
  totalCount: number;
  completedAt: Date;
  answers: readonly SessionAnswerInput[];
}>;
export interface SessionRepository {
  complete(input: {
    folderId: string;
    completionKeyHash: string;
    completedAt: Date;
    answers: readonly SessionAnswerInput[];
  }): Promise<SessionPublic>;
  findById(id: string): Promise<SessionPublic | null>;
}

export class PrismaSessionRepository implements SessionRepository {
  public constructor(private readonly client: PrismaClient) {}
  public async complete(input: {
    folderId: string;
    completionKeyHash: string;
    completedAt: Date;
    answers: readonly SessionAnswerInput[];
  }): Promise<SessionPublic> {
    return this.client.$transaction(async (tx) => {
      const session = await tx.testSession.create({
        data: {
          folderId: input.folderId,
          completionKeyHash: input.completionKeyHash,
          totalQuestions: input.answers.length,
          correctCount: input.answers.filter((a) => a.isCorrect).length,
          incorrectCount: input.answers.filter((a) => !a.isCorrect).length,
          completedAt: input.completedAt,
        },
      });
      await tx.testAnswer.createMany({
        data: input.answers.map((answer) => ({
          ...answer,
          sessionId: session.id,
        })),
      });
      return {
        sessionId: session.id,
        folderId: session.folderId,
        correctCount: session.correctCount,
        incorrectCount: session.incorrectCount,
        totalCount: session.totalQuestions,
        completedAt: session.completedAt,
        answers: input.answers,
      };
    });
  }
  public async findById(id: string): Promise<SessionPublic | null> {
    const session = await this.client.testSession.findUnique({
      where: { id },
      include: { answers: { orderBy: { answeredAt: "asc" } } },
    });
    if (!session) return null;
    return {
      sessionId: session.id,
      folderId: session.folderId,
      correctCount: session.correctCount,
      incorrectCount: session.incorrectCount,
      totalCount: session.totalQuestions,
      completedAt: session.completedAt,
      answers: session.answers.map((a) => ({
        vocabularyId: a.vocabularyId,
        questionWord: a.questionWord,
        selectedMeaning: a.selectedMeaning,
        correctMeaning: a.correctMeaning,
        isCorrect: a.isCorrect,
      })),
    };
  }
}
