import type { FieldError } from "@english-learning/contracts";

export class HttpError extends Error {
  public constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fieldErrors?: readonly FieldError[],
  ) {
    super(message);
    this.name = "HttpError";
  }
}
