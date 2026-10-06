import { baseApi, cleanParams, unwrapData } from "@/services/api/baseApi";

export const galleryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // arg: { category?, page?, limit?, search?, admin? }
    // admin: true lists hidden (blocked) items too — used by the Media Library.
    getGalleryImages: builder.query({
      query: ({ category, page, limit, search, admin } = {}) => ({
        url: admin ? "/gallery/admin" : "/gallery",
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
      query: ({ file, videoUrl, category, title = "", description = "", resourceType }) => {
        const formData = new FormData();
        if (file) formData.append("image", file);
        if (videoUrl) formData.append("videoUrl", videoUrl);
        if (resourceType) formData.append("resourceType", resourceType);
        formData.append("category", category);
        if (title) formData.append("title", title);
        if (description) formData.append("description", description);
        return { url: "/gallery/upload", method: "POST", body: formData };
      },
      transformResponse: unwrapData,
      invalidatesTags: ["Gallery"],
    }),

    updateGalleryImage: builder.mutation({
      query: ({ id, file, videoUrl, category, title, description }) => {
        const formData = new FormData();
        if (file) formData.append("image", file);
        if (videoUrl) formData.append("videoUrl", videoUrl);
        if (category) formData.append("category", category);
        if (title) formData.append("title", title);
        if (description) formData.append("description", description);
        return { url: `/gallery/${id}`, method: "PATCH", body: formData };
      },
      transformResponse: unwrapData,
      invalidatesTags: ["Gallery"],
    }),

    // Block (isActive: false) hides the item on the public site; unblock shows it again.
    setGalleryVisibility: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/gallery/${id}/visibility`,
        method: "PATCH",
        body: { isActive },
      }),
      transformResponse: unwrapData,
      invalidatesTags: ["Gallery"],
    }),

    // arg: { section, ids } — ids of that section's banners in the wanted order.
    reorderBanners: builder.mutation({
      query: ({ section, ids }) => ({
        url: "/gallery/banners/reorder",
        method: "PATCH",
        body: { section, ids },
      }),
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
  useSetGalleryVisibilityMutation,
  useReorderBannersMutation,
  useDeleteGalleryImageMutation,
} = galleryApi;
