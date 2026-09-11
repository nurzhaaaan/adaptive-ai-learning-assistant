const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080/api";

/**
 * Main API helper
 *
 * Public endpoint:
 * api("/auth/login", {
 *   method: "POST",
 *   body: JSON.stringify({...})
 * })
 *
 * Protected endpoint:
 * api("/courses")
 *
 * Token localStorage-тан автоматты түрде алынады.
 */
export async function api(
  path,
  options = {},
  providedToken = null
) {
  const storedToken =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const token = providedToken || storedToken;

  const headers = {
    "Content-Type": "application/json",

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),

    ...(options.headers || {}),
  };

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers,
    }
  );

  let data = null;

  const contentType =
    response.headers.get("content-type") || "";

  try {
    if (
      contentType.includes("application/json")
    ) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text || null;
    }
  } catch {
    data = null;
  }

  if (
    response.status === 401 ||
    response.status === 403
  ) {
    /*
     * Егер protected request token проблемасымен
     * құласа, stale session-ды тазалаймыз.
     *
     * Auth login/register endpoint-терінде token
     * болмауы қалыпты.
     */
    const isAuthEndpoint =
      path.startsWith("/auth/");

    if (!isAuthEndpoint) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }

  if (!response.ok) {
    let message =
      `Request failed: ${response.status}`;

    if (
      data &&
      typeof data === "object"
    ) {
      message =
        data.message ||
        data.error ||
        message;
    }

    if (
      typeof data === "string" &&
      data.trim()
    ) {
      message = data;
    }

    throw new Error(message);
  }

  return data;
}

/**
 * Alias.
 */
export const apiRequest = api;

/**
 * Current backend API URL.
 */
export { API_URL };