import { getErrorCode } from "@/shared/lib";
import { useAdminSession } from "../model/adminSessionStore";

/**
 * 401 от служебного API — сессия истекла: на форму входа. true — случай обработан.
 * beforeExpire — успеть сохранить черновик до перехода (форма сейчас исчезнет).
 */
export function expireOnUnauthorized(error: unknown, beforeExpire?: () => void): boolean {
  if (getErrorCode(error) !== "UNAUTHORIZED") return false;
  beforeExpire?.();
  useAdminSession.getState().expire();
  return true;
}
