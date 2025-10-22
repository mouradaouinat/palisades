import { ReactNode } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Outlet } from "react-router";

export function Layout() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
