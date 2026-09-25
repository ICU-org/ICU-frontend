#!/usr/bin/env node
/*
 * Массовая проверка интерфейса в настоящем Chrome (headless, через playwright-core —
 * свой браузер не скачивается, берётся установленный Google Chrome).
 *
 * Для каждой страницы × размера экрана × темы × языка:
 *   - горизонтальная прокрутка страницы и элементы, вылезающие за экран;
 *   - ключи переводов вместо текста («admin.save» на экране);
 *   - маленькие цели касания (< 44 px) у кнопок, ссылок, полей;
 *   - поля ввода без подписи, поля с текстом < 16 px (iOS приближает), картинки без alt;
 *   - ошибки в консоли, упавшие запросы (4xx/5xx, обрывы);
 *   - скриншот всей страницы.
 *
 * Запуск (сайт и бэкенд должны работать):
 *   npm run ui:audit -- --pages /,/transport --viewports phone,desktop --themes light,dark --langs hy,ru,en
 *   npm run ui:audit -- --api-down            — все запросы к /api обрываются: проверка экранов ошибок
 *   npm run ui:audit -- --admin <login>:<pw>  — сначала вход в админку (для страниц /admin…)
 *   --base http://localhost:5174 (сайт), --api http://localhost:5002 (бэкенд), --out <папка>
 * Вывод — JSON в stdout (только найденное), скриншоты — в --out (по умолчанию временная папка).
 */
import { mkdtempSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { chromium } from "playwright-core";

const VIEWPORTS = {
  phone: { width: 375, height: 812, isMobile: true, hasTouch: true },
  tablet: { width: 768, height: 1024, isMobile: true, hasTouch: true },
  // вертикальный сенсорный экран — только по запросу: жители заходят со своих устройств
  kiosk: { width: 1080, height: 1920, isMobile: false, hasTouch: true },
  desktop: { width: 1366, height: 768, isMobile: false, hasTouch: false },
};
const PUBLIC_PAGES = ["/", "/transport", "/about", "/partners"];
const KEY_SECTIONS = "common|nav|pages|feedback|errors|validation|partners|about|admin";
const MIN_TARGET = 44;

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, arg, i, all) => {
    if (arg.startsWith("--")) acc.push([arg.slice(2), all[i + 1]?.startsWith("--") || all[i + 1] === undefined ? "true" : all[i + 1]]);
    return acc;
  }, [])
);
const list = (value, fallback) => (value && value !== "true" ? value.split(",").map((s) => s.trim()).filter(Boolean) : fallback);

const base = (args.base ?? "http://localhost:5174").replace(/\/$/, "");
const api = (args.api ?? "http://localhost:5002").replace(/\/$/, "");
const pages = list(args.pages, PUBLIC_PAGES);
const viewports = list(args.viewports, ["phone", "desktop"]);
const themes = list(args.themes, ["light"]);
const langs = list(args.langs, ["hy"]);
const apiDown = args["api-down"] === "true";
const admin = args.admin && args.admin !== "true" ? args.admin : null;
const out = args.out ?? mkdtempSync(path.join(tmpdir(), "icu-ui-audit-"));
mkdirSync(out, { recursive: true });

for (const v of viewports) if (!VIEWPORTS[v]) throw new Error(`Unknown viewport "${v}": ${Object.keys(VIEWPORTS).join(", ")}`);

/** Выполняется в странице: собирает проблемы по DOM. */
function inspect({ keyPattern, minTarget }) {
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
  };
  const describe = (el) => {
    const text = (el.getAttribute("aria-label") || el.textContent || el.getAttribute("placeholder") || "").trim().replace(/\s+/g, " ");
    return `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}${text ? ` «${text.slice(0, 40)}»` : ""}`;
  };
  const vw = document.documentElement.clientWidth;
  const found = {};

  const overflowPx = document.documentElement.scrollWidth - vw;
  if (overflowPx > 1) {
    found.horizontalScroll = {
      overflowPx,
      elements: [...document.querySelectorAll("body *")]
        .filter((el) => visible(el) && el.getBoundingClientRect().right > vw + 1)
        .slice(0, 8)
        .map(describe),
    };
  }

  const keyRe = new RegExp(`\\b(?:${keyPattern})\\.[A-Za-z]+\\b`);
  const rawKeys = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const text = walker.currentNode.textContent.trim();
    if (text && keyRe.test(text) && visible(walker.currentNode.parentElement)) rawKeys.add(text.slice(0, 60));
  }
  for (const el of document.querySelectorAll("[placeholder],[aria-label],[title]")) {
    for (const attr of ["placeholder", "aria-label", "title"]) {
      const value = el.getAttribute(attr);
      if (value && keyRe.test(value)) rawKeys.add(`${attr}=${value}`);
    }
  }
  if (rawKeys.size) found.rawTranslationKeys = [...rawKeys].slice(0, 15);

  const targets = [...document.querySelectorAll("a[href],button,input:not([type=hidden]),select,textarea,[role=button]")]
    .filter(visible)
    .filter((el) => !(el.matches("input[type=checkbox],input[type=radio]") && el.closest("label")))
    .filter((el) => {
      const r = el.getBoundingClientRect();
      return r.height < minTarget || (r.width < minTarget && !el.matches("a"));
    });
  // место на странице — для группировки одинаковых проблем на разных страницах и языках
  const landmark = (el) => el.closest("header,nav,main,footer,form,aside,[role=dialog]")?.tagName.toLowerCase() ?? "body";
  if (targets.length) {
    found.smallTargets = targets.slice(0, 10).map((el) => {
      const r = el.getBoundingClientRect();
      const size = r.height < minTarget ? `высота ${Math.round(r.height)}px` : `ширина ${Math.round(r.width)}px`;
      return `${landmark(el)} › ${el.tagName.toLowerCase()}, ${size} (напр. ${describe(el)})`;
    });
  }

  const unlabeled = [...document.querySelectorAll("input:not([type=hidden]),select,textarea")]
    .filter((el) => !el.closest("[aria-hidden=true]"))
    .filter((el) => !(el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) && !el.closest("label") && !el.getAttribute("aria-label") && !el.getAttribute("aria-labelledby"));
  if (unlabeled.length) found.unlabeledControls = unlabeled.slice(0, 10).map(describe);

  // mobile first: поле с текстом < 16 px — iOS приближает страницу при вводе
  const smallFont = [...document.querySelectorAll("input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]),select,textarea")]
    .filter(visible)
    .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16);
  if (smallFont.length) {
    found.inputFontUnder16px = smallFont.slice(0, 10).map((el) => `${landmark(el)} › ${el.tagName.toLowerCase()} ${getComputedStyle(el).fontSize} (напр. ${describe(el)})`);
  }

  const noAlt = [...document.querySelectorAll("img:not([alt])")];
  if (noAlt.length) found.imagesWithoutAlt = noAlt.slice(0, 10).map((img) => img.getAttribute("src"));

  if (!document.documentElement.lang) found.missingHtmlLang = true;
  return found;
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const report = { base, out, apiDown, checked: 0, issues: [] };

try {
  for (const vpName of viewports) {
    for (const theme of themes) {
      for (const lang of langs) {
        const context = await browser.newContext({ viewport: VIEWPORTS[vpName], deviceScaleFactor: 1, isMobile: VIEWPORTS[vpName].isMobile, hasTouch: VIEWPORTS[vpName].hasTouch });
        // язык и тема — как их запоминает сам сайт (localStorage), до загрузки страницы
        await context.addInitScript(([l, t]) => {
          try {
            localStorage.setItem("locale", l);
            localStorage.setItem("theme", t);
          } catch {
            /* приватный режим */
          }
        }, [lang, theme]);
        // только бэкенд: шаблон «**/api/**» оборвал бы и исходники Vite (/src/shared/api/…)
        if (apiDown) await context.route(`${api}/**`, (route) => route.abort());

        if (admin) {
          const [login, ...rest] = admin.split(":");
          const res = await context.request.post(`${api}/api/admin/auth/login`, { data: { login, password: rest.join(":") } });
          if (!res.ok()) throw new Error(`Admin login failed: HTTP ${res.status()}`);
        }

        for (const pagePath of pages) {
          const page = await context.newPage();
          const consoleErrors = [];
          const failedRequests = [];
          page.on("console", (msg) => msg.type() === "error" && consoleErrors.push(msg.text().slice(0, 200)));
          page.on("pageerror", (err) => consoleErrors.push(`pageerror: ${err.message.slice(0, 200)}`));
          page.on("requestfailed", (req) => !apiDown && failedRequests.push(`${req.method()} ${req.url()} — ${req.failure()?.errorText}`));
          page.on("response", (res) => res.status() >= 400 && failedRequests.push(`${res.request().method()} ${res.url()} — ${res.status()}`));

          await page.goto(base + pagePath, { waitUntil: "networkidle" });
          // дождаться, пока уйдут спиннеры загрузки (словарь, данные)
          await page.waitForFunction(() => !document.querySelector("[aria-busy=true]"), null, { timeout: 8000 }).catch(() => {});
          await page.waitForTimeout(200);

          const found = await page.evaluate(inspect, { keyPattern: KEY_SECTIONS, minTarget: MIN_TARGET });
          if (consoleErrors.length) found.consoleErrors = consoleErrors.slice(0, 10);
          if (failedRequests.length) found.failedRequests = failedRequests.slice(0, 10);
          const finalUrl = new URL(page.url()).pathname;
          if (finalUrl !== pagePath) found.redirectedTo = finalUrl;

          const shot = path.join(out, `${vpName}-${theme}-${lang}${pagePath.replace(/\//g, "_") || "_"}.png`);
          await page.screenshot({ path: shot, fullPage: true });
          report.checked++;
          if (Object.keys(found).length) report.issues.push({ page: pagePath, viewport: vpName, theme, lang, screenshot: shot, ...found });
          await page.close();
        }
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}

/*
 * Одна и та же проблема (например, шапка) повторяется на всех страницах —
 * в отчёт она попадает один раз со списком мест, а не N раз.
 */
const grouped = new Map();
for (const { page: p, viewport, theme, lang, screenshot, ...found } of report.issues) {
  for (const [type, value] of Object.entries(found)) {
    const items = Array.isArray(value) ? value : [typeof value === "object" ? JSON.stringify(value) : String(value)];
    for (const item of items) {
      // пример в скобках («напр. …») в ключ не входит: та же кнопка на другом языке — та же проблема
      const key = `${type}|${item.replace(/ \(напр\. .*\)$/, "")}`;
      if (!grouped.has(key)) grouped.set(key, { type, item, where: [], screenshot });
      grouped.get(key).where.push(`${viewport}/${theme}/${lang} ${p}`);
    }
  }
}
const summarize = (where) => (where.length > 6 ? [...where.slice(0, 5), `…ещё ${where.length - 5}`] : where);
console.log(
  JSON.stringify(
    {
      base,
      out,
      apiDown,
      checked: report.checked,
      problems: [...grouped.values()].map((g) => ({ ...g, where: summarize(g.where) })),
    },
    null,
    1
  )
);
