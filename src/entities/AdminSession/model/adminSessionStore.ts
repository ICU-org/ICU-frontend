import { create } from "zustand";
import { loadAdminDictionary } from "@/shared/i18n";
import { clearAllDrafts, clearForeignDrafts } from "@/shared/lib";
import { checkAdminAccess, fetchCurrentAdmin, loginAdmin, logoutAdmin } from "../api/adminSessionApi";
import type { Admin, AdminSessionStatus } from "./types";

interface AdminSessionState {
  status: AdminSessionStatus;
  admin: Admin | null;
  /** Выбросило посреди работы (401), а не «ещё не входил» — форма входа это объясняет. */
  expired: boolean;
  /** Есть ли админка для этого адреса и вошёл ли админ. */
  check: () => Promise<void>;
  /** Ошибку входа бросает дальше — её показывает форма. */
  signIn: (login: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Сервер ответил 401 посреди работы — сессия истекла. */
  expire: () => void;
}

export const useAdminSession = create<AdminSessionState>((set, get) => ({
  status: "idle",
  admin: null,
  expired: false,

  check: async () => {
    if (get().status === "checking") return;
    set({ status: "checking" });
    try {
      if (!(await checkAdminAccess())) return set({ status: "denied", admin: null });
      await loadAdminDictionary();
      const admin = await fetchCurrentAdmin();
      set({ status: admin ? "authenticated" : "anonymous", admin });
    } catch {
      set({ status: "error", admin: null });
    }
  },

  signIn: async (login, password) => {
    const admin = await loginAdmin(login, password);
    clearForeignDrafts(admin.id); // на этом компьютере работал другой админ — его черновики не показываем
    set({ status: "authenticated", admin, expired: false });
  },

  signOut: async () => {
    try {
      await logoutAdmin();
    } finally {
      // даже если сервер не ответил, в этом окне админ больше не работает;
      // вышел сам — несохранённые черновики больше не нужны
      clearAllDrafts();
      set({ status: "anonymous", admin: null, expired: false });
    }
  },

  expire: () => set({ status: "anonymous", admin: null, expired: true }),
}));
