import {
  apiErrorEnvelopeSchema,
  type ApiErrorEnvelope,
} from "@english-learning/contracts";
import { z } from "zod";

export class ApiClientError extends Error {
  public constructor(public readonly details: ApiErrorEnvelope["error"]) {
    super(details.message);
    this.name = "ApiClientError";
  }
}

export type ApiClient = Readonly<{
  request: <Output>(
    path: string,
    schema: z.ZodType<Output>,
    init?: RequestInit,
  ) => Promise<Output>;
}>;

export const createApiClient = (
  baseUrl: string,
  fetcher: typeof fetch = fetch,
): ApiClient => {
  const normalizedBaseUrl = z.string().url().parse(baseUrl).replace(/\/$/, "");

  return {
    request: async <Output>(
      path: string,
      schema: z.ZodType<Output>,
      init?: RequestInit,
    ) => {
      const response = await fetcher(
        `${normalizedBaseUrl}/${path.replace(/^\//, "")}`,
        {
          ...init,
          headers: {
            Accept: "application/json",
            ...(init?.body && !(init.body instanceof FormData)
              ? { "Content-Type": "application/json" }
              : {}),
            ...init?.headers,
          },
        },
      );
      const payload: unknown = await response.json();

      if (!response.ok) {
        throw new ApiClientError(apiErrorEnvelopeSchema.parse(payload).error);
      }

      return schema.parse(payload);
    },
  };
};
