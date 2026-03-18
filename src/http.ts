import type { RequestOptions, ApiError } from "./types";

const DEFAULT_TIMEOUT = 30_000;

export class StableFiError extends Error {
  public readonly status: number;
  public readonly code: string | undefined;

  constructor(err: ApiError) {
    super(err.message);
    this.name = "StableFiError";
    this.status = err.status;
    this.code = err.code;
  }
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeout: number;

  constructor(baseUrl: string, apiKey: string, timeout?: number) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.apiKey = apiKey;
    this.timeout = timeout ?? DEFAULT_TIMEOUT;
  }

  async request<T>(opts: RequestOptions): Promise<T> {
    const url = `${this.baseUrl}${opts.path}`;

    const headers: Record<string, string> = {
      "Authorization": `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "@stablefi/sdk-node/0.1.0",
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const res = await fetch(url, {
        method: opts.method,
        headers,
        body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
        signal: controller.signal,
      });

      const text = await res.text();
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }

      if (!res.ok) {
        const errBody = data as Record<string, unknown> | undefined;
        throw new StableFiError({
          status: res.status,
          message:
            (errBody && typeof errBody === "object" && typeof errBody.message === "string"
              ? errBody.message
              : undefined) ??
            (typeof data === "string" ? data : `Request failed with status ${res.status}`),
          code:
            errBody && typeof errBody === "object" && typeof errBody.code === "string"
              ? errBody.code
              : undefined,
        });
      }

      return data as T;
    } catch (err) {
      if (err instanceof StableFiError) throw err;
      if (err instanceof Error && err.name === "AbortError") {
        throw new StableFiError({
          status: 0,
          message: `Request to ${opts.path} timed out after ${this.timeout}ms`,
        });
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}
