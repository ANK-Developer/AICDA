import { baseApi, cleanParams, unwrapData } from "@/services/api/baseApi";

function buildMemberFormData(member) {
  const formData = new FormData();
  const fields = {
    memberId: member.memberId,
    memberName: member.memberName,
    fatherName: member.fatherName,
    dateOfBirth: member.dateOfBirth,
    residentialAddress: member.residentialAddress,
    mobile: member.mobile,
    residentialTelephone: member.residentialTelephone,
    panCardNo: member.panCardNo,
    designation: member.designation,
    companyName: member.companyName,
    companyAddress: member.companyAddress,
    companyTelephone: member.companyTelephone,
    packetNo: member.packetNo,
    dateOfJoining: member.dateOfJoining,
    aadharNo: member.aadharNo,
    state: member.state,
    district: member.district,
    city: member.city,
    validityTo: member.validityTo,
    amount: member.amount,
    note: member.note,
  };

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") formData.append(key, value);
  });

  if (member.photo instanceof File) formData.append("photo", member.photo);

  return formData;
}

export const membersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMembers: builder.query({
      query: (params = {}) => ({
        url: "/members",
        params: cleanParams({
          search: params.search?.trim(),
          status: params.status !== "all" ? params.status : undefined,
          page: params.page,
          limit: params.limit,
        }),
      }),
      transformResponse: (response, _meta, params = {}) => {
        const members = unwrapData(response);
        return {
          members: Array.isArray(members) ? members : members?.members || members?.items || [],
          pagination: response?.pagination || {
            page: params.page || 1,
            limit: params.limit || 10,
            total: Array.isArray(members) ? members.length : 0,
            totalPages: 1,
          },
          stats: response?.stats || null,
        };
      },
      providesTags: ["Member"],
    }),

    // The backend includes partners + renewal history on every GET /members/:id,
    // so the details page uses this same endpoint.
    getMemberDetails: builder.query({
      query: (id) => `/members/${id}`,
      transformResponse: unwrapData,
      providesTags: ["Member"],
    }),

    getPublicMembers: builder.query({
      providesTags: ["Member"],
      query: () => "/members/public",
      transformResponse: (response) => {
        const result = unwrapData(response);
        return Array.isArray(result) ? result : result?.members || result?.items || [];
      },
    }),

    // Single-record public lookup — no auth required. Backs the shareable
    // "public profile" link generated from the admin directory table.
    getPublicMember: builder.query({
      providesTags: ["Member"],
      query: (id) => `/members/public/${id}`,
      transformResponse: unwrapData,
    }),

    createMember: builder.mutation({
      query: (member) => ({ url: "/members", method: "POST", body: buildMemberFormData(member) }),
      transformResponse: unwrapData,
      invalidatesTags: ["Member"],
    }),

    updateMember: builder.mutation({
      query: ({ id, member }) => ({
        url: `/members/${id}`,
        method: "PUT",
        body: buildMemberFormData(member),
      }),
      transformResponse: unwrapData,
      invalidatesTags: ["Member"],
    }),

    toggleMemberStatus: builder.mutation({
      query: (id) => ({ url: `/members/${id}/status`, method: "PATCH" }),
      transformResponse: unwrapData,
      invalidatesTags: ["Member"],
    }),

    renewMember: builder.mutation({
      query: ({ id, validityTo, amount, note }) => ({
        url: `/members/${id}/renew`,
        method: "PATCH",
        body: { validityTo, amount, note },
      }),
      transformResponse: unwrapData,
      invalidatesTags: ["Member"],
    }),

    deleteMember: builder.mutation({
      query: (id) => ({ url: `/members/${id}`, method: "DELETE" }),
      transformResponse: unwrapData,
      invalidatesTags: ["Member"],
    }),
  }),
});

export const {
  useGetMembersQuery,
  useLazyGetMembersQuery,
  useGetMemberDetailsQuery,
  useLazyGetMemberDetailsQuery,
  useGetPublicMembersQuery,
  useGetPublicMemberQuery,
  useCreateMemberMutation,
  useUpdateMemberMutation,
  useToggleMemberStatusMutation,
  useRenewMemberMutation,
  useDeleteMemberMutation,
} = membersApi;
