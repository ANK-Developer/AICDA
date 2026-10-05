import { baseApi, cleanParams, unwrapData } from "@/services/api/baseApi";

export const locationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchCities: builder.query({
      query: ({ search, state, district } = {}) => ({
        url: "/locations/cities",
        params: cleanParams({
          search: search?.trim(),
          state: state?.trim(),
          district: district?.trim(),
        }),
      }),
      transformResponse: (response) => {
        const result = unwrapData(response);
        return Array.isArray(result) ? result : [];
      },
    }),
  }),
});

export const { useLazySearchCitiesQuery } = locationsApi;
