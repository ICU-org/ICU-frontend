#!/usr/bin/env node
/*
 * Проверка правил Feature-Sliced Design разбором импортов.
 * Правила — docs/architecture.md. Запуск: npm run check:arch
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const LAYERS = ["shared", "entities", "features", "widgets", "pages", "app"];
const SLICED = new Set(["entities", "features", "widgets", "pages"]);
const SEGMENTS = new Set(["ui", "model", "api", "zod", "lib", "config", "@x"]);
const SHARED_SEGMENTS = new Set(["api", "lib", "ui", "config", "mocks", "i18n"]);
const ENTRY = "main.tsx";
const EXT = [".ts", ".tsx", ".d.ts"];
const isIndex = (name) => /^index\.tsx?$/.test(name);

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(path.relative(SRC, full).split(path.sep).join("/"));
  }
})(SRC);
const known = new Set(files);

const tryFile = (base) => {
  for (const c of [base, ...EXT.map((e) => base + e), ...EXT.map((e) => `${base}/index${e}`)]) {
    if (known.has(c)) return c;
  }
  return null;
};
const resolve = (from, spec) => {
  if (spec.startsWith("@/")) return tryFile(spec.slice(2));
  if (spec.startsWith(".")) return tryFile(path.posix.normalize(path.posix.join(path.posix.dirname(from), spec)));
  return null;
};

/*
 * Слайс файла. Страницы бывают сгруппированы: pages/Auth/Login — слайс
 * «Auth/Login». Группа — папка без собственного index, внутри которой лежат
 * папки-страницы; всё остальное (pages/Home/ui/…) — обычная страница.
 */
const hasIndex = (dir) => ["index.ts", "index.tsx"].some((n) => fs.existsSync(path.join(dir, n)));
const sliceOf = (file) => {
  const parts = file.split("/");
  const layer = parts[0];
  if (!SLICED.has(layer)) return { layer, slice: null, rest: parts.slice(1) };
  if (layer === "pages" && parts.length > 3 && !SEGMENTS.has(parts[2]) && !hasIndex(path.join(SRC, "pages", parts[1]))) {
    return { layer, slice: `${parts[1]}/${parts[2]}`, rest: parts.slice(3) };
  }
  return { layer, slice: parts[1], rest: parts.slice(2) };
};

/*
 * Комментарии вырезаются, чтобы пример импорта в пояснении не считался
 * импортом. Строки пропускаются как есть: иначе "image/*" съел бы код до «*\/».
 */
const stripComments = (src) => {
  let out = "";
  for (let i = 0; i < src.length; ) {
    const c = src[i], next = src[i + 1];
    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      while (j < src.length && src[j] !== c) j += src[j] === "\\" ? 2 : 1;
      out += src.slice(i, j + 1);
      i = j + 1;
    } else if (c === "/" && next === "*") {
      const end = src.indexOf("*/", i + 2);
      i = end < 0 ? src.length : end + 2;
    } else if (c === "/" && next === "/") {
      const end = src.indexOf("\n", i);
      i = end < 0 ? src.length : end;
    } else {
      out += c;
      i++;
    }
  }
  return out;
};
const IMPORT_RE = /(?:\bfrom\s*|\bimport\s*\(?\s*)["']([^"']+)["']/g;

const violations = [];
const edges = new Map();
// main.tsx — точка входа над app: ей можно всё
const rank = (file, layer) => (file === ENTRY ? LAYERS.length : LAYERS.indexOf(layer));

for (const file of files) {
  const me = sliceOf(file);
  if (file !== ENTRY && file !== "vite-env.d.ts" && LAYERS.indexOf(me.layer) < 0) {
    violations.push(`${file}: вне слоёв FSD`);
  }

  // расположение
  if (SLICED.has(me.layer) && me.slice) {
    const seg = me.rest[0];
    if (me.rest.length === 1 && !isIndex(seg)) violations.push(`${file}: файл в корне слайса — нужен сегмент`);
    if (me.rest.length > 1 && !SEGMENTS.has(seg)) violations.push(`${file}: неизвестный сегмент «${seg}»`);
    if (me.layer === "pages" && me.rest.length > 1 && seg !== "ui") violations.push(`${file}: у страницы только сегмент ui`);
    if (seg === "@x" && me.layer !== "entities") violations.push(`${file}: @x бывает только у сущностей`);
    const base = path.posix.basename(file);
    if (/^use[A-Z].*\.tsx?$/.test(base) && seg !== "model") violations.push(`${file}: хук вне model/`);
    if (base.endsWith(".tsx") && seg !== "ui" && !isIndex(base)) violations.push(`${file}: компонент вне ui/`);
  }
  if (me.layer === "shared" && me.rest.length > 1 && !SHARED_SEGMENTS.has(me.rest[0])) {
    violations.push(`${file}: неизвестный сегмент shared «${me.rest[0]}»`);
  }

  const source = stripComments(fs.readFileSync(path.join(SRC, file), "utf8"));
  for (const [, spec] of source.matchAll(IMPORT_RE)) {
    if (!spec.startsWith("@/") && !spec.startsWith(".")) continue;
    const target = resolve(file, spec);
    if (!target) continue;
    if (!edges.has(file)) edges.set(file, new Set());
    edges.get(file).add(target);
    const them = sliceOf(target);

    if (spec.startsWith(".")) {
      if (spec.startsWith("../../..")) violations.push(`${file} → ${spec}: вместо ../../.. — псевдоним @/`);
      const leaves = SLICED.has(me.layer) ? them.layer !== me.layer || them.slice !== me.slice : them.layer !== me.layer;
      if (file !== ENTRY && leaves) violations.push(`${file} → ${spec}: относительный путь выходит за слайс — нужен @/`);
      if (SLICED.has(me.layer) && !leaves && them.rest.length === 1 && isIndex(them.rest[0])) {
        violations.push(`${file} → ${spec}: свой слайс через собственный index`);
      }
      continue;
    }

    // @/…
    if (rank(target, them.layer) > rank(file, me.layer)) {
      violations.push(`${file} → ${spec}: импорт вверх (${me.layer} → ${them.layer})`);
      continue;
    }
    if (!SLICED.has(them.layer)) continue;
    if (them.layer === me.layer && them.slice === me.slice) {
      violations.push(`${file} → ${spec}: внутри своего слайса — относительные пути`);
      continue;
    }
    const viaIndex = them.rest.length === 1 && isIndex(them.rest[0]);
    // @x: сущность отдаёт соседу отдельный API; имя файла — имя слайса-потребителя
    const viaCross =
      them.layer === "entities" && me.layer === "entities" && them.rest[0] === "@x" && them.rest.length === 2 &&
      them.rest[1].replace(/\.tsx?$/, "").toLowerCase() === me.slice.toLowerCase();
    if (them.layer === me.layer && !viaCross) {
      violations.push(`${file} → ${spec}: импорт между слайсами одного слоя (${me.layer}) — для сущностей через @x`);
    }
    if (!viaIndex && !viaCross) violations.push(`${file} → ${spec}: в чужой слайс только через его index`);
  }
}

// shared/ui не реэкспортирует помощники общего назначения
const uiIndex = path.join(SRC, "shared/ui/index.ts");
if (fs.existsSync(uiIndex) && /\bcn\b/.test(stripComments(fs.readFileSync(uiIndex, "utf8")))) {
  violations.push("shared/ui/index.ts: реэкспортирует cn — он живёт в shared/lib");
}

// мёртвый код: файлы, недостижимые от точки входа
const reach = new Set();
const stack = [ENTRY];
while (stack.length) {
  const f = stack.pop();
  if (!f || reach.has(f)) continue;
  reach.add(f);
  for (const t of edges.get(f) || []) stack.push(t);
}
for (const f of files) {
  if (!reach.has(f) && !f.endsWith(".d.ts")) violations.push(`${f}: недостижим от ${ENTRY} — мёртвый код?`);
}

if (violations.length) {
  console.error(`Нарушения FSD (${violations.length}):`);
  for (const v of violations) console.error(`  - ${v}`);
  process.exit(1);
}
console.log(`FSD в порядке: ${files.length} файлов, точка входа ${ENTRY}.`);
