import { api, unwrapData } from "./api";

export async function getDashboardData() {
  return unwrapData(await api("/dashboard"));
}
