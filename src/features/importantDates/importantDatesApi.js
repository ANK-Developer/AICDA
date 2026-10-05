import { baseApi, cleanParams } from "@/services/api/baseApi";

// Important dates are derived by the backend from the dateOfBirth / specialDates
// on every member and partner — there is nothing to create or edit here.
export const importantDatesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getImportantDates: builder.query({
      query: (params = {}) => ({
        url: "/important-dates",
        params: cleanParams({
          occasion: params.occasion,
          type: params.type !== "all" ? params.type : undefined,
          status: params.status !== "all" ? params.status : undefined,
          period: params.period,
          search: params.search?.trim(),
          page: params.page,
          limit: params.limit,
        }),
      }),
      transformResponse: (response) => ({
        items: Array.isArray(response?.data) ? response.data : [],
        counts: response?.counts || { birthday: 0, special: 0 },
        pagination: response?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
      }),
      providesTags: ["ImportantDate", "Member", "Partner"],
    }),
  }),
});

export const { useGetImportantDatesQuery, useLazyGetImportantDatesQuery } = importantDatesApi;
