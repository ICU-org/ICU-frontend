import type { AxiosAdapter, AxiosRequestConfig, AxiosResponse } from "axios";
import { TRANSLATION_KEYS } from "@/shared/i18n/model/keys.generated";
import * as state from "./state";

// Типы из entities не импортируются: shared не зависит от слоёв выше.

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const ok = <T>(config: AxiosRequestConfig, data: T, status = 200): AxiosResponse<T> => ({
  data, status, statusText: "OK", headers: {}, config: config as never,
});

// Ошибка в том же конверте, что у сервера.
const fail = (config: AxiosRequestConfig, status: number, code: string, message: string) =>
  Promise.reject(
    Object.assign(new Error(message), {
      isAxiosError: true,
      config,
      response: { status, data: { error: { code, message } }, headers: {}, config },
    })
  );

const body = (config: AxiosRequestConfig): Record<string, unknown> => {
  try {
    return typeof config.data === "string" ? JSON.parse(config.data) : (config.data ?? {});
  } catch {
    return {};
  }
};

type Handler = (config: AxiosRequestConfig, params: Record<string, string>) => Promise<AxiosResponse>;

/*
 * Словари живут на бэкенде — в мок-режиме их нет. Вместо текста показывается
 * сам ключ: видно, где какой текст, и не нужно дублировать словари здесь.
 */
const keyDictionary = () => {
  const messages: Record<string, Record<string, string>> = {};
  for (const key of TRANSLATION_KEYS) {
    const [section, name] = key.split(".");
    (messages[section] ??= {})[name] = key;
  }
  return { locale: "keys", defaultLocale: "keys", locales: [{ code: "keys", name: "Keys" }], messages };
};

const routes: Array<[method: string, pattern: string, handler: Handler]> = [
  ["get", "/i18n", async (c) => ok(c, keyDictionary())],
  ["get", "/content/partners", async (c) => ok(c, { items: state.partners })],
  // «О нас» не заполнено — страница показывает заглушку
  ["get", "/content/about", async (c) => ok(c, { about: null })],
  // Те же правила, что у бэкенда: строка, 3–2000 символов после обрезки.
  ["post", "/feedback", async (c) => {
    const message = body(c).message;
    const text = typeof message === "string" ? message.trim() : "";
    if (text.length < 3 || text.length > 2000) {
      return fail(c, 400, "VALIDATION_FAILED", "Check the form fields");
    }
    const record = { id: crypto.randomUUID(), message: text, createdAt: new Date().toISOString() };
    state.feedback.push(record);
    return ok(c, { id: record.id, createdAt: record.createdAt }, 201);
  }],
];

const match = (pattern: string, url: string) => {
  const names: string[] = [];
  const re = new RegExp("^" + pattern.replace(/:(\w+)/g, (_, n) => (names.push(n), "([^/]+)")) + "$");
  const m = url.match(re);
  return m ? Object.fromEntries(names.map((n, i) => [n, m[i + 1]])) : null;
};

export const mockAdapter: AxiosAdapter = async (config) => {
  await delay(250);
  const url = (config.url ?? "").split("?")[0];
  const method = (config.method ?? "get").toLowerCase();

  for (const [m, pattern, handler] of routes) {
    const params = m === method ? match(pattern, url) : null;
    if (params) return handler(config, params);
  }
  return fail(config, 404, "NOT_FOUND", `Mock route not found: ${method.toUpperCase()} ${url}`);
};
