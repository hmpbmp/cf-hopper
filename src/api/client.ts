const BASE_URL = "/api";
const DEFAULT_TIMEOUT = 10000;

export async function request<T>(
  path: string,
  options?: RequestInit & { timeout?: number }
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const controller = new AbortController();
  const timeout = options?.timeout || DEFAULT_TIMEOUT;
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      signal: controller.signal,
      ...options,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(error.error || `HTTP ${res.status}`);
    }

    return res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}
