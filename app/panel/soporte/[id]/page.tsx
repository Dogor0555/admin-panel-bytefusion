"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaArrowLeft,
  FaPaperPlane,
  FaImage,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUser,
  FaHeadset,
  FaClock,
  FaPaperclip,
  FaDownload,
  FaEdit,
  FaSave,
  FaTimes,
  FaCircle,
  FaCheck,
  FaComment,
  FaCheckDouble,
  FaBan,
  FaExpand,
  FaRegClock,
  FaBuilding,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaMapMarkerAlt,
  FaStore,
  FaGlobe,
  FaCalendarAlt,
  FaUserTie,
  FaBriefcase,
  FaFlag,
  FaInfoCircle,
  FaTicketAlt,
  FaBell,
  FaVolumeUp,
  FaVolumeMute
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
    nrc: string | null;
    giro: string | null;
    direccion: string | null;
    departamento: string | null;
    municipio: string | null;
    nombrecomercial: string | null;
    ambiente: string | null;
    codestablemh: string | null;
    codpuntoventamh: string | null;
    codactividad: string | null;
    desactividad: string | null;
  } | null;
  empleado_creador: {
    idempleado: number;
    nombre: string;
    correo: string;
    tipodocumento: string;
    numerodocumento: string;
    telefono: string | null;
    rol: string;
    estado: boolean;
    sucursal?: {
      idsucursal: number;
      nombre: string;
      telefono: string | null;
      complemento: string | null;
      departamento: string | null;
      municipio: string | null;
      codestablemh: string | null;
      codpuntoventamh: string | null;
    };
  } | null;
}

interface Mensaje {
  id: number;
  ticket_id: number;
  remitente_tipo: "cliente" | "soporte";
  remitente_id: number;
  mensaje: string | null;
  imagen_url: string | null;
  es_para_cliente: boolean;
  leido: boolean;
  created_at: string;
}

export default function TicketDetallePanelPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [editandoEstado, setEditandoEstado] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [nuevaPrioridad, setNuevaPrioridad] = useState("");
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [editandoTitulo, setEditandoTitulo] = useState(false);
  const [guardandoTicket, setGuardandoTicket] = useState(false);
  const [terminandoTicket, setTerminandoTicket] = useState(false);
  const [imagenModal, setImagenModal] = useState<string | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [nuevosMensajes, setNuevosMensajes] = useState(false);
  const [mostrarInfoCliente, setMostrarInfoCliente] = useState(true);
  const [notificacionPermiso, setNotificacionPermiso] = useState<NotificationPermission | null>(null);
  const [sonidoActivo, setSonidoActivo] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mensajesCountRef = useRef<number>(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ─── Solicitar permiso para notificaciones ────────────────────────────────
  useEffect(() => {
    if ("Notification" in window) {
      setNotificacionPermiso(Notification.permission);
    }
    audioRef.current = new Audio("/notification.mp3");
    audioRef.current.volume = 0.5;
  }, []);

  const solicitarPermisoNotificacion = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permiso = await Notification.requestPermission();
      setNotificacionPermiso(permiso);
    }
  };

  const reproducirSonido = () => {
    if (sonidoActivo && audioRef.current) {
      audioRef.current.play().catch(e => console.log("Error al reproducir sonido:", e));
    }
  };

  const mostrarNotificacion = (titulo: string, cuerpo: string, ticketId: number) => {
    reproducirSonido();
    
    if (notificacionPermiso === "granted" && document.hidden) {
      const notification = new Notification(titulo, {
        body: cuerpo,
        icon: "/favicon.ico",
        tag: `ticket-${ticketId}-${Date.now()}`,
        silent: false,
      });
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  };

  // Configurar WebSocket
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/tickets/${id}`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log("WebSocket conectado");
      setSocketConnected(true);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "nuevo_mensaje") {
          fetchTicket();
          setNuevosMensajes(true);
          setTimeout(scrollToBottom, 100);
        }
      } catch (err) {
        console.error("Error al procesar mensaje WebSocket:", err);
      }
    };
    
    ws.onclose = () => {
      console.log("WebSocket desconectado");
      setSocketConnected(false);
    };
    
    setSocket(ws);
    
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [id]);

  const fetchTicket = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/tickets/${id}`, {
        credentials: "include",
      });
      if (!response.ok) {
        if (response.status === 404) {
          router.push("/panel/soporte");
          return;
        }
        throw new Error("Error al cargar el ticket");
      }
      const data = await response.json();
      
      // Verificar nuevos mensajes para notificación
      if (data.mensajes && data.mensajes.length > mensajes.length) {
        const nuevos = data.mensajes.slice(mensajes.length);
        nuevos.forEach((msg: { remitente_tipo: string; mensaje: string; }) => {
          if (msg.remitente_tipo === "cliente") {
            mostrarNotificacion(
              `📨 Nuevo mensaje de ${ticket?.empresa?.nombre || "cliente"}`,
              `${msg.mensaje?.substring(0, 80) || "Imagen adjunta"}...`,
              ticket?.id || parseInt(id)
            );
          }
        });
      }
      
      setTicket(data.ticket);
      setMensajes(data.mensajes || []);
      setNuevosMensajes(false);
      mensajesCountRef.current = data.mensajes?.length || 0;
    } catch (error) {
      console.error("Error:", error);
      setError("No se pudo cargar el ticket");
    } finally {
      setLoading(false);
    }
  }, [id, router, ticket, mensajes.length]);

  useEffect(() => {
    fetchTicket();
    const interval = setInterval(() => {
      if (!socketConnected) {
        fetchTicket();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchTicket, socketConnected]);

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen no puede exceder los 5MB");
        return;
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError("Formato no soportado. Use JPG, PNG o WEBP");
        return;
      }
      setImagen(file);
      setImagenPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const eliminarImagen = () => {
    setImagen(null);
    setImagenPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const enviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() && !imagen) {
      setError("Escribe un mensaje o adjunta una imagen");
      return;
    }

    setEnviando(true);
    setError("");
    setExito("");

    const formData = new FormData();
    if (nuevoMensaje.trim()) formData.append("mensaje", nuevoMensaje);
    if (imagen) formData.append("imagen", imagen);
    formData.append("es_para_cliente", "true");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/tickets/${id}/mensajes`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al enviar mensaje");
      }

      setNuevoMensaje("");
      eliminarImagen();
      setExito("Mensaje enviado");
      setTimeout(() => setExito(""), 3000);
      await fetchTicket();
      
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "mensaje_enviado", ticket_id: id }));
      }
      
      inputRef.current?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar mensaje");
    } finally {
      setEnviando(false);
    }
  };

  const actualizarTicket = async () => {
    if (!ticket) return;

    const updates: Partial<Ticket> = {};
    if (nuevoEstado && nuevoEstado !== ticket.estado) updates.estado = nuevoEstado as Ticket["estado"];
    if (nuevaPrioridad && nuevaPrioridad !== ticket.prioridad) updates.prioridad = nuevaPrioridad as Ticket["prioridad"];
    if (nuevoTitulo && nuevoTitulo !== ticket.titulo) updates.titulo = nuevoTitulo;

    if (Object.keys(updates).length === 0) {
      setEditandoEstado(false);
      setEditandoTitulo(false);
      return;
    }

    setGuardandoTicket(true);
    setError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/tickets/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error("Error al actualizar ticket");

      setTicket({ ...ticket, ...updates });
      setEditandoEstado(false);
      setEditandoTitulo(false);
      setExito("Ticket actualizado");
      setTimeout(() => setExito(""), 3000);
      await fetchTicket();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setGuardandoTicket(false);
    }
  };

  const terminarTicket = async () => {
    if (!ticket) return;
    
    if (!confirm("¿Estás seguro que deseas marcar este ticket como resuelto? El cliente podrá volver a abrirlo si tiene más preguntas.")) {
      return;
    }

    setTerminandoTicket(true);
    setError("");
    setExito("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/tickets/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "resuelto" }),
      });

      if (!response.ok) throw new Error("Error al marcar como resuelto");

      setExito("✓ Ticket marcado como resuelto");
      setTimeout(() => setExito(""), 3000);
      await fetchTicket();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al marcar como resuelto");
    } finally {
      setTerminandoTicket(false);
    }
  };

  const cerrarTicket = async () => {
    if (!ticket) return;
    
    if (!confirm("¿Estás seguro que deseas CERRAR este ticket? Una vez cerrado, el cliente NO podrá volver a abrirlo.")) {
      return;
    }

    setTerminandoTicket(true);
    setError("");
    setExito("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/tickets/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "cerrado" }),
      });

      if (!response.ok) throw new Error("Error al cerrar ticket");

      setExito("✓ Ticket cerrado definitivamente");
      setTimeout(() => setExito(""), 3000);
      await fetchTicket();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cerrar ticket");
    } finally {
      setTerminandoTicket(false);
    }
  };

  const getEstadoInfo = (estado: string) => {
    switch (estado) {
      case "abierto":
        return { color: "bg-yellow-500", border: "border-yellow-500", bgLight: "bg-yellow-50", text: "text-yellow-700", icono: <FaCircle className="text-yellow-500 text-xs animate-pulse" />, label: "Abierto" };
      case "en_proceso":
        return { color: "bg-blue-500", border: "border-blue-500", bgLight: "bg-blue-50", text: "text-blue-700", icono: <FaSpinner className="text-blue-500 text-xs animate-spin" />, label: "En Proceso" };
      case "resuelto":
        return { color: "bg-green-500", border: "border-green-500", bgLight: "bg-green-50", text: "text-green-700", icono: <FaCheck className="text-green-500 text-xs" />, label: "Resuelto" };
      case "cerrado":
        return { color: "bg-gray-500", border: "border-gray-500", bgLight: "bg-gray-50", text: "text-gray-700", icono: <FaBan className="text-gray-500 text-xs" />, label: "Cerrado" };
      default:
        return { color: "bg-gray-500", border: "border-gray-500", bgLight: "bg-gray-50", text: "text-gray-700", icono: <FaCircle className="text-gray-500 text-xs" />, label: estado };
    }
  };

  const getPrioridadInfo = (prioridad: string) => {
    switch (prioridad) {
      case "urgente":
        return { color: "bg-red-500", border: "border-red-500", bgLight: "bg-red-50", text: "text-red-700", label: "Urgente" };
      case "alta":
        return { color: "bg-orange-500", border: "border-orange-500", bgLight: "bg-orange-50", text: "text-orange-700", label: "Alta" };
      case "media":
        return { color: "bg-yellow-500", border: "border-yellow-500", bgLight: "bg-yellow-50", text: "text-yellow-700", label: "Media" };
      case "baja":
        return { color: "bg-green-500", border: "border-green-500", bgLight: "bg-green-50", text: "text-green-700", label: "Baja" };
      default:
        return { color: "bg-gray-500", border: "border-gray-500", bgLight: "bg-gray-50", text: "text-gray-700", label: prioridad };
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

  const formatFullDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-SV", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const downloadImage = (base64Url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = base64Url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando información del cliente...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <FaExclamationTriangle className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Ticket no encontrado</h2>
          <Link href="/panel/soporte" className="mt-4 inline-block text-blue-600 hover:underline">
            Volver al panel de tickets
          </Link>
        </div>
      </div>
    );
  }

  const estadoInfo = getEstadoInfo(ticket.estado);
  const prioridadInfo = getPrioridadInfo(ticket.prioridad);
  const puedeTerminar = ticket.estado !== "resuelto" && ticket.estado !== "cerrado";
  const puedeCerrar = ticket.estado === "resuelto";

  return (
    <div className="text-black min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header con botón volver y controles de notificaciones */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/panel/soporte"
            className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors group"
          >
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Volver a tickets</span>
          </Link>
          <div className="flex items-center gap-2">
            {notificacionPermiso === "default" && (
              <button
                onClick={solicitarPermisoNotificacion}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
              >
                <FaBell /> Activar
              </button>
            )}
            <button
              onClick={() => setSonidoActivo(!sonidoActivo)}
              className="p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
              title={sonidoActivo ? "Silenciar" : "Activar sonido"}
            >
              {sonidoActivo ? <FaVolumeUp className="text-lg" /> : <FaVolumeMute className="text-lg text-gray-400" />}
            </button>
            {socketConnected && (
              <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Tiempo real
              </span>
            )}
          </div>
        </div>

        {/* Grid de dos columnas: Información del cliente + Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda: Información del Cliente */}
          <div className="lg:col-span-1 space-y-4">
            {/* Info de la Empresa */}
            {ticket.empresa && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <FaBuilding className="text-white" />
                    <h3 className="font-semibold text-white">Información de la Empresa</h3>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <FaBuilding className="text-blue-500 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Razón Social</p>
                      <p className="font-medium text-gray-800">{ticket.empresa.nombre}</p>
                    </div>
                  </div>
                  {ticket.empresa.nombrecomercial && (
                    <div className="flex items-start gap-3">
                      <FaStore className="text-blue-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Nombre Comercial</p>
                        <p className="font-medium text-gray-800">{ticket.empresa.nombrecomercial}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <FaIdCard className="text-blue-500 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">NIT</p>
                      <p className="font-mono text-gray-800">{ticket.empresa.nit}</p>
                    </div>
                  </div>
                  {ticket.empresa.nrc && (
                    <div className="flex items-start gap-3">
                      <FaIdCard className="text-blue-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">NRC</p>
                        <p className="font-mono text-gray-800">{ticket.empresa.nrc}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <FaEnvelope className="text-blue-500 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Correo Electrónico</p>
                      <p className="text-gray-800 break-all">{ticket.empresa.correo}</p>
                    </div>
                  </div>
                  {ticket.empresa.telefono && (
                    <div className="flex items-start gap-3">
                      <FaPhone className="text-blue-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Teléfono</p>
                        <p className="text-gray-800">{ticket.empresa.telefono}</p>
                      </div>
                    </div>
                  )}
                  {ticket.empresa.giro && (
                    <div className="flex items-start gap-3">
                      <FaBriefcase className="text-blue-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Giro Comercial</p>
                        <p className="text-gray-800">{ticket.empresa.giro}</p>
                      </div>
                    </div>
                  )}
                  {ticket.empresa.departamento && ticket.empresa.municipio && (
                    <div className="flex items-start gap-3">
                      <FaMapMarkerAlt className="text-blue-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Ubicación</p>
                        <p className="text-gray-800">{ticket.empresa.departamento} / {ticket.empresa.municipio}</p>
                      </div>
                    </div>
                  )}
                  {ticket.empresa.ambiente && (
                    <div className="flex items-start gap-3">
                      <FaGlobe className="text-blue-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Ambiente</p>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ticket.empresa.ambiente === "01" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {ticket.empresa.ambiente === "01" ? "Producción" : "Pruebas"}
                        </span>
                      </div>
                    </div>
                  )}
                  {ticket.empresa.codactividad && (
                    <div className="flex items-start gap-3">
                      <FaInfoCircle className="text-blue-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Código Actividad</p>
                        <p className="text-gray-800">{ticket.empresa.codactividad} - {ticket.empresa.desactividad}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Info del Empleado que creó el ticket */}
            {ticket.empleado_creador && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <FaUserTie className="text-white" />
                    <h3 className="font-semibold text-white">Empleado que reporta</h3>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <FaUser className="text-green-500 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Nombre</p>
                      <p className="font-medium text-gray-800">{ticket.empleado_creador.nombre}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaEnvelope className="text-green-500 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Correo</p>
                      <p className="text-gray-800">{ticket.empleado_creador.correo}</p>
                    </div>
                  </div>
                  {ticket.empleado_creador.numerodocumento && (
                    <div className="flex items-start gap-3">
                      <FaIdCard className="text-green-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Documento</p>
                        <p className="font-mono text-gray-800">
                          {ticket.empleado_creador.tipodocumento === "01" ? "DUI" : 
                           ticket.empleado_creador.tipodocumento === "02" ? "NIT" : 
                           ticket.empleado_creador.tipodocumento === "03" ? "Pasaporte" : "Otro"}: {ticket.empleado_creador.numerodocumento}
                        </p>
                      </div>
                    </div>
                  )}
                  {ticket.empleado_creador.telefono && (
                    <div className="flex items-start gap-3">
                      <FaPhone className="text-green-500 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Teléfono</p>
                        <p className="text-gray-800">{ticket.empleado_creador.telefono}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <FaFlag className="text-green-500 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Rol</p>
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {ticket.empleado_creador.rol}
                      </span>
                    </div>
                  </div>
                  
                  {/* Información de la Sucursal del empleado */}
                  {ticket.empleado_creador.sucursal && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                        <FaStore className="text-xs" /> Sucursal donde trabaja
                      </p>
                      <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                        <p className="font-medium text-gray-800">{ticket.empleado_creador.sucursal.nombre}</p>
                        {ticket.empleado_creador.sucursal.complemento && (
                          <p className="text-xs text-gray-500">{ticket.empleado_creador.sucursal.complemento}</p>
                        )}
                        {ticket.empleado_creador.sucursal.telefono && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <FaPhone className="text-[10px]" /> {ticket.empleado_creador.sucursal.telefono}
                          </p>
                        )}
                        {ticket.empleado_creador.sucursal.departamento && ticket.empleado_creador.sucursal.municipio && (
                          <p className="text-xs text-gray-500">
                            {ticket.empleado_creador.sucursal.departamento} / {ticket.empleado_creador.sucursal.municipio}
                          </p>
                        )}
                        {ticket.empleado_creador.sucursal.codestablemh && (
                          <p className="text-xs text-gray-400 font-mono">
                            Establecimiento MH: {ticket.empleado_creador.sucursal.codestablemh} - Punto Venta: {ticket.empleado_creador.sucursal.codpuntoventamh}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Info del Ticket */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-5 py-3">
                <div className="flex items-center gap-2">
                  <FaTicketAlt className="text-white" />
                  <h3 className="font-semibold text-white">Detalles del Ticket</h3>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <FaCalendarAlt className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Creado</p>
                    <p className="text-gray-800">{formatFullDate(ticket.created_at)}</p>
                  </div>
                </div>
                {ticket.fecha_cierre && (
                  <div className="flex items-start gap-3">
                    <FaClock className="text-gray-500 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Cerrado</p>
                      <p className="text-gray-800">{formatFullDate(ticket.fecha_cierre)}</p>
                    </div>
                  </div>
                )}
                {ticket.categoria && (
                  <div className="flex items-start gap-3">
                    <FaInfoCircle className="text-gray-500 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Categoría</p>
                      <p className="text-gray-800">{ticket.categoria}</p>
                    </div>
                  </div>
                )}
                {ticket.descripcion && (
                  <div className="flex items-start gap-3">
                    <FaComment className="text-gray-500 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Descripción inicial</p>
                      <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{ticket.descripcion}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Chat */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-full p-2">
                    <FaHeadset className="text-white text-lg" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">Conversación con el cliente</h2>
                    <p className="text-xs text-blue-100 flex items-center gap-1">
                      {ticket.empleado_creador?.nombre || "Cliente"}
                      {socketConnected && (
                        <span className="flex items-center gap-1 ml-2">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                          <span className="text-xs">Tiempo real</span>
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {ticket.estado === "resuelto" && (
                    <span className="text-xs bg-green-500/20 text-green-100 px-3 py-1 rounded-full">
                      Resuelto
                    </span>
                  )}
                  {ticket.estado === "cerrado" && (
                    <span className="text-xs bg-gray-500/20 text-gray-200 px-3 py-1 rounded-full">
                      Cerrado
                    </span>
                  )}
                </div>
              </div>

              {/* Área de mensajes */}
              <div 
                ref={chatContainerRef}
                className="h-[550px] overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-gray-50 to-white"
              >
                {mensajes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <FaComment className="text-blue-500 text-3xl" />
                    </div>
                    <p className="text-gray-500 font-medium">No hay mensajes aún</p>
                    <p className="text-sm text-gray-400 mt-1">Escribe el primer mensaje para iniciar la conversación</p>
                  </div>
                ) : (
                  mensajes.map((msg, idx) => {
                    const esSoporte = msg.remitente_tipo === "soporte";
                    const isNew = idx === mensajes.length - 1 && nuevosMensajes && !esSoporte;
                    return (
                      <div
                        key={msg.id || idx}
                        className={`flex ${esSoporte ? "justify-end" : "justify-start"} animate-fadeIn`}
                      >
                        <div className={`max-w-[85%] ${esSoporte ? "order-2" : "order-1"}`}>
                          <div className={`flex items-center gap-2 mb-1 ${esSoporte ? "justify-end" : "justify-start"}`}>
                            <span className="text-xs font-medium text-gray-500">
                              {esSoporte ? "Tú (Soporte)" : ticket.empleado_creador?.nombre || "Cliente"}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <FaRegClock className="text-[10px]" />
                              {formatDate(msg.created_at)}
                            </span>
                          </div>
                          <div
                            className={`p-3 rounded-2xl shadow-sm ${
                              esSoporte
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none"
                                : "bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200"
                            }`}
                          >
                            {msg.mensaje && (
                              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                {msg.mensaje}
                              </p>
                            )}
                            {msg.imagen_url && (
                              <div className="mt-2 group relative">
                                <img
                                  src={msg.imagen_url}
                                  alt="Adjunto"
                                  className="max-w-[280px] max-h-[200px] rounded-xl cursor-pointer hover:opacity-95 transition-opacity shadow-md"
                                  onClick={() => setImagenModal(msg.imagen_url!)}
                                />
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setImagenModal(msg.imagen_url!);
                                    }}
                                    className="bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
                                    title="Ver en grande"
                                  >
                                    <FaExpand size={12} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      downloadImage(msg.imagen_url!, `adjunto_${msg.id}.jpg`);
                                    }}
                                    className="bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
                                    title="Descargar"
                                  >
                                    <FaDownload size={12} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          {isNew && (
                            <div className="flex justify-end mt-1">
                              <span className="text-xs text-blue-500 animate-pulse">Nuevo</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Formulario de respuesta */}
              <div className="border-t border-gray-200 bg-white p-4">
                {error && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2 animate-shake">
                    <FaExclamationTriangle className="text-red-500" />
                    <span>{error}</span>
                  </div>
                )}
                {exito && (
                  <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm flex items-center gap-2">
                    <FaCheckCircle className="text-green-500" />
                    <span>{exito}</span>
                  </div>
                )}

                {imagenPreview && (
                  <div className="mb-3 relative inline-block">
                    <img
                      src={imagenPreview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-xl border-2 border-blue-500 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={eliminarImagen}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                    >
                      ×
                    </button>
                  </div>
                )}

                {ticket.estado === "cerrado" ? (
                  <div className="text-center p-5 bg-gray-50 rounded-xl text-gray-500">
                    <FaBan className="inline mr-2 text-gray-400" />
                    Este ticket está cerrado. No se pueden enviar más mensajes.
                  </div>
                ) : (
                  <form onSubmit={enviarMensaje} className="relative">
                    <div className="flex gap-2 items-end">
                      <textarea
                        ref={inputRef}
                        value={nuevoMensaje}
                        onChange={(e) => setNuevoMensaje(e.target.value)}
                        placeholder={
                          ticket.estado === "resuelto" 
                            ? "El ticket está resuelto, puedes agregar una nota adicional..." 
                            : "Escribe tu respuesta aquí..."
                        }
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm bg-gray-50 focus:bg-white transition-all"
                        rows={2}
                        disabled={enviando}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            enviarMensaje(e);
                          }
                        }}
                      />
                      <div className="flex gap-1">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImagenChange}
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          id="imagen-input"
                        />
                        <label
                          htmlFor="imagen-input"
                          className="p-3 text-gray-500 hover:text-blue-600 cursor-pointer rounded-xl hover:bg-gray-100 transition-colors"
                          title="Adjuntar imagen"
                        >
                          <FaImage className="text-lg" />
                        </label>
                        <button
                          type="submit"
                          disabled={enviando}
                          className="px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {enviando ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            <FaPaperPlane />
                          )}
                          <span className="hidden sm:inline">Enviar</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 ml-1">
                      {ticket.estado === "resuelto" 
                        ? "💡 Puedes agregar notas adicionales aunque el ticket esté resuelto"
                        : "💡 Presiona Enter para enviar, Shift+Enter para nueva línea"}
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para visualizar imágenes en grande */}
      {imagenModal && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setImagenModal(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={imagenModal}
              alt="Imagen ampliada"
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            />
            <button
              onClick={() => setImagenModal(null)}
              className="absolute -top-10 -right-10 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
            >
              <FaTimes size={24} />
            </button>
            <button
              onClick={() => downloadImage(imagenModal, "imagen.jpg")}
              className="absolute -bottom-10 right-0 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
            >
              <FaDownload size={20} />
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}