import { api } from "@/shared/api";
import type { About, AboutData, AdminAbout } from "../model/types";

/** null — страница ещё не заполнена. */
export const getAbout = async (lang: string) =>
  (await api.get<{ about: About | null }>("/content/about", { params: { lang } })).data.about;

export const getAdminAbout = async () => (await api.get<{ about: AdminAbout | null }>("/admin/content/about")).data.about;

export const saveAbout = async (data: AboutData) =>
  (await api.put<{ about: AdminAbout | null }>("/admin/content/about", data)).data.about;
