import { AdminExportPanel } from "@/widgets/AdminExportPanel";
import { AdminFeedbackList } from "@/widgets/AdminFeedbackList";

export const AdminFeedbackPage = () => (
  <div className="space-y-8">
    <AdminExportPanel />
    <AdminFeedbackList />
  </div>
);
