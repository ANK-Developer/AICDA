import { baseApi, unwrapData } from "@/services/api/baseApi";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardData: builder.query({
      query: () => "/dashboard",
      transformResponse: unwrapData,
      // Stats depend on these collections, so refetch only when they change.
      providesTags: ["Member", "Partner", "Enquiry", "Gallery", "ImportantDate", "SuperAdmin"],
    }),
  }),
});

export const { useGetDashboardDataQuery } = dashboardApi;
