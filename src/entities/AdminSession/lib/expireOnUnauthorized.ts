import { getErrorCode } from "@/shared/lib";
import { useAdminSession } from "../model/adminSessionStore";

/** 401 от служебного API — сессия истекла: на форму входа. true — случай обработан. */
export function expireOnUnauthorized(error: unknown): boolean {
  if (getErrorCode(error) !== "UNAUTHORIZED") return false;
  useAdminSession.getState().expire();
  return true;
}
