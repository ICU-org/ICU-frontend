import { api } from "@/shared/api";
import type { FeedbackReceipt } from "../model/types";

export const sendFeedback = (message: string) =>
  api.post<FeedbackReceipt>("/feedback", { message }).then((r) => r.data);
