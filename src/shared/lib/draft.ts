/*
 * Черновик формы в sessionStorage этой вкладки. Нужен, когда сессия админа
 * истекла посреди правки: введённое сохраняется, после входа форма его
 * восстанавливает. У черновика есть владелец (id админа): на общем компьютере
 * текст одного админа не достанется другому. Недоступное хранилище — черновика
 * просто не будет.
 */
const PREFIX = "icu:draft:";

type Stored<T> = { owner: string; value: T };

const read = <T>(fullKey: string): Stored<T> | null => {
  try {
    const raw = sessionStorage.getItem(fullKey);
    return raw ? (JSON.parse(raw) as Stored<T>) : null;
  } catch {
    return null;
  }
};

const allKeys = () => {
  try {
    return Object.keys(sessionStorage).filter((key) => key.startsWith(PREFIX));
  } catch {
    return [];
  }
};

export function saveDraft(key: string, value: unknown, owner: string) {
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify({ owner, value }));
  } catch {
    // приватный режим / переполнение — без черновика
  }
}

/** Черновик — только своему владельцу. */
export function readDraft<T>(key: string, owner: string | null | undefined): T | null {
  const stored = read<T>(PREFIX + key);
  return stored && owner && stored.owner === owner ? stored.value : null;
}

export function clearDraft(key: string) {
  try {
    sessionStorage.removeItem(PREFIX + key);
  } catch {
    // нечего чистить
  }
}

/** Ключи своих черновиков с префиксом («partner:» → ["<id>", "new"]). */
export function listDrafts(prefix: string, owner: string | null | undefined): string[] {
  return allKeys()
    .filter((key) => key.startsWith(PREFIX + prefix) && owner && read(key)?.owner === owner)
    .map((key) => key.slice(PREFIX.length + prefix.length));
}

/** Все черновики — при осознанном выходе. */
export function clearAllDrafts() {
  for (const key of allKeys()) clearDraft(key.slice(PREFIX.length));
}

/** Вошёл другой админ — черновики прежнего ему не нужны и не должны быть видны. */
export function clearForeignDrafts(owner: string) {
  for (const key of allKeys()) if (read(key)?.owner !== owner) clearDraft(key.slice(PREFIX.length));
}
