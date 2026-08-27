import type { ApiErrorEnvelope, FieldError } from "@english-learning/contracts";
import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";

import { HttpError } from "./errors";

const requestIdFrom = (locals: Record<string, unknown>): string =>
  typeof locals.requestId === "string" ? locals.requestId : "unavailable";

const zodFieldErrors = (error: ZodError): FieldError[] =>
  error.issues.map((issue) => ({
    message: issue.message,
    path: issue.path.join(".") || "request",
  }));

export const notFoundHandler: RequestHandler = (_request, _response, next) => {
  next(
    new HttpError(404, "NOT_FOUND", "The requested resource was not found."),
  );
};

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  void _next;
  const requestId = requestIdFrom(response.locals);
  let status = 500;
  let envelope: ApiErrorEnvelope = {
    error: {
      code: "INTERNAL_ERROR",
      message: "The request could not be completed.",
      requestId,
    },
  };

  if (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === "entity.too.large"
  ) {
    status = 413;
    envelope = {
      error: {
        code: "PAYLOAD_TOO_LARGE",
        message: "The request body is too large.",
        requestId,
      },
    };
  } else if (error instanceof HttpError) {
    status = error.status;
    envelope = {
      error: {
        code: error.code,
        ...(error.fieldErrors ? { fieldErrors: [...error.fieldErrors] } : {}),
        message: error.message,
        requestId,
      },
    };
  } else if (error instanceof ZodError) {
    status = 400;
    envelope = {
      error: {
        code: "VALIDATION_ERROR",
        fieldErrors: zodFieldErrors(error),
        message: "Review the highlighted values.",
        requestId,
      },
    };
  }

  response.status(status).json(envelope);
};
