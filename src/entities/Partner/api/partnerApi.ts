import { api } from "@/shared/api";
import type { Partner } from "../model/types";

export const listPartners = async (lang: string) =>
  (await api.get<{ items: Partner[] }>("/content/partners", { params: { lang } })).data.items;
