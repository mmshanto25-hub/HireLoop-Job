import type { ApiFailure, ApiFieldError, ApiResponse, ApiSuccess } from "@hireloop/shared";

export const API_BASE_PATH = "/api/v1";

/** Error raised for any failed API call. Components show `message` and may use `details`. */
export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: ApiFieldError[],
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

const UNSAFE_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

/** Auth endpoints never trigger the refresh-and-retry path, which would loop. */
const NO_REFRESH_PREFIXES = ["/auth/login", "/auth/refresh", "/auth/logout", "/auth/register"];

/** Reads the readable CSRF cookie set by the API. Returns "" when it is absent. */
export function readCsrfToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)hl_csrf=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : "";
}

let refreshInFlight: Promise<boolean> | null = null;

/**
 * Asks the API for a new access cookie. Concurrent callers share one request so
 * a burst of 401s does not rotate the refresh token several times.
 */
export function refreshSession(): Promise<boolean> {
  refreshInFlight ??= rawRequest("/auth/refresh", { method: "POST" })
    .then(() => true)
    .catch(() => false)
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
}

async function rawRequest(path: string, options: RequestOptions) {
  const { method = "GET", body, signal } = options;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (UNSAFE_METHODS.has(method)) headers["X-CSRF-Token"] = readCsrfToken();

  let response: Response;
  try {
    response = await fetch(`${API_BASE_PATH}${path}`, {
      method,
      credentials: "include",
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiClientError(0, "NETWORK_ERROR", "Network request failed. Check your connection.");
  }

  let payload: ApiResponse<unknown> | undefined;
  try {
    payload = (await response.json()) as ApiResponse<unknown>;
  } catch {
    throw new ApiClientError(
      response.status,
      "INVALID_RESPONSE",
      "The server sent an unexpected response.",
    );
  }

  if (!payload.success) {
    const failure = payload as ApiFailure;
    throw new ApiClientError(
      response.status,
      failure.error.code,
      failure.error.message,
      failure.error.details,
      failure.meta?.requestId,
    );
  }
  return (payload as ApiSuccess<unknown>).data;
}

/**
 * Single fetch wrapper for the whole app. It sends cookies, adds the CSRF header
 * on writes, and unwraps the success envelope. On a 401 from a non-auth endpoint
 * it refreshes the session once and retries. It never stores tokens: they live
 * in HTTP-only cookies.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  try {
    return (await rawRequest(path, options)) as T;
  } catch (err) {
    const retryable =
      err instanceof ApiClientError &&
      err.status === 401 &&
      !NO_REFRESH_PREFIXES.some((prefix) => path.startsWith(prefix));
    if (!retryable) throw err;
    const refreshed = await refreshSession();
    if (!refreshed) throw err;
    return (await rawRequest(path, options)) as T;
  }
}

/**
 * Upload wrapper for multipart/form-data.
 * Omits Content-Type so browser sets boundary.
 */
export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-CSRF-Token": readCsrfToken(),
  };

  let response: Response;
  try {
    response = await fetch(`${API_BASE_PATH}${path}`, {
      method: "POST",
      credentials: "include",
      headers,
      body: formData,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiClientError(0, "NETWORK_ERROR", "Network request failed. Check your connection.");
  }

  let payload: ApiResponse<unknown> | undefined;
  try {
    payload = (await response.json()) as ApiResponse<unknown>;
  } catch {
    throw new ApiClientError(
      response.status,
      "INVALID_RESPONSE",
      "The server sent an unexpected response.",
    );
  }

  if (!payload.success) {
    const failure = payload as ApiFailure;
    throw new ApiClientError(
      response.status,
      failure.error.code,
      failure.error.message,
      failure.error.details,
      failure.meta?.requestId,
    );
  }
  return (payload as ApiSuccess<unknown>).data as T;
}
