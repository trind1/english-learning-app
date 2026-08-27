export class FolderDuplicateError extends Error {
  public constructor() {
    super("A folder with this name already exists.");
    this.name = "FolderDuplicateError";
  }
}

export class FolderNotFoundError extends Error {
  public constructor() {
    super("The requested folder was not found.");
    this.name = "FolderNotFoundError";
  }
}
