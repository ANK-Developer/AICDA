import { baseApi, cleanParams, unwrapData } from "@/services/api/baseApi";

export const galleryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // arg: { category?, page?, limit?, search? }
    getGalleryImages: builder.query({
      query: ({ category, page, limit, search } = {}) => ({
        url: "/gallery",
        params: cleanParams({ category, page, limit, search: search?.trim() }),
      }),
      transformResponse: (response) => {
        const data = unwrapData(response);
        return {
          gallery: data.gallery || data.items || data.images || [],
          count: data.count ?? data.total ?? data.totalCount ?? 0,
        };
      },
      providesTags: ["Gallery"],
    }),

    uploadGalleryImage: builder.mutation({
      query: ({ file, category, title = "", description = "" }) => {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("category", category);
        if (title) formData.append("title", title);
        if (description) formData.append("description", description);
        return { url: "/gallery/upload", method: "POST", body: formData };
      },
      transformResponse: unwrapData,
      invalidatesTags: ["Gallery"],
    }),

    updateGalleryImage: builder.mutation({
      query: ({ id, file, category, title, description }) => {
        const formData = new FormData();
        if (file) formData.append("image", file);
        if (category) formData.append("category", category);
        if (title) formData.append("title", title);
        if (description) formData.append("description", description);
        return { url: `/gallery/${id}`, method: "PATCH", body: formData };
      },
      transformResponse: unwrapData,
      invalidatesTags: ["Gallery"],
    }),

    deleteGalleryImage: builder.mutation({
      query: (id) => ({ url: `/gallery/${id}`, method: "DELETE" }),
      transformResponse: unwrapData,
      invalidatesTags: ["Gallery"],
    }),
  }),
});

export const {
  useGetGalleryImagesQuery,
  useLazyGetGalleryImagesQuery,
  useUploadGalleryImageMutation,
  useUpdateGalleryImageMutation,
  useDeleteGalleryImageMutation,
} = galleryApi;
