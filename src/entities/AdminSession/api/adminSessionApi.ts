import { api } from "@/shared/api";
import { getErrorStatus } from "@/shared/lib";
import type { Admin } from "../model/types";

/** true — адрес в списке админов; 404 — админки для этого адреса нет. */
export async function checkAdminAccess(): Promise<boolean> {
  try {
    await api.get("/admin/auth/access");
    return true;
  } catch (err) {
    if (getErrorStatus(err) === 404) return false;
    throw err;
  }
}

/** Текущий админ; null — не вошёл или сессия истекла. */
export async function fetchCurrentAdmin(): Promise<Admin | null> {
  try {
    return (await api.get<{ admin: Admin }>("/admin/auth/me")).data.admin;
  } catch (err) {
    if (getErrorStatus(err) === 401) return null;
    throw err;
  }
}

export const loginAdmin = async (login: string, password: string) =>
  (await api.post<{ admin: Admin }>("/admin/auth/login", { login, password })).data.admin;

export const logoutAdmin = () => api.post("/admin/auth/logout");
