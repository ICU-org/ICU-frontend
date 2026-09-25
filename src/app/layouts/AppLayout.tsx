import { Outlet } from "react-router-dom";
import { Header } from "@/widgets/Header";

export const AppLayout = () => (
  <div className="min-h-screen">
    <Header />
    <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
      <Outlet />
    </main>
  </div>
);
