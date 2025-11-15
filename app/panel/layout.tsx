import type { ReactNode } from "react";

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <aside></aside>
      <main>{children}</main>
    </div>
  );
}
