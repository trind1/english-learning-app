import { randomUUID } from "node:crypto";

import type { RequestHandler } from "express";

const safeRequestId = /^[A-Za-z0-9._-]{1,128}$/;

export const requestIdMiddleware: RequestHandler = (
  request,
  response,
  next,
) => {
  const suppliedRequestId = request.header("x-request-id");
  const requestId =
    suppliedRequestId && safeRequestId.test(suppliedRequestId)
      ? suppliedRequestId
      : randomUUID();

  response.locals.requestId = requestId;
  response.setHeader("x-request-id", requestId);
  next();
};
