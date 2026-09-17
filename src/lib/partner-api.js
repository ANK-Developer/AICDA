import { api, unwrapData } from "./api";

function buildPartnerFormData(partner) {
  const formData = new FormData();
  const fields = {
    memberId: partner.memberId,
    partnerName: partner.partnerName,
    fatherName: partner.fatherName,
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
    city: partner.city,
    validityTo: partner.validityTo,
    amount: partner.amount,
    note: partner.note,
  };

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") formData.append(key, value);
  });

  if (partner.photo instanceof File) formData.append("photo", partner.photo);

  return formData;
}

export async function getPartners(params = {}) {
  const query = new URLSearchParams();
  if (params.search?.trim()) query.append("search", params.search.trim());
  if (params.status && params.status !== "all") query.append("status", params.status);
  if (params.limit) query.append("limit", String(params.limit));
  if (params.page) query.append("page", String(params.page));

  const result = unwrapData(await api(`/partners?${query.toString()}`));
  return Array.isArray(result) ? result : result?.partners || result?.items || [];
}

export async function getPartner(id) {
  return unwrapData(await api(`/partners/${id}`));
}

// Same endpoint as getPartner — the backend now includes the linked member
// + renewal history on every GET /partners/:id, so the details page reuses it.
export async function getPartnerDetails(id) {
  return unwrapData(await api(`/partners/${id}`));
}

export async function getPublicPartners() {
  const result = unwrapData(await api("/partners/public"));
  return Array.isArray(result) ? result : result?.partners || result?.items || [];
}

// Single-record public lookup — no auth required. Backs the shareable
// "public profile" link generated from the admin partner table.
export async function getPublicPartner(id) {
  return unwrapData(await api(`/partners/public/${id}`));
}

export async function createPartner(partner) {
  return unwrapData(
    await api("/partners", {
      method: "POST",
      body: buildPartnerFormData(partner),
    }),
  );
}

export async function updatePartner(id, partner) {
  return unwrapData(
    await api(`/partners/${id}`, {
      method: "PATCH",
      body: buildPartnerFormData(partner),
    }),
  );
}

export async function togglePartnerStatus(id) {
  return unwrapData(await api(`/partners/${id}/status`, { method: "PATCH" }));
}

export async function renewPartner(id, { validityTo, amount, note }) {
  return unwrapData(
    await api(`/partners/${id}/renew`, {
      method: "PATCH",
      body: JSON.stringify({ validityTo, amount, note }),
    }),
  );
}

export async function deletePartner(id) {
  return unwrapData(await api(`/partners/${id}`, { method: "DELETE" }));
}
