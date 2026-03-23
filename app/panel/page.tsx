//app/panel/page.tsx
import { apiGet } from "@/lib/api";
import PanelPage from "./panelPage";

export default async function Panel() {
  const response = await apiGet("/usuarios/getAllUsu");
  const usuarios = response.data; 

  return <PanelPage usuarios={usuarios} />;
}