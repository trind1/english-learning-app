import { createHmac, timingSafeEqual } from "node:crypto";

import { HttpError } from "../../http/errors";

export type TestQuestion = Readonly<{
  vocabularyId: string;
  word: string;
  ipa: string | null;
  correctMeaning: string;
  choices: readonly string[];
}>;
export type TestSnapshot = Readonly<{
  version: "v1";
  folderId: string;
  issuedAt: string;
  expiresAt: string;
  questions: readonly TestQuestion[];
}>;

const encode = (value: string) =>
  Buffer.from(value, "utf8").toString("base64url");
const decode = (value: string) =>
  Buffer.from(value, "base64url").toString("utf8");
const canonical = (snapshot: TestSnapshot) =>
  JSON.stringify({
    version: snapshot.version,
    folderId: snapshot.folderId,
    issuedAt: snapshot.issuedAt,
    expiresAt: snapshot.expiresAt,
    questions: snapshot.questions.map((question) => ({
      vocabularyId: question.vocabularyId,
      word: question.word,
      ipa: question.ipa,
      correctMeaning: question.correctMeaning,
      choices: question.choices,
    })),
  });

export const signSnapshot = (snapshot: TestSnapshot, secret: string) => {
  const payload = encode(canonical(snapshot));
  const signature = createHmac("sha256", secret)
    .update(`v1.${payload}`)
    .digest("base64url");
  return `v1.${payload}.${signature}`;
};

export const verifySnapshot = (
  token: string,
  secret: string,
  now: Date,
): TestSnapshot => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || parts[0] !== "v1") throw new Error("invalid");
    const expected = createHmac("sha256", secret)
      .update(`${parts[0]}.${parts[1]}`)
      .digest();
    const actual = Buffer.from(parts[2]!, "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
      throw new Error("invalid");
    const snapshot = JSON.parse(decode(parts[1]!)) as TestSnapshot;
    if (snapshot.version !== "v1") throw new Error("invalid");
    if (now.getTime() >= new Date(snapshot.expiresAt).getTime())
      throw new HttpError(
        400,
        "TEST_TOKEN_EXPIRED",
        "The test token has expired.",
      );
    return snapshot;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      400,
      "INVALID_TEST_TOKEN",
      "The test token is invalid.",
    );
  }
};
