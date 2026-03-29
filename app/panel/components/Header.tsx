"use client";

import { useState, useEffect, useRef } from "react";
import { FaBell } from "react-icons/fa";
import { LogoByteFusion } from "../components/ui/icons/LogoByteFusion";
import { TicketSoporte } from "../components/ui/icons/TicketSoporte";
import { Usuario } from "../components/ui/icons/Usuario";
import { usePathname } from "next/navigation";

export default function Header() {
  const [openNotif, setOpenNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevCountRef = useRef(0);
  const pathname = usePathname();

  // 🔥 MÁS NOTIFICACIONES
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Nuevo ticket asignado",
      message: "Ticket #123 requiere atención",
      time: "Hace 5 min",
    },
    {
      id: 2,
      title: "Cliente respondió",
      message: "Respuesta en ticket #120",
      time: "Hace 10 min",
    },
    {
      id: 3,
      title: "Ticket resuelto",
      message: "Ticket #118 fue marcado como resuelto",
      time: "Hace 20 min",
    },
    {
      id: 4,
      title: "Nuevo usuario",
      message: "Se registró un nuevo cliente",
      time: "Hace 30 min",
    },
  ]);

  // 🔊 Detectar nuevas notificaciones
  useEffect(() => {
    if (notifications.length > prevCountRef.current) {
      audioRef.current?.play().catch(() => {});
    }

    prevCountRef.current = notifications.length;
  }, [notifications]);

  // Cierra el dropdown si se hace click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setOpenNotif(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifRef]);

  const panelMap: Record<string, { title: string; Icon: React.FC<React.SVGProps<SVGSVGElement>> }> = {
    "/panel": { title: "Panel de Usuarios", Icon: Usuario },
    "/panel/soporte": { title: "Soporte técnico", Icon: TicketSoporte },
    "/dashboard/compras": { title: "Panel de Compras", Icon: LogoByteFusion },
    "/dashboard/proveedores": { title: "Panel de Proveedores", Icon: LogoByteFusion },
  };

  const currentPanel = panelMap[pathname] || {
    title: "ByteFusion",
    Icon: LogoByteFusion,
  };

  const { title, Icon } = currentPanel;

  return (
    <header className="relative flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800 shadow-xl rounded-xl">
      
      {/* 🔊 AUDIO */}
      <audio
        ref={audioRef}
        src="/sound/dragon-studio-new-notification-3-398649.mp3"
        preload="auto"
      />

      {/* ICONO IZQUIERDO */}
      <div className="flex items-center gap-2">
        <Icon className="w-6 h-6 text-blue-400" />
      </div>

      {/* TÍTULO CENTRADO */}
      <h1 className="absolute left-1/2 transform -translate-x-1/2 font-bold text-2xl text-white">
        {title}
      </h1>

      {/* ACCIONES DERECHA */}
      <div className="flex items-center gap-4">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setOpenNotif(!openNotif);

              audioRef.current?.play().then(() => {
                audioRef.current?.pause();
                audioRef.current.currentTime = 0;
              }).catch(() => {});
            }}
            className="relative p-2 rounded-lg hover:bg-gray-800 transition"
          >
            <FaBell className="text-white" />

            {notifications.length > 0 && (
              // 🔥 BADGE LIMPIO (SIN ANIMATE-PING)
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-[2px] rounded-full shadow">
                {notifications.length}
              </span>
            )}
          </button>

          {openNotif && (
            <div className="absolute right-0 mt-2 w-80 max-h-96 bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-y-auto scrollbar-hide animate-slide-down">
              
              <div className="p-3 border-b border-gray-700 font-semibold text-white text-lg">
                Notificaciones
              </div>

              {notifications.length === 0 ? (
                <div className="p-4 text-sm text-gray-400 text-center">
                  No hay notificaciones
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 p-3 hover:bg-gray-800 transition cursor-pointer border-b border-gray-700"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {n.title.toLowerCase().includes("ticket") ? (
                        <TicketSoporte className="w-5 h-5 text-indigo-400" />
                      ) : (
                        <Usuario className="w-5 h-5 text-green-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-white">{n.title}</p>
                      <p className="text-sm text-gray-300">{n.message}</p>
                      <span className="text-xs text-gray-400">{n.time}</span>
                    </div>
                  </div>
                ))
              )}

              <div className="p-2 text-center text-sm text-blue-400 hover:underline cursor-pointer bg-gray-800">
                Ver todas
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}