import { baseApi, unwrapData } from "@/services/api/baseApi";

export const superAdminsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSuperAdmins: builder.query({
      query: () => "/super-admin",
      transformResponse: (response) => {
        const result = unwrapData(response);
        return Array.isArray(result) ? result : result?.admins || result?.items || [];
      },
      providesTags: ["SuperAdmin"],
    }),

    createSuperAdmin: builder.mutation({
      query: (payload) => ({ url: "/super-admin/create", method: "POST", body: payload }),
      transformResponse: unwrapData,
      invalidatesTags: ["SuperAdmin"],
    }),

    updateSuperAdminStatus: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/super-admin/${id}/status`,
        method: "PATCH",
        body: payload,
      }),
      transformResponse: unwrapData,
      invalidatesTags: ["SuperAdmin"],
    }),

    resetSuperAdminPassword: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/super-admin/${id}/reset-password`,
        method: "POST",
        body: payload,
      }),
      transformResponse: unwrapData,
    }),

    // A mutation (not a query) so the revealed password is never kept in the RTK cache.
    revealSuperAdminPassword: builder.mutation({
      query: (id) => ({ url: `/super-admin/${id}/reveal-password`, method: "POST" }),
      transformResponse: unwrapData,
    }),
  }),
});

export const {
  useGetSuperAdminsQuery,
  useLazyGetSuperAdminsQuery,
  useCreateSuperAdminMutation,
  useUpdateSuperAdminStatusMutation,
  useResetSuperAdminPasswordMutation,
  useRevealSuperAdminPasswordMutation,
} = superAdminsApi;
