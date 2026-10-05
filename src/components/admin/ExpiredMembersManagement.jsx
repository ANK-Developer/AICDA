import { useLazyGetMembersQuery } from "@/features/members/membersApi";
import { useLazyCall, useMutate } from "@/services/api/useApiCall";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Search } from "lucide-react";

function isExpired(validityTo) {
  if (!validityTo) return false;
  const expiry = new Date(validityTo);
  if (Number.isNaN(expiry.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return expiry < today;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
}

export function ExpiredMembersManagement() {
  const getMembers = useLazyCall(useLazyGetMembersQuery);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getMembers()
      .then((data) => mounted && setMembers(data))
      .catch(
        (requestError) => mounted && setError(requestError.message || "Could not load members."),
      )
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [getMembers]);

  const expiredMembers = useMemo(
    () => members.filter((member) => isExpired(member.validityTo)),
    [members],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return expiredMembers;
    return expiredMembers.filter((member) =>
      [member.memberId, member.memberName, member.companyName, member.mobile, member.designation]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [expiredMembers, search]);

  return (
    <section className="space-y-2">
      <div className="flex flex-col gap-1 rounded-[3px] border border-red-200 bg-red-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-1.5 text-[13px] font-bold text-red-800">
          <AlertTriangle className="h-4 w-4" /> Expired Members :{" "}
          <span className="text-slate-700">{expiredMembers.length}</span>
        </p>
      </div>

      <div className="rounded-[3px] border border-slate-300 bg-white p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold">Expired Members</h2>
          <label className="flex items-center gap-2 text-[13px] text-slate-600">
            Search:
            <span className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-full rounded-[3px] border border-slate-300 py-1 pl-7 pr-2 text-[13px] sm:w-56"
              />
            </span>
          </label>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-[3px] bg-red-50 px-3 py-2 text-[13px] text-red-700"
          >
            {error}
          </p>
        )}

        {loading ? (
          <p className="mt-4 py-10 text-center text-[13px] text-slate-500">Loading members…</p>
        ) : filtered.length === 0 ? (
          <div className="mt-3 flex min-h-48 flex-col items-center justify-center rounded-[3px] border border-dashed border-slate-300">
            <AlertTriangle className="h-9 w-9 text-slate-300" />
            <p className="mt-3 text-[13px] font-semibold text-slate-500">
              No expired members found
            </p>
          </div>
        ) : (
          <>
            <div className="mt-3 space-y-2 md:hidden">
              {filtered.map((member) => (
                <div
                  key={member.id}
                  className="rounded-[3px] border border-red-200 bg-red-50/40 p-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold">{member.memberName}</p>
                      <p className="text-xs text-slate-500">ID: {member.memberId}</p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-red-700">
                      {formatDate(member.validityTo)}
                    </span>
                  </div>
                  <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    <div>
                      <dt className="text-slate-400">Company</dt>
                      <dd className="truncate text-slate-600">{member.companyName || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Mobile</dt>
                      <dd className="truncate text-slate-600">{member.mobile || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Designation</dt>
                      <dd className="truncate text-slate-600">{member.designation || "—"}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>

            <div className="mt-3 hidden overflow-x-auto scrollbar-hide rounded-[3px] border border-slate-300 md:block">
              <table className="w-full min-w-175 text-left text-[13px]">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-2.5 py-2">Member ID</th>
                    <th className="px-2.5 py-2">Name</th>
                    <th className="px-2.5 py-2">Company</th>
                    <th className="px-2.5 py-2">Mobile</th>
                    <th className="px-2.5 py-2">Designation</th>
                    <th className="px-2.5 py-2">Validity To</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((member, index) => (
                    <tr
                      key={member.id}
                      className={`border-t border-slate-200 ${index % 2 === 0 ? "bg-red-50/60" : "bg-white"}`}
                    >
                      <td className="px-2.5 py-2 font-medium">{member.memberId}</td>
                      <td className="px-2.5 py-2">{member.memberName}</td>
                      <td className="px-2.5 py-2 text-slate-600">{member.companyName || "—"}</td>
                      <td className="px-2.5 py-2 text-slate-600">{member.mobile || "—"}</td>
                      <td className="px-2.5 py-2 text-slate-600">{member.designation || "—"}</td>
                      <td className="px-2.5 py-2 font-semibold text-red-700">
                        {formatDate(member.validityTo)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
