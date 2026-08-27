-- CreateTable
CREATE TABLE "Folder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Vocabulary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "folderId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "normalizedWord" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "ipa" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Vocabulary_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TestSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "folderId" TEXT NOT NULL,
    "completionKeyHash" TEXT NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "incorrectCount" INTEGER NOT NULL,
    "completedAt" DATETIME NOT NULL,
    CONSTRAINT "TestSession_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TestAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "vocabularyId" TEXT NOT NULL,
    "questionWord" TEXT NOT NULL,
    "selectedMeaning" TEXT NOT NULL,
    "correctMeaning" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "answeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TestAnswer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TestSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TestAnswer_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "Vocabulary" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Folder_normalizedName_key" ON "Folder"("normalizedName");

-- CreateIndex
CREATE INDEX "Vocabulary_folderId_createdAt_idx" ON "Vocabulary"("folderId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Vocabulary_folderId_normalizedWord_key" ON "Vocabulary"("folderId", "normalizedWord");

-- CreateIndex
CREATE UNIQUE INDEX "TestSession_completionKeyHash_key" ON "TestSession"("completionKeyHash");

-- CreateIndex
CREATE INDEX "TestSession_folderId_completedAt_idx" ON "TestSession"("folderId", "completedAt");

-- CreateIndex
CREATE INDEX "TestAnswer_sessionId_idx" ON "TestAnswer"("sessionId");

-- CreateIndex
CREATE INDEX "TestAnswer_vocabularyId_idx" ON "TestAnswer"("vocabularyId");

-- CreateIndex
CREATE UNIQUE INDEX "TestAnswer_sessionId_vocabularyId_key" ON "TestAnswer"("sessionId", "vocabularyId");
