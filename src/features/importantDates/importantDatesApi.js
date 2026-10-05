import { baseApi, unwrapData } from "@/services/api/baseApi";

function buildImportantDateFormData(importantDate) {
  const formData = new FormData();
  const fields = {
    title: importantDate.title,
    date: importantDate.date,
    description: importantDate.description,
  };

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") formData.append(key, value);
  });

  if (importantDate.image instanceof File) formData.append("image", importantDate.image);

  return formData;
}

const toArray = (response) => {
  const list = unwrapData(response);
  return Array.isArray(list) ? list : [];
};

export const importantDatesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getImportantDates: builder.query({
      query: () => "/important-dates",
      transformResponse: toArray,
      providesTags: ["ImportantDate"],
    }),

    createImportantDate: builder.mutation({
      query: (importantDate) => ({
        url: "/important-dates",
        method: "POST",
        body: buildImportantDateFormData(importantDate),
      }),
      transformResponse: unwrapData,
      invalidatesTags: ["ImportantDate"],
    }),

    updateImportantDate: builder.mutation({
      query: ({ id, importantDate }) => ({
        url: `/important-dates/${id}`,
        method: "PUT",
        body: buildImportantDateFormData(importantDate),
      }),
      transformResponse: unwrapData,
      invalidatesTags: ["ImportantDate"],
    }),

    deleteImportantDate: builder.mutation({
      query: (id) => ({ url: `/important-dates/${id}`, method: "DELETE" }),
      transformResponse: unwrapData,
      invalidatesTags: ["ImportantDate"],
    }),

    getUpcomingBirthdays: builder.query({
      providesTags: ["ImportantDate", "Member"],
      query: () => "/important-dates/birthdays/upcoming",
      transformResponse: toArray,
    }),
  }),
});

export const {
  useGetImportantDatesQuery,
  useLazyGetImportantDatesQuery,
  useCreateImportantDateMutation,
  useUpdateImportantDateMutation,
  useDeleteImportantDateMutation,
  useGetUpcomingBirthdaysQuery,
  useLazyGetUpcomingBirthdaysQuery,
} = importantDatesApi;
