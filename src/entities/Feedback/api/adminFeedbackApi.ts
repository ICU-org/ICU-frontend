import axios from "axios";
import { api } from "@/shared/api";
import type { ExportBatch, FeedbackFilter, FeedbackItem, FeedbackPage } from "../model/types";

export const listFeedback = async (params: { page: number; pageSize: number; filter: FeedbackFilter }) =>
  (await api.get<FeedbackPage>("/admin/feedback", { params })).data;

export const setFeedbackExcluded = async (id: string, excluded: boolean) =>
  (await api.patch<FeedbackItem>(`/admin/feedback/${id}`, { excluded })).data;

/** Навсегда: мэрия его уже не получит. */
export const deleteFeedback = async (id: string) => {
  await api.delete(`/admin/feedback/${id}`);
};

export const listExportBatches = async () =>
  (await api.get<{ items: ExportBatch[] }>("/admin/feedback/exports")).data.items;

/** Excel за дни [from, to] («YYYY-MM-DD», по Еревану). Выгрузка попадает в журнал. */
export async function downloadFeedbackExport(from: string, to: string) {
  const response = await api
    .get<Blob>("/admin/feedback/export", { params: { from, to }, responseType: "blob" })
    .catch(async (err: unknown) => {
      // при responseType: "blob" конверт ошибки тоже приходит Blob — разбираем, чтобы был виден code
      if (axios.isAxiosError(err) && err.response?.data instanceof Blob) {
        try {
          err.response.data = JSON.parse(await err.response.data.text());
        } catch {
          // не JSON — оставляем как есть, сработает общий текст ошибки
        }
      }
      throw err;
    });
  const disposition = String(response.headers["content-disposition"] ?? "");
  return {
    blob: response.data,
    fileName: /filename="([^"]+)"/.exec(disposition)?.[1] ?? `ICU-${from}_${to}.xlsx`,
    count: Number(response.headers["x-export-count"] ?? 0),
  };
}
