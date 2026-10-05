import { baseApi, cleanParams, unwrapData } from "@/services/api/baseApi";

export const enquiriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    submitEnquiry: builder.mutation({
      query: (payload) => ({ url: "/enquiries", method: "POST", body: payload }),
      transformResponse: unwrapData,
      invalidatesTags: ["Enquiry"],
    }),

    getEnquiries: builder.query({
      query: (options = {}) => ({
        url: "/enquiries",
        params: cleanParams({
          page: options.page,
          limit: options.limit,
          search: options.search?.trim(),
          status: options.status !== "all" ? options.status : undefined,
        }),
      }),
      transformResponse: (response) => {
        const data = unwrapData(response);
        return {
          enquiries: data.enquiries || data.items || data.data || [],
          count: data.count ?? data.total ?? data.totalCount ?? 0,
          stats: data.stats || null,
          pagination: data.pagination || null,
        };
      },
      providesTags: ["Enquiry"],
    }),

    updateEnquiryStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/enquiries/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: unwrapData,
      invalidatesTags: ["Enquiry"],
    }),
  }),
});

export const {
  useSubmitEnquiryMutation,
  useGetEnquiriesQuery,
  useLazyGetEnquiriesQuery,
  useUpdateEnquiryStatusMutation,
} = enquiriesApi;
