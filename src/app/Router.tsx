import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AboutPage } from "@/pages/About";
import { HomePage } from "@/pages/Home";
import { PartnersPage } from "@/pages/Partners";
import { TransportPage } from "@/pages/Transport";
import { FullScreenSpinner } from "@/shared/ui";
import { AppLayout } from "./layouts/AppLayout";

// Служебная часть — отдельные куски сборки: жители их не скачивают.
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AdminFeedbackPage = lazy(() => import("@/pages/Admin/Feedback").then((m) => ({ default: m.AdminFeedbackPage })));
const AdminLoginPage = lazy(() => import("@/pages/Admin/Login").then((m) => ({ default: m.AdminLoginPage })));
const AdminPartnerNewPage = lazy(() => import("@/pages/Admin/PartnerNew").then((m) => ({ default: m.AdminPartnerNewPage })));
const AdminPartnersPage = lazy(() => import("@/pages/Admin/Partners").then((m) => ({ default: m.AdminPartnersPage })));
const AdminAboutPage = lazy(() => import("@/pages/Admin/About").then((m) => ({ default: m.AdminAboutPage })));

const Router = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/transport" element={<TransportPage />} />
        <Route path="/about" element={<AboutPage />} />
        {/* :partnerId? — тот же элемент: партнёр открывается без пересоздания страницы и сброса фильтра */}
        <Route path="/partners/:partnerId?" element={<PartnersPage />} />
      </Route>
      <Route
        path="/admin"
        element={
          <Suspense fallback={<FullScreenSpinner />}>
            <AdminLayout />
          </Suspense>
        }
      >
        <Route index element={<AdminFeedbackPage />} />
        <Route path="login" element={<AdminLoginPage />} />
        <Route path="partners" element={<AdminPartnersPage />} />
        <Route path="partners/new" element={<AdminPartnerNewPage />} />
        <Route path="about" element={<AdminAboutPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default Router;
