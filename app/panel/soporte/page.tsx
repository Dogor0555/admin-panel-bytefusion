"use client";

import { useState, useEffect, useCallback, JSX } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Reload from "../components/ui/icons/Reload";
import FiltroPrioridad from "../components/ui/icons/FiltroPrioridad";
import FiltroEstadoUltra from "../components/ui/icons/FiltroEstadoUltra";
import {
  FaTicketAlt,
  FaSpinner,
  FaEye,
  FaTrash,
  FaComment,
  FaCalendarAlt,
  FaUser,
  FaHeadset,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaCircle,
  FaCheck,
  FaChartBar,
  FaFolderOpen,
  FaCog,
  FaCheckCircle,
  FaLock,
} from "react-icons/fa";

interface Ticket {
  id: number;
  titulo: string;
  descripcion: string | null;
  estado: "abierto" | "en_proceso" | "resuelto" | "cerrado";
  prioridad: "baja" | "media" | "alta" | "urgente";
  categoria: string | null;
  created_at: string;
  updated_at: string;
  fecha_cierre: string | null;
  empresa: {
    id: number;
    nombre: string;
    correo: string;
    telefono: string;
    nit: string;
  } | null;
  empleado_creador: {
    idempleado: number;
    nombre: string;
    correo: string;
  } | null;
  mensajes_no_leidos: number;
}

interface Stats {
  total: number;
  abiertos: number;
  enProceso: number;
  resueltos: number;
  cerrados: number;
  porPrioridad: {
    baja: number;
    media: number;
    alta: number;
    urgente: number;
  };
}

interface EstadoInfo {
  color: string;
  bgLight: string;
  text: string;
  icono: JSX.Element;
  label: string;
}

interface PrioridadInfo {
  color: string;
  bgLight: string;
  text: string;
  label: string;
}

export default function SoportePanelPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTickets, setTotalTickets] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/tickets/stats`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtroEstado !== "todos") params.append("estado", filtroEstado);
      if (filtroPrioridad !== "todos") params.append("prioridad", filtroPrioridad);
      if (searchTerm) params.append("search", searchTerm);
      params.append("page", currentPage.toString());
      params.append("limit", "15");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/tickets?${params.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al cargar tickets");
      const data = await res.json();
      setTickets(data.tickets);
      setTotalPages(data.totalPages);
      setTotalTickets(data.total);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [filtroEstado, filtroPrioridad, searchTerm, currentPage]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStats(), fetchTickets()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchStats();
    fetchTickets();
  }, [fetchStats, fetchTickets]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
      fetchTickets();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchStats, fetchTickets]);

  const getEstadoInfo = (estado: string): EstadoInfo => {
    switch (estado) {
      case "abierto":
        return { color: "bg-yellow-500", bgLight: "bg-yellow-50", text: "text-yellow-700", icono: <FaCircle className="text-yellow-500 text-xs" />, label: "Abierto" };
      case "en_proceso":
        return { color: "bg-blue-500", bgLight: "bg-blue-50", text: "text-blue-700", icono: <FaSpinner className="text-blue-500 text-xs animate-spin" />, label: "En Proceso" };
      case "resuelto":
        return { color: "bg-green-500", bgLight: "bg-green-50", text: "text-green-700", icono: <FaCheck className="text-green-500 text-xs" />, label: "Resuelto" };
      case "cerrado":
        return { color: "bg-red-500", bgLight: "bg-red-50", text: "text-red-700", icono: <FaCheck className="text-red-500 text-xs" />, label: "Cerrado" };
      default:
        return { color: "bg-gray-500", bgLight: "bg-gray-50", text: "text-gray-700", icono: <FaCircle className="text-gray-500 text-xs" />, label: estado };
    }
  };

  const getPrioridadInfo = (prioridad: string): PrioridadInfo => {
    switch (prioridad) {
      case "urgente":
        return { color: "bg-red-500", bgLight: "bg-red-50", text: "text-red-700", label: "Urgente" };
      case "alta":
        return { color: "bg-orange-500", bgLight: "bg-orange-50", text: "text-orange-700", label: "Alta" };
      case "media":
        return { color: "bg-yellow-500", bgLight: "bg-yellow-50", text: "text-yellow-700", label: "Media" };
      case "baja":
        return { color: "bg-green-500", bgLight: "bg-green-50", text: "text-green-700", label: "Baja" };
      default:
        return { color: "bg-gray-500", bgLight: "bg-gray-50", text: "text-gray-700", label: prioridad };
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `hace ${minutes} min`;
    } else if (hours < 24) {
      return `hace ${Math.floor(hours)} h`;
    } else {
      return date.toLocaleDateString("es-SV", { day: "numeric", month: "short" });
    }
  };

  const limpiarFiltros = () => {
    setFiltroEstado("todos");
    setFiltroPrioridad("todos");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const tieneFiltrosActivos = filtroEstado !== "todos" || filtroPrioridad !== "todos" || searchTerm !== "";

  return (
    <div className="text-black min-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[var(--text)] text-center transition-colors duration-300">
                Gestiona y responde a las solicitudes de los clientes
              </h1>
            </div>
            <div className="flex gap-2">
              {/* BOTÓN REFRESH */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="
                  group inline-flex items-center gap-2 
                  px-5 py-2.5 
                  rounded-xl 
                  text-sm font-semibold text-white

                  bg-gradient-to-r from-blue-600 to-indigo-600
                  hover:from-blue-700 hover:to-indigo-700

                  shadow-md hover:shadow-lg
                  hover:-translate-y-[1px]

                  transition-all duration-300 ease-out

                  focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2

                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <Reload
                  className={`w-5 h-5 transition-transform duration-500 ${
                    refreshing ? "animate-spin" : "group-hover:rotate-180"
                  }`}
                />
              
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
{stats && (
  <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-8">
    {[
      {
        label: "Total",
        value: stats.total,
        icon: <FaChartBar />,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        glow: "from-blue-500/10 to-blue-600/10",
        border: "bg-blue-500",
      },
      {
        label: "Abiertos",
        value: stats.abiertos,
        icon: <FaFolderOpen />,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        glow: "from-amber-500/10 to-amber-600/10",
        border: "bg-amber-500",
      },
      {
        label: "En Proceso",
        value: stats.enProceso,
        icon: <FaCog className="animate-spin-slow" />,
        color: "text-indigo-500",
        bg: "bg-indigo-500/10",
        glow: "from-indigo-500/10 to-indigo-600/10",
        border: "bg-indigo-500",
      },
      {
        label: "Resueltos",
        value: stats.resueltos,
        icon: <FaCheckCircle />,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        glow: "from-emerald-500/10 to-emerald-600/10",
        border: "bg-emerald-500",
      },
      {
        label: "Cerrados",
        value: stats.cerrados,
        icon: <FaLock />,
        color: "text-gray-400",
        bg: "bg-gray-500/10",
        glow: "from-gray-500/10 to-gray-600/10",
        border: "bg-gray-500",
      },
    ].map((item, i) => (
      <div
        key={i}
        className="
          group relative overflow-hidden
          rounded-2xl p-5
          bg-white/60 dark:bg-gray-900/60
          backdrop-blur-xl
          border border-white/20 dark:border-gray-700/40
          shadow-sm hover:shadow-xl
          transition-all duration-300
          hover:-translate-y-1
        "
      >
        {/* Glow */}
        <div
          className={`
            absolute inset-0 opacity-0 group-hover:opacity-100
            transition duration-300
            bg-gradient-to-br ${item.glow}
          `}
        />

        <div className="relative flex items-center justify-between">
          {/* TEXTO */}
          <div>
            <p className="text-3xl font-semibold text-gray-800 dark:text-white">
              {item.value}
            </p>
            <p className="text-xs tracking-wide text-gray-500 mt-1 uppercase">
              {item.label}
            </p>
          </div>

          {/* ICONO */}
          <div
            className={`
              w-11 h-11 flex items-center justify-center
              rounded-xl
              ${item.bg} ${item.color}
              text-lg
              group-hover:scale-110
              transition
            `}
          >
            {item.icon}
          </div>
        </div>

        {/* Línea inferior */}
        <div
          className={`
            absolute bottom-0 left-0 h-[2px] w-0
            ${item.border}
            group-hover:w-full
            transition-all duration-300
          `}
        />
      </div>
    ))}
  </div>
)}

        {/* Filtros y búsqueda */}
        <div className="bg-gray-800 backdrop-blur border border-white/30 rounded-2xl shadow-sm p-5 mb-8">
            <div className="flex flex-wrap gap-4 items-center justify-between">

              {/* FILTROS */}
                  <div className="flex flex-wrap gap-3 items-center">
                    {/* ESTADO */}
                    <FiltroEstadoUltra
                      value={filtroEstado}
                      onChange={(value) => {
                        setFiltroEstado(value);
                        setCurrentPage(1);
                      }}
                    />

                    {/* PRIORIDAD */}
                    <FiltroPrioridad
                      value={filtroPrioridad}
                      onChange={(value) => {
                        setFiltroPrioridad(value);
                        setCurrentPage(1);
                      }}
                    />

                    {/* LIMPIAR */}
                    <button
                      onClick={limpiarFiltros}
                      disabled={!tieneFiltrosActivos}
                      className={`
                        group relative flex items-center gap-2
                        px-5 py-2.5
                        rounded-xl
                        text-sm font-semibold
                        overflow-hidden

                        transition-all duration-300 ease-out

                        ${
                          tieneFiltrosActivos
                            ? `
                              text-white
                              bg-gradient-to-r from-red-500 to-rose-600
                              hover:from-red-600 hover:to-rose-700

                              shadow-md hover:shadow-xl
                              hover:-translate-y-[1px]

                              active:scale-[0.97]
                            `
                            : `
                              text-gray-400
                              bg-gray-700/50
                              cursor-not-allowed
                            `
                        }
                      `}
                    >
                      {/* Glow effect */}
                      {tieneFiltrosActivos && (
                        <span
                          className="
                            absolute inset-0
                            bg-gradient-to-r from-red-400/20 to-rose-500/20
                            opacity-0 group-hover:opacity-100
                            transition duration-300
                          "
                        />
                      )}

                      {/* Icono */}
                      <FaTrash
                        className={`
                          w-4 h-4 relative z-10
                          transition-all duration-300
                          ${
                            tieneFiltrosActivos
                              ? "group-hover:rotate-12 group-hover:scale-110"
                              : ""
                          }
                        `}
                      />

                      {/* Texto */}
                      <span className="relative z-10 tracking-wide">
                        Limpiar
                      </span>
                    </button>

                  </div>

                  {/* BUSCADOR */}
                  <div className="flex-1 min-w-0 relative">
                    <div className="relative">

                      {/* ICONO */}
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="h-5 w-5 text-indigo-400" />
                      </div>

                      {/* INPUT */}
                      <input
                        type="text"
                        placeholder="Buscar tickets..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-2xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                      />
                      
                    </div>
                  </div>

            </div>
        </div>

        {/* Lista de Tickets */}
        {loading && tickets.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-gray-800 rounded-2xl shadow-md text-center py-12">
            <FaTicketAlt className="text-6xl text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-200 mb-2">No hay tickets</h3>
            <p className="text-gray-400">
              {tieneFiltrosActivos
                ? "No hay tickets con los filtros seleccionados"
                : "Aún no hay tickets de soporte"}
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {tickets.map((ticket) => {
              const estadoInfo = getEstadoInfo(ticket.estado);
              const prioridadInfo = getPrioridadInfo(ticket.prioridad);

              return (
                <li
                  key={ticket.id}
                  className="transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <Link
                    href={`/panel/soporte/${ticket.id}`}
                    className="block bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-lg rounded-2xl px-6 py-5"
                  >
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-3">

                      {/* BADGES */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 text-white ${estadoInfo.color}`}>
                          {estadoInfo.icono}
                          {estadoInfo.label}
                        </span>

                        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${prioridadInfo.color}`}>
                          {prioridadInfo.label}
                        </span>

                        {ticket.categoria && (
                          <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">
                            {ticket.categoria}
                          </span>
                        )}

                        {ticket.mensajes_no_leidos > 0 && (
                          <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
                            <FaComment className="text-xs" />
                            {ticket.mensajes_no_leidos} nuevo{ticket.mensajes_no_leidos !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>

                      {/* FECHA */}
                      <div className="flex items-center text-gray-400 text-xs gap-3">
                        <FaCalendarAlt className="mr-1" />
                        {formatDate(ticket.created_at)}
                      </div>
                    </div>

                    {/* TITULO */}
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
                      {ticket.titulo}
                    </h3>

                    {/* INFO */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mt-2">
                      {ticket.empresa && (
                        <div className="flex items-center gap-1">
                          <FaUser className="text-gray-400 text-xs" />
                          <span>{ticket.empresa.nombre}</span>
                        </div>
                      )}

                      {ticket.empleado_creador && (
                        <div className="flex items-center gap-1">
                          <FaHeadset className="text-gray-400 text-xs" />
                          <span>{ticket.empleado_creador.nombre}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 ml-auto">
                        <FaEye className="text-gray-400 text-xs" />
                        <span className="text-indigo-400">Ver detalles</span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {/* Paginación */}
        <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-600 rounded-lg text-sm text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
            <FaChevronLeft className="text-sm" />
          </button>

          <span className="px-4 py-2 text-sm text-gray-400">
            Página {currentPage} de {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-600 rounded-lg text-sm text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
          >
            <FaChevronRight className="text-sm" />
          </button>
        </div>

        {/* Resumen de resultados */}
        {totalTickets > 0 && (
          <div className="mt-8 text-center text-gray-400 py-4">
            Mostrando {tickets.length} de {totalTickets} tickets
          </div>
        )}
      </div>
    </div>
  );
}