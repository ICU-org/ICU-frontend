import axios from "axios";
import { config } from "@/shared/config";

// withCredentials — cookie сессии админа (httpOnly, только на /api/admin)
export const api = axios.create({ baseURL: config.apiUrl, withCredentials: true });

/*
 * Мок-режим подменяет транспорт целиком: вызовы, интерцепторы и разбор ошибок
 * работают без изменений, в компонентах нет ни одного `if (useMocks)`.
 * Сравнение с литералом, а не через config: Vite подставляет значение на сборке
 * и вырезает ветку вместе с динамическим импортом из продакшен-бандла.
 */
if (import.meta.env.VITE_USE_MOCKS === "true") {
  const { mockAdapter } = await import("@/shared/mocks/adapter");
  api.defaults.adapter = mockAdapter;
  console.info("Mock mode: requests do not reach the server");
}
