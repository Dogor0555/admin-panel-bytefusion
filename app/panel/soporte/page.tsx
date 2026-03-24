"use client";

import { useState, useEffect, useCallback, JSX } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Reload from "../components/ui/icons/Reload";
import {
  FaTicketAlt,
  FaClock,
  FaCheckCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaEye,
  FaComment,
  FaCalendarAlt,
  FaFilter,
  FaChartBar,
  FaUser,
  FaHeadset,
  FaSearch,
  FaSync,
  FaChevronLeft,
  FaChevronRight,
  FaRegClock,
  FaCircle,
  FaCheck
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
        return { color: "bg-gray-500", bgLight: "bg-gray-50", text: "text-gray-700", icono: <FaCheck className="text-gray-500 text-xs" />, label: "Cerrado" };
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
    <div className="text-black min-screen bg-transparent py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                Gestiona y responde a las solicitudes de los clientes
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
              >
                <Reload className="w-5 h-5"/>
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Tickets</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-yellow-500">
              <p className="text-2xl font-bold text-yellow-600">{stats.abiertos}</p>
              <p className="text-sm text-gray-500">Abiertos</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
              <p className="text-2xl font-bold text-blue-600">{stats.enProceso}</p>
              <p className="text-sm text-gray-500">En Proceso</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
              <p className="text-2xl font-bold text-green-600">{stats.resueltos}</p>
              <p className="text-sm text-gray-500">Resueltos</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-gray-500">
              <p className="text-2xl font-bold text-gray-600">{stats.cerrados}</p>
              <p className="text-sm text-gray-500">Cerrados</p>
            </div>
          </div>
        )}

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              <FaFilter className="text-gray-400" />
              <select
                value={filtroEstado}
                onChange={(e) => {
                  setFiltroEstado(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todos">Todos los estados</option>
                <option value="abierto">Abiertos</option>
                <option value="en_proceso">En Proceso</option>
                <option value="resuelto">Resueltos</option>
                <option value="cerrado">Cerrados</option>
              </select>
              <select
                value={filtroPrioridad}
                onChange={(e) => {
                  setFiltroPrioridad(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todos">Todas las prioridades</option>
                <option value="urgente">Urgentes</option>
                <option value="alta">Altas</option>
                <option value="media">Medias</option>
                <option value="baja">Bajas</option>
              </select>
              {tieneFiltrosActivos && (
                <button
                  onClick={limpiarFiltros}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Buscar por título, empresa o empleado..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Lista de Tickets */}
        {loading && tickets.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm text-center py-12">
            <FaTicketAlt className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No hay tickets</h3>
            <p className="text-gray-500">
              {tieneFiltrosActivos
                ? "No hay tickets con los filtros seleccionados"
                : "Aún no hay tickets de soporte"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const estadoInfo = getEstadoInfo(ticket.estado);
              const prioridadInfo = getPrioridadInfo(ticket.prioridad);
              return (
                <Link
                  key={ticket.id}
                  href={`/panel/soporte/${ticket.id}`}
                  className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 hover:border-blue-200"
                >
                  <div className="p-5">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 text-white ${estadoInfo.color}`}>
                          {estadoInfo.icono}
                          {estadoInfo.label}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${prioridadInfo.color}`}>
                          {prioridadInfo.label}
                        </span>
                        {ticket.categoria && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
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
                      <div className="flex items-center text-gray-400 text-xs gap-3">
                        <FaCalendarAlt className="mr-1" />
                        {formatDate(ticket.created_at)}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
                      {ticket.titulo}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-2">
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
                        <span className="text-blue-600">Ver detalles</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <FaChevronLeft className="text-sm" />
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <FaChevronRight className="text-sm" />
            </button>
          </div>
        )}

        {/* Resumen de resultados */}
        {totalTickets > 0 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Mostrando {tickets.length} de {totalTickets} tickets
          </div>
        )}
      </div>
    </div>
  );
}