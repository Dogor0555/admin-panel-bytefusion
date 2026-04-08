//app/panel/configurar-permisos/page.tsx

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface PermisoCatalogo {
  id: number;
  nombre: string;
}

interface DetalleUsuario {
  id_detalle: number;
  id_usuario: number;
  codactividad1?: number;
  desactividad1?: string;
  codactividad2?: number;
  desactividad2?: string;
  codactividad3?: number;
  desactividad3?: string;
  permisos: string[];
  usuario: {
    id: number;
    nombre: string;
  };
}

interface LimiteEmision {
  id_limite: number;
  id_usuario: number;
  cantidad_maxima: number;
  contador_emitidos: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

interface Sucursal {
  idsucursal: number;
  nombre: string;
  complemento?: string;
  telefono?: string;
  codestablemh?: string;
  codpuntoventamh?: string;
}

const initialSucursalState = {
  nombre: "",
  telefono: "",
  complemento: "",
  codestablemh: "",
  codpuntoventamh: "",
};

const initialAdminState = {
  nombre: "",
  apellido: "",
  tipodocumento: "01",
  numerodocumento: "",
  correo: "",
  contrasena: "",
  telefono: "",
  rol: "Admin",
  idsucursal: 0,
};

const tiposDocumento = [
  { codigo: "01", nombre: "DUI" },
  { codigo: "02", nombre: "NIT" },
  { codigo: "03", nombre: "Pasaporte" },
  { codigo: "04", nombre: "Carnet de Residente" },
  { codigo: "99", nombre: "Otro" },
];

// Componente de carga
function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <svg className="animate-spin h-8 w-8 text-gray-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-2 text-gray-600">Cargando datos del usuario...</p>
      </div>
    </div>
  );
}

// Componente principal que usa useSearchParams
function ConfigurarPermisosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const usuarioId = searchParams.get('usuarioId');

  const [permisosCatalogo, setPermisosCatalogo] = useState<PermisoCatalogo[]>([]);
  const [detalleUsuario, setDetalleUsuario] = useState<DetalleUsuario | null>(null);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [showCrearSucursalModal, setShowCrearSucursalModal] = useState(false);
  const [showCrearAdminModal, setShowCrearAdminModal] = useState(false);
  const [showListSucursalesModal, setShowListSucursalesModal] = useState(false);
  const [showListAdminsModal, setShowListAdminsModal] = useState(false);
  const [nuevaSucursal, setNuevaSucursal] = useState(initialSucursalState);
  const [nuevoAdmin, setNuevoAdmin] = useState(initialAdminState);
  const [editingSucursalId, setEditingSucursalId] = useState<number | null>(null);
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [editingEmpleadoId, setEditingEmpleadoId] = useState<number | null>(null);
  const [ambiente, setAmbiente] = useState("00");

  const [limiteUsuario, setLimiteUsuario] = useState<LimiteEmision | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mostrarFormularioLimite, setMostrarFormularioLimite] = useState(false);
  const [formularioLimite, setFormularioLimite] = useState({
    cantidad_maxima: 100,
    fecha_inicio: "",
    fecha_fin: "",
    activo: true
  });

  useEffect(() => {
    if (usuarioId) {
      cargarDatos();
    }
  }, [usuarioId]);

  useEffect(() => {
    if (showCrearAdminModal || showListAdminsModal) {
      fetchEmpleados();
    }
  }, [showCrearAdminModal, showListAdminsModal]);

  useEffect(() => {
    const hoy = new Date();
    const inicio = hoy.toISOString().split('T')[0];
    const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 6, hoy.getDate()).toISOString().split('T')[0];
    
    setFormularioLimite(prev => ({
      ...prev,
      fecha_inicio: inicio,
      fecha_fin: fin
    }));
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");

      // Cargar catálogo de permisos
      const permisosResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/permisos-catalogo/getAll`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!permisosResponse.ok) {
        throw new Error(`Error al cargar permisos: ${permisosResponse.status} ${permisosResponse.statusText}`);
      }

      const permisosData = await permisosResponse.json();
      setPermisosCatalogo(permisosData);

      // Cargar ambiente del usuario
      const usuariosResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios/getAllUsu`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (usuariosResponse.ok) {
        const usuariosData = await usuariosResponse.json();
        if (usuariosData.data && Array.isArray(usuariosData.data)) {
          const usuarioActual = usuariosData.data.find((u: any) => u.id === parseInt(usuarioId!));
          if (usuarioActual) setAmbiente(usuarioActual.ambiente || "00");
        }
      }

      const detalleResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/detalle-usuario/usuario/${usuarioId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!detalleResponse.ok) {
        setDetalleUsuario(null);
        setPermisosSeleccionados([]);
      } else {
        const detalleData = await detalleResponse.json();

        if (detalleData && detalleData.length > 0) {
          const detalle = detalleData[0];
          setDetalleUsuario(detalle);
          setPermisosSeleccionados(detalle.permisos || []);
        } else {
          setDetalleUsuario(null);
          setPermisosSeleccionados([]);
        }
      }

      const limitesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/limites-emision/usuario/${usuarioId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (limitesResponse.ok) {
        const limitesData = await limitesResponse.json();
        
        if (limitesData.success && limitesData.data && limitesData.data.length > 0) {
          const limite = limitesData.data[0];
          setLimiteUsuario(limite);
          
          setFormularioLimite({
            cantidad_maxima: limite.cantidad_maxima,
            fecha_inicio: limite.fecha_inicio.split('T')[0],
            fecha_fin: limite.fecha_fin.split('T')[0],
            activo: limite.activo
          });
        } else {
          setLimiteUsuario(null);
        }
      }

      const sucursalesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sucursal/usuario/${usuarioId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (sucursalesResponse.ok) {
        const sucursalesData = await sucursalesResponse.json();
        if (sucursalesData.ok) {
          setSucursales(sucursalesData.data);
        }
      }

    } catch (err: unknown) {
      console.error("Error en cargarDatos:", err);
      if (err instanceof Error) setError(err.message);
      else setError("Error al cargar los datos. Verifica tu conexión y autenticación.");
    } finally {
      setLoading(false);
    }
  };

  const handleCrearSucursal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioId) return;
    setGuardando(true);
    setError("");
    try {
      let response;
      if (editingSucursalId) {
        // Actualizar sucursal
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sucursal/update/${editingSucursalId}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevaSucursal),
        });
      } else {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sucursal/create`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...nuevaSucursal, usuarioid: parseInt(usuarioId) }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al guardar la sucursal');
      }

      await cargarDatos();
      setShowCrearSucursalModal(false);
      setNuevaSucursal(initialSucursalState);
      setEditingSucursalId(null);

    } catch (err: unknown) {
      console.error("Error al crear/actualizar sucursal:", err);
      if (err instanceof Error) setError(err.message);
      else setError("Ocurrió un error desconocido al crear/actualizar la sucursal.");
    } finally {
      setGuardando(false);
    }
  };

  const handleCrearAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevoAdmin.idsucursal === 0) {
      setError("Debe seleccionar una sucursal para el administrador.");
      return;
    }
    setGuardando(true);
    setError("");
    try {
      let response;
      if (editingEmpleadoId) {
        // Actualizar empleado
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/empleados/update/${editingEmpleadoId}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: `${nuevoAdmin.nombre} ${nuevoAdmin.apellido}`.trim(),
            tipodocumento: nuevoAdmin.tipodocumento,
            numerodocumento: nuevoAdmin.numerodocumento,
            correo: nuevoAdmin.correo,
            contrasena: nuevoAdmin.contrasena,
            idsucursal: nuevoAdmin.idsucursal,
            rol: nuevoAdmin.rol,
            estado: true,
          }),
        });
      } else {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/empleados/add`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: `${nuevoAdmin.nombre} ${nuevoAdmin.apellido}`.trim(),
            tipodocumento: nuevoAdmin.tipodocumento,
            numerodocumento: nuevoAdmin.numerodocumento,
            correo: nuevoAdmin.correo,
            contrasena: nuevoAdmin.contrasena,
            idsucursal: nuevoAdmin.idsucursal,
            rol: nuevoAdmin.rol,
            estado: true,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al crear/actualizar el administrador');
      }

      // Refrescar empleados y cerrar modal
      await fetchEmpleados();
      setShowCrearAdminModal(false);
      setNuevoAdmin(initialAdminState);
      setEditingEmpleadoId(null);

    } catch (err: unknown) {
      console.error("Error al crear/actualizar administrador:", err);
      if (err instanceof Error) setError(err.message);
      else setError("Ocurrió un error desconocido al crear/actualizar el administrador.");
    } finally {
      setGuardando(false);
    }
  };

  const fetchEmpleados = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/empleados/admins`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data)
          ? data
          : (Array.isArray(data.empleados) ? data.empleados : (data.data || []));
        setEmpleados(items);
      }
    } catch (err) {
      console.error('Error cargando empleados:', err);
    }
  };

  const handleEliminarSucursal = async (idsucursal:number) => {
    if (!confirm('¿Eliminar sucursal? Esta acción es irreversible.')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sucursal/delete/${idsucursal}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Error al eliminar sucursal');
      await cargarDatos();
    } catch (err) {
      console.error(err);
      setError((err as Error).message || 'Error al eliminar sucursal');
    }
  };

  const handleEditarSucursal = (sucursal: any) => {
    setNuevaSucursal({
      nombre: sucursal.nombre || '',
      telefono: sucursal.telefono || '',
      complemento: sucursal.complemento || '',
      codestablemh: sucursal.codestablemh || '',
      codpuntoventamh: sucursal.codpuntoventamh || ''
    });
    setEditingSucursalId(sucursal.idsucursal || null);
  };

  const handleEliminarAdmin = async (idempleado:number) => {
    if (!confirm('¿Eliminar administrador?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/empleados/delete/${idempleado}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Error al eliminar administrador');
      await fetchEmpleados();
    } catch (err) {
      console.error(err);
      setError((err as Error).message || 'Error al eliminar administrador');
    }
  };

  const handleEditarAdmin = (empleado:any) => {
    // separar nombre en nombre/apellido simple
    const parts = (empleado.nombre || '').split(' ');
    setNuevoAdmin({
      ...nuevoAdmin,
      nombre: parts.shift() || '',
      apellido: parts.join(' ') || '',
      tipodocumento: empleado.tipodocumento || '01',
      numerodocumento: empleado.numerodocumento || '',
      correo: empleado.correo || '',
      telefono: empleado.telefono || '',
      idsucursal: empleado.idsucursal || 0,
      rol: empleado.rol || 'Admin'
    });
    setEditingEmpleadoId(empleado.idempleado || null);
  };

  const handleToggleAmbiente = async () => {
    if (!usuarioId) return;
    const nuevoAmbiente = ambiente === "01" ? "00" : "01";
    const textoAmbiente = nuevoAmbiente === "01" ? "PRODUCCIÓN" : "PRUEBAS";
    
    if (!confirm(`¿Estás seguro de cambiar el ambiente a ${textoAmbiente}?`)) {
      return;
    }

    setGuardando(true);
    setError("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/usuarios/updateUsu/${usuarioId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ambiente: nuevoAmbiente }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al cambiar el ambiente');
      }

      setAmbiente(nuevoAmbiente);
    } catch (err: unknown) {
      console.error("Error al cambiar ambiente:", err);
      if (err instanceof Error) setError(err.message);
      else setError("Error desconocido al cambiar ambiente.");
    } finally {
      setGuardando(false);
    }
  };

  const handleTogglePermiso = (permisoNombre: string) => {
    setPermisosSeleccionados(prev => {
      if (prev.includes(permisoNombre)) {
        return prev.filter(p => p !== permisoNombre);
      } else {
        return [...prev, permisoNombre];
      }
    });
  };

  const handleToggleTodos = () => {
    if (permisosSeleccionados.length === permisosCatalogo.length) {
      setPermisosSeleccionados([]);
    } else {
      setPermisosSeleccionados(permisosCatalogo.map(p => p.nombre));
    }
  };

  const handleGuardarLimite = async () => {
    try {
      if (!formularioLimite.fecha_inicio || !formularioLimite.fecha_fin) {
        setError("Por favor, completa todas las fechas del límite");
        return;
      }

      if (new Date(formularioLimite.fecha_fin) <= new Date(formularioLimite.fecha_inicio)) {
        setError("La fecha de fin debe ser posterior a la fecha de inicio");
        return;
      }

      setGuardando(true);
      setError("");

      const datosLimite = {
        id_usuario: parseInt(usuarioId!),
        cantidad_maxima: formularioLimite.cantidad_maxima,
        fecha_inicio: formularioLimite.fecha_inicio,
        fecha_fin: formularioLimite.fecha_fin,
        activo: formularioLimite.activo
      };

      let response;

      if (limiteUsuario) {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/limites-emision/${limiteUsuario.id_limite}`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosLimite),
        });
      } else {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/limites-emision`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosLimite),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al guardar el límite: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      await cargarDatos();
      
      setMostrarFormularioLimite(false);
      setError("");

    } catch (err: unknown) {
      console.error("Error al guardar límite:", err);
      if (err instanceof Error) setError(err.message);
      else setError("Error al guardar el límite de emisión");
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleLimiteActivo = async () => {
    if (!limiteUsuario) return;

    if (limiteUsuario.activo) {
      if (!confirm("¿Estás seguro de que deseas deshabilitar la emisión de DTE para este usuario? Esta acción impedirá que pueda generar nuevos documentos.")) {
        return;
      }
    }

    try {
      setGuardando(true);
      setError("");

      const datosParaApi = {
        id_usuario: limiteUsuario.id_usuario,
        cantidad_maxima: limiteUsuario.cantidad_maxima,
        fecha_inicio: limiteUsuario.fecha_inicio.split('T')[0],
        fecha_fin: limiteUsuario.fecha_fin.split('T')[0],
        activo: !limiteUsuario.activo
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/limites-emision/${limiteUsuario.id_limite}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosParaApi),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al cambiar estado del límite: ${response.status} ${response.statusText} - ${errorText}`);
      }

      setLimiteUsuario(prev => prev ? { ...prev, activo: !prev.activo } : null);

    } catch (err: unknown) {
      console.error("Error al cambiar estado del límite:", err);
      if (err instanceof Error) setError(err.message);
      else setError("Error al cambiar el estado del límite");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarLimite = async () => {
    if (!limiteUsuario) return;
    
    if (!confirm("¿Estás seguro de que deseas eliminar el límite de emisión de este usuario?")) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/limites-emision/${limiteUsuario.id_limite}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el límite");
      }

      setLimiteUsuario(null);
      
      const hoy = new Date();
      const inicio = hoy.toISOString().split('T')[0];
      const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 6, hoy.getDate()).toISOString().split('T')[0];
      
      setFormularioLimite({
        cantidad_maxima: 100,
        fecha_inicio: inicio,
        fecha_fin: fin,
        activo: true
      });
      
    } catch (err: unknown) {
      console.error("Error al eliminar límite:", err);
      if (err instanceof Error) setError(err.message);
      else setError("Error al eliminar el límite");
    }
  };

  const handleGuardarPermisos = async () => {
    try {
      setGuardando(true);
      setError("");

      const datosActualizacion = {
        id_usuario: parseInt(usuarioId!),
        permisos: permisosSeleccionados
      };

      let response;
      
      if (detalleUsuario?.id_detalle && detalleUsuario.id_detalle > 0) {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/detalle-usuario/update/${detalleUsuario.id_detalle}`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosActualizacion),
        });
      } else {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/detalle-usuario/add`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosActualizacion),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al guardar los permisos: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      setError("");
      
    } catch (err: unknown) {
      console.error("Error al guardar:", err);
      if (err instanceof Error) setError(err.message);
      else setError("Error al guardar los permisos");
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = () => {
    router.push('/panel');
  };

  const handleRecargar = () => {
    cargarDatos();
  };

  const formatFecha = (fecha: string) => {
    const fechaUTC = new Date(fecha.split('T')[0] + 'T00:00:00');
    return fechaUTC.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  if (loading) {
    return <Loading />;
  }

  if (!usuarioId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">No se especificó un usuario</p>
          <button
            onClick={() => router.push('/panel')}
            className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
          >
            Volver al Panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-black min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Configurar Usuario
              </h1>
              <p className="mt-1 text-gray-600">
                Usuario ID: <span className="font-semibold">{usuarioId}</span>
                {detalleUsuario?.usuario && (
                  <span> - {detalleUsuario.usuario.nombre}</span>
                )}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleRecargar}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Recargar
              </button>
              <button
                onClick={handleCancelar}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Volver al Panel
              </button>
            </div>
          </div>
          <div className="mt-4 border-t border-gray-200 pt-4 flex space-x-3">
            <button
              onClick={handleToggleAmbiente}
              disabled={guardando}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                ambiente === "01" 
                  ? "bg-purple-600 hover:bg-purple-700 focus:ring-purple-500" 
                  : "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500"
              }`}
            >
              {ambiente === "01" ? "Ambiente: Producción" : "Ambiente: Pruebas"}
            </button>
            <button
              onClick={() => setShowListSucursalesModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sucursales
            </button>
            <button
              onClick={() => setShowListAdminsModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Administradores
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <button
                  onClick={handleRecargar}
                  className="mt-2 text-sm text-red-800 underline hover:text-red-900"
                >
                  Intentar de nuevo
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Límite de Emisión DTE
              {limiteUsuario && (
                <span className="ml-2 text-sm font-normal text-gray-600">
                  (Configuración Actual)
                </span>
              )}
            </h2>
            <div className="flex space-x-2">
              {limiteUsuario && (
                <button
                  onClick={handleToggleLimiteActivo}
                  title={limiteUsuario.activo ? "Impide que este usuario emita DTEs" : "Permite que este usuario emita DTEs"}
                  disabled={guardando}
                  className={`px-3 py-1 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                    limiteUsuario.activo
                      ? 'text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500'
                      : 'text-green-700 bg-green-100 hover:bg-green-200 focus:ring-green-500'
                  }`}
                >
                  {guardando ? '...' : (limiteUsuario.activo ? 'Deshabilitar Emisión' : 'Habilitar Emisión')}
                </button>
              )}
              {limiteUsuario && (
                <button
                  onClick={handleEliminarLimite}
                  className="px-3 py-1 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Eliminar Límite
                </button>
              )}
              <button
                onClick={() => setMostrarFormularioLimite(!mostrarFormularioLimite)}
                className="px-3 py-1 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                {mostrarFormularioLimite ? 'Cancelar Edición' : limiteUsuario ? 'Editar Límite' : 'Configurar Límite'}
              </button>
            </div>
          </div>

          {limiteUsuario && !mostrarFormularioLimite && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-700">Cantidad Máxima</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {limiteUsuario.cantidad_maxima.toLocaleString()} DTE
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">DTE Emitidos</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {limiteUsuario.contador_emitidos.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Estado Emisión de DTE</p>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    limiteUsuario.activo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {limiteUsuario.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="md:col-span-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Progreso de Emisión</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${(limiteUsuario.contador_emitidos / limiteUsuario.cantidad_maxima) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {((limiteUsuario.contador_emitidos / limiteUsuario.cantidad_maxima) * 100).toFixed(2)}% usado
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Fecha Inicio</p>
                  <p className="text-gray-900">{formatFecha(limiteUsuario.fecha_inicio)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Fecha Fin</p>
                  <p className="text-gray-900">{formatFecha(limiteUsuario.fecha_fin)}</p>
                </div>
              </div>
            </div>
          )}

          {mostrarFormularioLimite && (
            <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-md font-medium text-gray-900 mb-3">
                {limiteUsuario ? 'Editar Límite de Emisión' : 'Nuevo Límite de Emisión'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad Máxima
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formularioLimite.cantidad_maxima}
                    onChange={(e) => setFormularioLimite(prev => ({ ...prev, cantidad_maxima: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activo
                  </label>
                  <div className="mt-2">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={formularioLimite.activo}
                        onChange={(e) => setFormularioLimite(prev => ({ ...prev, activo: e.target.checked }))}
                        className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Habilitado</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={formularioLimite.fecha_inicio}
                    onChange={(e) => setFormularioLimite(prev => ({ ...prev, fecha_inicio: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    value={formularioLimite.fecha_fin}
                    onChange={(e) => setFormularioLimite(prev => ({ ...prev, fecha_fin: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => setMostrarFormularioLimite(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarLimite}
                  disabled={guardando}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  {guardando ? 'Guardando...' : (limiteUsuario ? 'Actualizar Límite' : 'Crear Límite')}
                </button>
              </div>
            </div>
          )}

          {!limiteUsuario && !mostrarFormularioLimite && (
            <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Sin límite configurado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Este usuario no tiene un límite de emisión DTE configurado.
              </p>
              <button
                onClick={() => setMostrarFormularioLimite(true)}
                className="mt-3 px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Configurar Límite
              </button>
            </div>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Permisos seleccionados
              </p>
              <p className="text-sm text-gray-500">
                {permisosSeleccionados.length} de {permisosCatalogo.length} permisos
              </p>
            </div>
            <button
              onClick={handleToggleTodos}
              disabled={permisosCatalogo.length === 0}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              {permisosSeleccionados.length === permisosCatalogo.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Permisos del Sistema
            </h2>
            
            {permisosCatalogo.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay permisos disponibles</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No se pudieron cargar los permisos del catálogo.
                </p>
                <button
                  onClick={handleRecargar}
                  className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {permisosCatalogo.map((permiso) => (
                  <div
                    key={permiso.id}
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                  >
                    <input
                      type="checkbox"
                      id={`permiso-${permiso.id}`}
                      checked={permisosSeleccionados.includes(permiso.nombre)}
                      onChange={() => handleTogglePermiso(permiso.nombre)}
                      className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`permiso-${permiso.id}`}
                      className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      {permiso.nombre}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelar}
                disabled={guardando}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarPermisos}
                disabled={guardando || permisosCatalogo.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
              >
                {guardando ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  'Guardar Configuración'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showListSucursalesModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto w-full max-w-3xl bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Sucursales</h3>
                    <p className="text-sm text-gray-500">Lista de sucursales asociadas al usuario</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setShowListSucursalesModal(false); }} className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cerrar</button>
                    <button onClick={() => { setNuevaSucursal(initialSucursalState); setEditingSucursalId(null); setShowCrearSucursalModal(true); }} className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Crear</button>
                  </div>
                </div>
                <div className="mt-5">
                  <div className="space-y-3 max-h-72 overflow-auto">
                    {sucursales.length === 0 ? (
                      <p className="text-sm text-gray-500">No hay sucursales.</p>
                    ) : (
                      sucursales.map(s => (
                        <div key={s.idsucursal} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg bg-gray-50">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{s.nombre}</p>
                            <p className="text-xs text-gray-500">{s.complemento}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => { handleEditarSucursal(s); setShowCrearSucursalModal(true); }} className="px-3 py-1 text-sm font-medium text-gray-800 bg-yellow-100 rounded-md hover:bg-yellow-200">Editar</button>
                            <button onClick={() => handleEliminarSucursal(s.idsucursal)} className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Borrar</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
        </div>
      )}

      {showCrearSucursalModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{editingSucursalId ? 'Editar Sucursal' : 'Crear Sucursal'}</h3>
              <button onClick={() => { setShowCrearSucursalModal(false); setEditingSucursalId(null); setNuevaSucursal(initialSucursalState); }} className="px-3 py-1 text-sm bg-gray-200 rounded">Cerrar</button>
            </div>
            <form onSubmit={handleCrearSucursal} className="mt-4 grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input type="text" required value={nuevaSucursal.nombre} onChange={e => setNuevaSucursal({...nuevaSucursal, nombre: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input type="text" value={nuevaSucursal.telefono} onChange={e => setNuevaSucursal({...nuevaSucursal, telefono: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dirección / Complemento</label>
                <input type="text" value={nuevaSucursal.complemento} onChange={e => setNuevaSucursal({...nuevaSucursal, complemento: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
              </div>
              <div className="flex justify-end space-x-2 mt-3">
                <button type="button" onClick={() => { setShowCrearSucursalModal(false); setNuevaSucursal(initialSucursalState); setEditingSucursalId(null); }} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                <button type="submit" disabled={guardando} className="px-4 py-2 bg-gray-800 text-white rounded">{guardando ? 'Guardando...' : (editingSucursalId ? 'Actualizar' : 'Crear')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showListAdminsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto w-full max-w-3xl bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Administradores</h3>
                <p className="text-sm text-gray-500">Lista de administradores del sistema</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setShowListAdminsModal(false); }} className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cerrar</button>
                <button onClick={() => { setNuevoAdmin(initialAdminState); setEditingEmpleadoId(null); setShowCrearAdminModal(true); }} className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Crear</button>
              </div>
            </div>
            <div className="mt-5">
              <div className="space-y-3 max-h-72 overflow-auto">
                {empleados.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay administradores.</p>
                ) : (
                  empleados.map(emp => (
                    <div key={emp.idempleado || emp.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg bg-gray-50">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{emp.nombre}</p>
                        <p className="text-xs text-gray-500">{emp.correo}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { handleEditarAdmin(emp); setShowCrearAdminModal(true); }} className="px-3 py-1 text-sm font-medium text-gray-800 bg-yellow-100 rounded-md hover:bg-yellow-200">Editar</button>
                        <button onClick={() => handleEliminarAdmin(emp.idempleado || emp.id)} className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Borrar</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showCrearAdminModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{editingEmpleadoId ? 'Editar Administrador' : 'Crear Administrador'}</h3>
              <button onClick={() => { setShowCrearAdminModal(false); setEditingEmpleadoId(null); setNuevoAdmin(initialAdminState); }} className="px-3 py-1 text-sm bg-gray-200 rounded">Cerrar</button>
            </div>
            <form onSubmit={handleCrearAdmin} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input type="text" required value={nuevoAdmin.nombre} onChange={e => setNuevoAdmin({...nuevoAdmin, nombre: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Apellido</label>
                <input type="text" required value={nuevoAdmin.apellido} onChange={e => setNuevoAdmin({...nuevoAdmin, apellido: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo Documento</label>
                <select required value={nuevoAdmin.tipodocumento} onChange={e => setNuevoAdmin({ ...nuevoAdmin, tipodocumento: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                  {tiposDocumento.map((tipo) => (
                    <option key={tipo.codigo} value={tipo.codigo}>{tipo.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Número Documento</label>
                <input type="text" required value={nuevoAdmin.numerodocumento} onChange={e => setNuevoAdmin({...nuevoAdmin, numerodocumento: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                <input type="email" required value={nuevoAdmin.correo} onChange={e => setNuevoAdmin({...nuevoAdmin, correo: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                <input type="password" value={nuevoAdmin.contrasena} onChange={e => setNuevoAdmin({...nuevoAdmin, contrasena: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input type="text" value={nuevoAdmin.telefono} onChange={e => setNuevoAdmin({...nuevoAdmin, telefono: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rol</label>
                <input type="text" readOnly value={nuevoAdmin.rol} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"/>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Asignar a Sucursal</label>
                <select required value={nuevoAdmin.idsucursal} onChange={e => setNuevoAdmin({...nuevoAdmin, idsucursal: parseInt(e.target.value)})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value={0} disabled>Seleccione una sucursal</option>
                  {sucursales.map(sucursal => (
                    <option key={sucursal.idsucursal} value={sucursal.idsucursal}>{sucursal.nombre}</option>
                  ))}
                </select>
                {sucursales.length === 0 && (
                  <p className="mt-2 text-sm text-yellow-600">No hay sucursales para este usuario. Por favor, cree una primero.</p>
                )}
              </div>

              <div className="md:col-span-2 flex justify-end space-x-2 mt-3">
                <button type="button" onClick={() => { setShowCrearAdminModal(false); setNuevoAdmin(initialAdminState); setEditingEmpleadoId(null); }} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
                <button type="submit" disabled={guardando || sucursales.length === 0} className="px-4 py-2 bg-gray-800 text-white rounded">{guardando ? 'Guardando...' : (editingEmpleadoId ? 'Actualizar' : 'Crear')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente principal exportado con Suspense
export default function ConfigurarPermisosPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ConfigurarPermisosContent />
    </Suspense>
  );
}