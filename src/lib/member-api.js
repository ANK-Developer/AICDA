import { api, unwrapData } from "./api";

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

export async function getMembers(params = {}) {
  const query = new URLSearchParams();
  if (params.search?.trim()) query.append("search", params.search.trim());
  if (params.status && params.status !== "all") query.append("status", params.status);
  if (params.page) query.append("page", String(params.page));
  if (params.limit) query.append("limit", String(params.limit));

  const response = await api(`/members?${query.toString()}`);
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
}

export async function getMember(id) {
  return unwrapData(await api(`/members/${id}`));
}

// Same endpoint as getMember — the backend includes partners + renewal
// history on every GET /members/:id, so the details page reuses it.
export async function getMemberDetails(id) {
  return unwrapData(await api(`/members/${id}`));
}

export async function getPublicMembers() {
  const result = unwrapData(await api("/members/public"));
  return Array.isArray(result) ? result : result?.members || result?.items || [];
}

// Single-record public lookup — no auth required. Backs the shareable
// "public profile" link generated from the admin directory table.
export async function getPublicMember(id) {
  return unwrapData(await api(`/members/public/${id}`));
}

export async function createMember(member) {
  return unwrapData(
    await api("/members", {
      method: "POST",
      body: buildMemberFormData(member),
    }),
  );
}

export async function updateMember(id, member) {
  return unwrapData(
    await api(`/members/${id}`, {
      method: "PUT",
      body: buildMemberFormData(member),
    }),
  );
}

export async function toggleMemberStatus(id) {
  return unwrapData(await api(`/members/${id}/status`, { method: "PATCH" }));
}

export async function renewMember(id, { validityTo, amount, note }) {
  return unwrapData(
    await api(`/members/${id}/renew`, {
      method: "PATCH",
      body: JSON.stringify({ validityTo, amount, note }),
    }),
  );
}

export async function deleteMember(id) {
  return unwrapData(await api(`/members/${id}`, { method: "DELETE" }));
}
