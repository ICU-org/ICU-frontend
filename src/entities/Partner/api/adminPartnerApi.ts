import { api } from "@/shared/api";
import type { AdminPartner, PartnerInput } from "../model/types";

const BASE = "/admin/content/partners";

export const listAdminPartners = async () => (await api.get<{ items: AdminPartner[] }>(BASE)).data.items;

export const createPartner = async (input: PartnerInput) => (await api.post<AdminPartner>(BASE, input)).data;

export const updatePartner = async (id: string, input: PartnerInput) =>
  (await api.put<AdminPartner>(`${BASE}/${id}`, input)).data;

export const deletePartner = async (id: string) => {
  await api.delete(`${BASE}/${id}`);
};

/** PNG, JPEG или WebP до 1 МБ — проверяет бэкенд по содержимому. */
export async function uploadPartnerLogo(id: string, file: File) {
  const form = new FormData();
  form.append("logo", file);
  return (await api.put<AdminPartner>(`${BASE}/${id}/logo`, form)).data;
}

export const removePartnerLogo = async (id: string) => (await api.delete<AdminPartner>(`${BASE}/${id}/logo`)).data;
