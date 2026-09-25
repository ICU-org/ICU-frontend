#!/usr/bin/env node
/*
 * Ключи переводов для проверки компилятором. Словари живут на бэкенде
 * (backend/src/modules/i18n/dictionaries); скрипт берёт публичный и служебный
 * словари с запущенного бэкенда и пишет список ключей в
 * src/shared/i18n/model/keys.generated.ts.
 * Запуск: npm run i18n:keys — после каждой правки словарей на бэкенде.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "src/shared/i18n/model/keys.generated.ts");

// VITE_API_URL: из окружения, иначе из .env, иначе по умолчанию
const fromEnvFile = () => {
  try {
    const line = fs.readFileSync(path.join(ROOT, ".env"), "utf8").split("\n").find((l) => l.startsWith("VITE_API_URL="));
    return line?.slice("VITE_API_URL=".length).trim().replace(/^["']|["']$/g, "");
  } catch {
    return undefined;
  }
};
const API = process.env.VITE_API_URL || fromEnvFile() || "http://localhost:5002/api";

(async () => {
  const load = async (path, hint) => {
    try {
      const res = await fetch(`${API}${path}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()).messages;
    } catch (err) {
      console.error(`Не удалось получить ${API}${path} — ${hint} (${err.message})`);
      process.exit(1);
    }
  };
  const messages = {
    ...(await load("/i18n", "запущен ли бэкенд?")),
    // служебный словарь отдаётся только адресам из ADMIN_ALLOWED_IPS
    ...(await load("/admin/i18n", "есть ли этот адрес в ADMIN_ALLOWED_IPS бэкенда?")),
  };

  // набор ключей одинаков во всех языках — это проверяет компилятор бэкенда
  const keys = Object.entries(messages)
    .flatMap(([section, entries]) => Object.keys(entries).map((key) => `${section}.${key}`))
    .sort();

  const content =
    "// Сгенерировано `npm run i18n:keys` из словарей бэкенда (GET /api/i18n, /api/admin/i18n). Не править руками.\n" +
    "export const TRANSLATION_KEYS = [\n" +
    keys.map((k) => `  ${JSON.stringify(k)},`).join("\n") +
    "\n] as const;\n\n" +
    "export type TranslationKey = (typeof TRANSLATION_KEYS)[number];\n";

  fs.writeFileSync(OUT, content);
  console.log(`Ключей переводов: ${keys.length} → ${path.relative(ROOT, OUT)}`);
})();
