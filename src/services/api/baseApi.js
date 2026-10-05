import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ACCESS_TOKEN_KEY } from "@/constants/storage";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include",
  // Parse JSON when the server says so, otherwise fall back to text.
  responseHandler: "content-type",
  prepareHeaders: (headers) => {
    const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

function extractErrorMessage(error) {
  if (error.status === "FETCH_ERROR") {
    return "Could not reach the server. Check your connection and try again.";
  }

  const data = error.data;
  const validationMessage = Array.isArray(data?.errors)
    ? data.errors
        .map((fieldError) =>
          typeof fieldError === "string" ? fieldError : fieldError?.msg || fieldError?.message,
        )
        .filter(Boolean)
        .join(" ")
    : "";

  return (
    validationMessage ||
    data?.message ||
    data?.error ||
    (typeof data === "string" && data.trim()) ||
    `Request failed with status ${error.status}.`
  );
}

// Normalises every failure to `{ status, data, message }` so components can keep
// reading `error.message` (and `error.status`) exactly as they did with the old
// ApiError thrown by the fetch wrapper.
const baseQuery = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (!result.error) return result;

  const { error } = result;

  // A rejected session must not stay "valid" in the cache: clear it so the admin
  // guard re-checks /auth/me and redirects to login. /auth/* is excluded to avoid loops.
  const url = typeof args === "string" ? args : args?.url;
  if (error.status === 401 && !url?.startsWith("/auth/")) {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    api.dispatch(baseApi.util.resetApiState());
  }

  return {
    error: {
      status: error.status === "FETCH_ERROR" ? 0 : error.status,
      data: error.data ?? null,
      message: extractErrorMessage(error),
    },
  };
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery,
  // Serve cached data when a page is revisited instead of refetching on every
  // mount. Mutations invalidate the relevant tags, so lists still refresh when
  // something actually changes.
  refetchOnMountOrArgChange: false,
  keepUnusedDataFor: 3600,
  // Invalidate right when a mutation succeeds so the refetch that follows never
  // reads pre-mutation data from the cache.
  invalidationBehavior: "immediately",
  tagTypes: ["Auth", "Member", "Partner", "Gallery", "Enquiry", "ImportantDate", "SuperAdmin"],
  endpoints: () => ({}),
});

// API responses are sometimes wrapped as `{ data }` or `{ result }`.
export function unwrapData(response) {
  return response?.data ?? response?.result ?? response;
}

// Drops empty values so they are not sent as query-string parameters.
export function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
}
