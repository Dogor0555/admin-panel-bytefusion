import { apiGet } from "@/lib/api";
import PanelPage from "./panelPage";

export default async function Panel() {
  let usuarios = [];

  try {
    const response = await apiGet("/usuarios/getAllUsu");
    usuarios = response.data;
  } catch (error) {
    console.log("🔥 Backend caído, usando datos mock");

    // 👇 DATOS FAKE PARA QUE NO ROMPA
    usuarios = [
      {
        id: 1,
        nombre: "Modo Desarrollo",
        nit: "0000",
        nrc: "",
        giro: "Testing",
        correo: "dev@local.com",
        telefono: "0000",
        complemento: "",
        codactividad: "",
        desactividad: null,
        nombrecomercial: "Demo",
        tipoestablecimiento: null,
        codestablemh: null,
        codestable: "",
        codpuntovenmh: null,
        codpuntoventa: "001",
        departamento: "",
        municipio: "",
        passwordtoken: null,
        ambiente: null,
        configurado: false,
        detalleUsuario: null,
      },
    ];
  }

  return <PanelPage usuarios={usuarios} />;
}