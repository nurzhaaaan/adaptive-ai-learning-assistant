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

  const response = await resilientFetch(`${API_URL}${path}`, { ...options, headers });

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

// Retry only safe reads; never replay a quiz submission or registration.
async function resilientFetch(url, options) {
  const safe = ['GET','HEAD'].includes((options.method || 'GET').toUpperCase());
  for (let i=0; i<(safe?3:1); i++) {
    const controller = new AbortController();
    const timer=setTimeout(()=>controller.abort(), 45000);
    const abort=()=>controller.abort();
    if(options.signal?.aborted) abort();
    options.signal?.addEventListener('abort',abort,{once:true});
    try {
      const response=await fetch(url,{...options,signal:controller.signal});
      if(safe && i<2 && [502,503,504,429].includes(response.status)){await response.body?.cancel();} else return response;
    } catch(e) {
      if(options.signal?.aborted) throw e;
      if(!safe || i===2) throw new Error('Server unavailable or starting up. Please retry.');
    } finally {clearTimeout(timer);options.signal?.removeEventListener('abort',abort);}
    await new Promise(r=>setTimeout(r,2000*(i+1)));
  }
}
