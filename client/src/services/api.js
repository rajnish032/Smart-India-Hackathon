const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

/**
 * Universal Fetch API client configured with credentials: 'include' for HttpOnly cookie transport.
 * Implements silent token refresh on 401 TOKEN_EXPIRED errors.
 */

let refreshPromise = null;

export async function apiFetch(endpoint, options = {}) {
  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  // For GET requests, pass local timezone via URL query param to avoid CORS custom header preflight blocks
  if ((!options.method || options.method.toUpperCase() === 'GET') && typeof Intl !== 'undefined') {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && !url.includes('tz=')) {
        const sep = url.includes('?') ? '&' : '?';
        url = `${url}${sep}tz=${encodeURIComponent(tz)}`;
      }
    } catch (e) {}
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
    credentials: 'include', // Always send and accept HttpOnly cookies
  };

  try {
    let response = await fetch(url, config);

    // If access token expired, attempt transparent refresh once
    if (response.status === 401 && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login')) {
      const clone = response.clone();
      const errData = await clone.json().catch(() => ({}));

      if (errData.code === 'TOKEN_EXPIRED' || errData.code === 'UNAUTHORIZED' || errData.detail === 'Not authenticated' || errData.detail === 'Invalid token') {
        if (!refreshPromise) {
          refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }).finally(() => {
            // Give a small window before resetting to allow concurrent requests to share the promise
            setTimeout(() => { refreshPromise = null; }, 1000);
          });
        }

        const refreshResponse = await refreshPromise;

        // Clone the response so it can be read multiple times by different awaiting fetch calls
        const clonedRefreshResponse = refreshResponse.clone();

        if (clonedRefreshResponse.ok) {
          // Token refreshed successfully! Retry original request with newly issued cookie
          response = await fetch(url, config);
        }
      }
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(data?.error || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      error.code = data?.code;
      throw error;
    }

    // Broadcast activity sync event across tabs and components on mutations
    if (typeof window !== 'undefined' && options.method && options.method !== 'GET') {
      try {
        window.dispatchEvent(new CustomEvent('learner:activity-updated', { detail: { endpoint, data } }));
        localStorage.setItem('learner_activity_sync', Date.now().toString());
      } catch (e) {}
    }

    return data;
  } catch (error) {
    throw error;
  }
}
