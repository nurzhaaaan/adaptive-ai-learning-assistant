const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080/api";

/**
 * Main API helper
 *
 * Usage:
 * api("/auth/login", {
 *   method: "POST",
 *   body: JSON.stringify({...})
 * })
 *
 * api("/courses", {}, token)
 */
export async function api(
  path,
  options = {},
  token = null
) {
  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,

      headers: {
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),

        ...(options.headers || {}),
      },
    }
  );

  let data = null;

  const contentType =
    response.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text || null;
    }
  } catch {
    data = null;
  }

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;

    if (
      data &&
      typeof data === "object"
    ) {
      message =
        data.message ||
        data.error ||
        message;
    }

    if (typeof data === "string" && data.trim()) {
      message = data;
    }

    throw new Error(message);
  }

  return data;
}

/**
 * Alias.
 *
 * apiRequest және api екеуін де
 * қолдануға болады.
 */
export const apiRequest = api;

/**
 * Current backend API URL.
 */
export { API_URL };