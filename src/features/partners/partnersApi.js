import { baseApi, cleanParams, unwrapData } from "@/services/api/baseApi";

// Sent as JSON text inside the multipart body; "[]" clears every date.
const serializeSpecialDates = (list) =>
  Array.isArray(list)
    ? JSON.stringify(
        list.filter((entry) => entry.date).map(({ id, date, note }) => ({ id, date, note })),
      )
    : undefined;

function buildPartnerFormData(partner) {
  const formData = new FormData();
  const fields = {
    memberId: partner.memberId,
    partnerName: partner.partnerName,
    fatherName: partner.fatherName,
    dateOfBirth: partner.dateOfBirth,
    residentialAddress: partner.residentialAddress,
    mobile: partner.mobile,
    residentialTelephone: partner.residentialTelephone,
    panCardNo: partner.panCardNo,
    aadharNo: partner.aadharNo,
    designation: partner.designation,
    companyName: partner.companyName,
    companyAddress: partner.companyAddress,
    companyTelephone: partner.companyTelephone,
    packetNo: partner.packetNo,
    dateOfJoining: partner.dateOfJoining,
    state: partner.state,
    district: partner.district,
    city: partner.city,
    validityTo: partner.validityTo,
    amount: partner.amount,
    note: partner.note,
    specialDates: serializeSpecialDates(partner.specialDates),
  };

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") formData.append(key, value);
  });

  if (partner.photo instanceof File) formData.append("photo", partner.photo);

  return formData;
}

const toPartnerList = (response) => {
  const result = unwrapData(response);
  return Array.isArray(result) ? result : result?.partners || result?.items || [];
};

export const partnersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPartners: builder.query({
      query: (params = {}) => ({
        url: "/partners",
        params: cleanParams({
          search: params.search?.trim(),
          status: params.status !== "all" ? params.status : undefined,
          limit: params.limit,
          page: params.page,
        }),
      }),
      transformResponse: toPartnerList,
      providesTags: ["Partner"],
    }),

    // The backend includes the linked member + renewal history on every
    // GET /partners/:id, so the details page uses this same endpoint.
    getPartnerDetails: builder.query({
      query: (id) => `/partners/${id}`,
      transformResponse: unwrapData,
      providesTags: ["Partner"],
    }),

    getPublicPartners: builder.query({
      providesTags: ["Partner"],
      query: () => "/partners/public",
      transformResponse: toPartnerList,
    }),

    // Single-record public lookup — no auth required. Backs the shareable
    // "public profile" link generated from the admin partner table.
    getPublicPartner: builder.query({
      providesTags: ["Partner"],
      query: (id) => `/partners/public/${id}`,
      transformResponse: unwrapData,
    }),

    createPartner: builder.mutation({
      query: (partner) => ({
        url: "/partners",
        method: "POST",
        body: buildPartnerFormData(partner),
      }),
      transformResponse: unwrapData,
      invalidatesTags: ["Partner"],
    }),

    updatePartner: builder.mutation({
      query: ({ id, partner }) => ({
        url: `/partners/${id}`,
        method: "PATCH",
        body: buildPartnerFormData(partner),
      }),
      transformResponse: unwrapData,
      invalidatesTags: ["Partner"],
    }),

    togglePartnerStatus: builder.mutation({
      query: (id) => ({ url: `/partners/${id}/status`, method: "PATCH" }),
      transformResponse: unwrapData,
      invalidatesTags: ["Partner"],
    }),

    renewPartner: builder.mutation({
      query: ({ id, validityTo, amount, note }) => ({
        url: `/partners/${id}/renew`,
        method: "PATCH",
        body: { validityTo, amount, note },
      }),
      transformResponse: unwrapData,
      invalidatesTags: ["Partner"],
    }),

    addPartnerSpecialDate: builder.mutation({
      query: ({ id, date, note }) => ({
        url: `/partners/${id}/special-dates`,
        method: "POST",
        body: { date, note },
      }),
      transformResponse: unwrapData,
      invalidatesTags: ["Partner"],
    }),

    updatePartnerSpecialDate: builder.mutation({
      query: ({ id, dateId, date, note }) => ({
        url: `/partners/${id}/special-dates/${dateId}`,
        method: "PUT",
        body: { date, note },
      }),
      transformResponse: unwrapData,
      invalidatesTags: ["Partner"],
    }),

    deletePartnerSpecialDate: builder.mutation({
      query: ({ id, dateId }) => ({
        url: `/partners/${id}/special-dates/${dateId}`,
        method: "DELETE",
      }),
      transformResponse: unwrapData,
      invalidatesTags: ["Partner"],
    }),

    deletePartner: builder.mutation({
      query: (id) => ({ url: `/partners/${id}`, method: "DELETE" }),
      transformResponse: unwrapData,
      invalidatesTags: ["Partner"],
    }),
  }),
});

export const {
  useGetPartnersQuery,
  useLazyGetPartnersQuery,
  useGetPartnerDetailsQuery,
  useLazyGetPartnerDetailsQuery,
  useGetPublicPartnersQuery,
  useGetPublicPartnerQuery,
  useCreatePartnerMutation,
  useUpdatePartnerMutation,
  useTogglePartnerStatusMutation,
  useRenewPartnerMutation,
  useDeletePartnerMutation,
  useAddPartnerSpecialDateMutation,
  useUpdatePartnerSpecialDateMutation,
  useDeletePartnerSpecialDateMutation,
} = partnersApi;
