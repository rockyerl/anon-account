import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    request_id: string;
    details?: unknown;
  };
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

export function apiSuccess<T>(data: T, status = 200, meta?: ApiSuccessResponse<T>["meta"]) {
  return NextResponse.json<ApiSuccessResponse<T>>(
    {
      success: true,
      data,
      ...(meta ? { meta } : {}),
    },
    { status }
  );
}

export function apiError(message: string, code = "BAD_REQUEST", status = 400, details?: unknown) {
  const requestId = randomUUID();
  return NextResponse.json<ApiErrorResponse>(
    {
      error: {
        code,
        message,
        request_id: requestId,
        ...(details ? { details } : {}),
      },
    },
    { status }
  );
}
