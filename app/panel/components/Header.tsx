"use client";

import { useState } from "react";
import { FaBell } from "react-icons/fa";
import { LogoByteFusion } from "../components/ui/icons/LogoByteFusion";
import { TicketSoporte } from "../components/ui/icons/TicketSoporte";
import {Usuario} from "../components/ui/icons/Usuario";
import { usePathname } from "next/navigation";

export default function Header() {
  const [openNotif, setOpenNotif] = useState(false);
  const pathname = usePathname();

  const notifications = [
    { id: 1, title: "Nuevo ticket asignado", message: "Ticket #123 requiere atención", time: "Hace 5 min" },
    { id: 2, title: "Ticket cerrado", message: "Ticket #120 ha sido cerrado por el agente", time: "Hace 20 min" },
  ];

  // 👇 Mapa de rutas a títulos e íconos
  const panelMap: Record<
    string,
    { title: string; Icon: React.FC<React.SVGProps<SVGSVGElement>> }
  > = {
    "/panel": { title: "Panel de Usuarios", Icon: Usuario },
    "/panel/soporte": { title: " Soporte tecnico", Icon: TicketSoporte },
    "/dashboard/compras": { title: "Panel de Compras", Icon: LogoByteFusion },
    "/dashboard/proveedores": { title: "Panel de Proveedores", Icon: LogoByteFusion },
  };

  const currentPanel = panelMap[pathname] || { title: "ByteFusion", Icon: LogoByteFusion };
  const { title, Icon } = currentPanel;

  return (
<header className="relative flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b dark:border-gray-800 shadow-xl rounded-xl">
  {/* ICONO IZQUIERDO */}
  <div className="flex items-center gap-2">
    <Icon className="w-6 h-6 text-blue-500" />
  </div>

  {/* TÍTULO CENTRADO */}
  <h1 className="absolute left-1/2 transform -translate-x-1/2 font-bold text-2xl text-gray-800 dark:text-gray-100">
    {title}
  </h1>

  {/* ACCIONES DERECHA */}
  <div className="flex items-center gap-4">
    {/* 🔔 NOTIFICACIONES */}
    <div className="relative">
      <button
        onClick={() => setOpenNotif(!openNotif)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      >
        <FaBell className="text-gray-800 dark:text-gray-100" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {openNotif && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-50">
          <div className="p-3 border-b border-gray-200 dark:border-gray-800 font-semibold text-gray-800 dark:text-gray-100">
            Notificaciones
          </div>
          {notifications.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
              No hay notificaciones
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer border-b border-gray-200 dark:border-gray-800"
              >
                <p className="font-medium text-gray-800 dark:text-gray-100">{n.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{n.message}</p>
                <span className="text-xs text-gray-400 dark:text-gray-500">{n.time}</span>
              </div>
            ))
          )}
          <div className="p-2 text-center text-sm text-blue-500 hover:underline cursor-pointer">
            Ver todas
          </div>
        </div>
      )}
    </div>
  </div>
</header>
  );
}