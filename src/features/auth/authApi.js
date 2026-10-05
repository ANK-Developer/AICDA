import { baseApi, unwrapData } from "@/services/api/baseApi";
import { ACCESS_TOKEN_KEY } from "@/constants/storage";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: ({ email, password }) => ({
        url: "/auth/login",
        method: "POST",
        body: { email, password },
      }),
      transformResponse: (response) => {
        const data = unwrapData(response);
        const token = data?.accessToken || data?.token || data?.access_token;
        if (token) window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
        return data;
      },
      // Drop anything cached for a previous (possibly failed) session.
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(baseApi.util.resetApiState());
        } catch {
          // the component surfaces the login error
        }
      },
    }),

    logout: builder.mutation({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      transformResponse: unwrapData,
      // The token is cleared even when the request fails, like before.
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          // callers swallow logout errors
        } finally {
          window.localStorage.removeItem(ACCESS_TOKEN_KEY);
          dispatch(baseApi.util.resetApiState());
        }
      },
    }),

    getCurrentUser: builder.query({
      providesTags: ["Auth"],
      query: () => "/auth/me",
      transformResponse: (response) => {
        const data = unwrapData(response);
        return data?.user || data;
      },
    }),

    changePassword: builder.mutation({
      query: ({ email, newPassword, confirmPassword }) => ({
        url: "/auth/change-password",
        method: "POST",
        body: { email, newPassword, confirmPassword },
      }),
      transformResponse: unwrapData,
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useChangePasswordMutation,
} = authApi;
