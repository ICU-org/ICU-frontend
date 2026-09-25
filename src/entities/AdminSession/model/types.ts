export type Admin = { id: string; login: string };

/**
 * idle — ещё не проверяли; denied — адрес не из списка админов (для него
 * админки «нет»); anonymous — адрес свой, но не вошёл.
 */
export type AdminSessionStatus = "idle" | "checking" | "denied" | "anonymous" | "authenticated" | "error";
