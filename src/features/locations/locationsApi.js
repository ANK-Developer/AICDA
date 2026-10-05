import { baseApi, unwrapData } from "@/services/api/baseApi";

export const locationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchCities: builder.query({
      query: (search) => ({
        url: "/locations/cities",
        params: search?.trim() ? { search: search.trim() } : undefined,
      }),
      transformResponse: (response) => {
        const result = unwrapData(response);
        return Array.isArray(result) ? result : [];
      },
    }),
  }),
});

export const { useLazySearchCitiesQuery } = locationsApi;
