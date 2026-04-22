const DEFAULT_API_URL = "http://localhost:5051/api";
const AUTH_TOKEN_STORAGE_KEY = "fierostore.auth-token";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getApiBaseUrl() {
  return trimTrailingSlash(process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL);
}

export function getApiOrigin() {
  return getApiBaseUrl().replace(/\/api$/, "");
}

export function resolveAssetUrl(value: string) {
  if (!value) return "";
  if (/^(https?:)?\/\//.test(value) || value.startsWith("blob:") || value.startsWith("data:")) {
    return value;
  }

  return `${getApiOrigin()}${value.startsWith("/") ? value : `/${value}`}`;
}

export function readAuthToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function storeAuthToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}

async function parseResponse<T>(response: Response) {
  const text = await response.text();
  const data = text ? (JSON.parse(text) as T | { message?: string }) : null;

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data && data.message
        ? data.message
        : "Request failed.";

    throw new Error(message);
  }

  return data as T;
}

export async function apiRequest<T>(
  path: string,
  options: {
    method?: string;
    body?: BodyInit | FormData | object | null;
    headers?: Record<string, string>;
    token?: string | null;
  } = {}
) {
  const token = options.token ?? readAuthToken();
  const headers = new Headers(options.headers);
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  if (!isFormData && options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      method: options.method ?? "GET",
      headers,
      body:
        !options.body || isFormData || typeof options.body === "string"
          ? (options.body as BodyInit | null | undefined)
          : JSON.stringify(options.body)
    });
  } catch {
    throw new Error("Backendga ulanib bo'lmadi. `fierostoreBackend` serveri ishga tushganini tekshiring.");
  }

  return parseResponse<T>(response);
}
