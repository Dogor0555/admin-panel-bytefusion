import type { ReactNode } from "react";
import Sidebar from "../../components/sidebar";
import Header from "../../components/Header";

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 p-4 space-y-4">
        <Header />

        <main className="card min-h-[calc(100vh-120px)]">
          {children}
        </main>
      </div>
    </div>
  );
}