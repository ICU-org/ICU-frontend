import { config } from "@/shared/config";

/** Путь файла с бэкенда («/uploads/…») → полный адрес на том же сервере, что API. */
export const assetUrl = (path: string) => new URL(path, config.apiUrl).toString();
