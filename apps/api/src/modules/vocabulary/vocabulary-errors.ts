export class VocabularyDuplicateError extends Error {
  public constructor() {
    super("This word already exists in the folder.");
    this.name = "VocabularyDuplicateError";
  }
}
