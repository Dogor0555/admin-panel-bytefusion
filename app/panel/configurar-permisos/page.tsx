// app/panel/configurar-permisos/page.tsx - Client Component
"use client";

import { useState, useEffect } from "react";
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

export default function ConfigurarPermisosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const usuarioId = searchParams.get('usuarioId');

  const [permisosCatalogo, setPermisosCatalogo] = useState<PermisoCatalogo[]>([]);
  const [detalleUsuario, setDetalleUsuario] = useState<DetalleUsuario | null>(null);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>([]);
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

  // Cargar datos iniciales
  useEffect(() => {
    if (usuarioId) {
      cargarDatos();
    }
  }, [usuarioId]);

  // Inicializar fechas del formulario límite
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

      console.log("Iniciando carga de datos para usuario:", usuarioId);

      // Cargar catálogo de permisos CON CREDENCIALES
      const permisosResponse = await fetch('http://localhost:3000/permisos-catalogo/getAll', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log("Respuesta de permisos:", permisosResponse.status, permisosResponse.statusText);

      if (!permisosResponse.ok) {
        throw new Error(`Error al cargar permisos: ${permisosResponse.status} ${permisosResponse.statusText}`);
      }

      const permisosData = await permisosResponse.json();
      console.log("Permisos cargados:", permisosData);
      setPermisosCatalogo(permisosData);

      // Cargar detalle de usuario
      const detalleResponse = await fetch(`http://localhost:3000/detalle-usuario/usuario/${usuarioId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log("Respuesta de detalle:", detalleResponse.status, detalleResponse.statusText);

      if (!detalleResponse.ok) {
        console.log("No se encontró detalle de usuario, se creará uno nuevo");
        setDetalleUsuario(null);
        setPermisosSeleccionados([]);
      } else {
        const detalleData = await detalleResponse.json();
        console.log("Detalle de usuario:", detalleData);

        if (detalleData && detalleData.length > 0) {
          const detalle = detalleData[0];
          setDetalleUsuario(detalle);
          setPermisosSeleccionados(detalle.permisos || []);
        } else {
          setDetalleUsuario(null);
          setPermisosSeleccionados([]);
        }
      }

      // Cargar límite del usuario (solo uno)
      const limitesResponse = await fetch(`http://localhost:3000/limites-emision/usuario/${usuarioId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log("Respuesta de límites:", limitesResponse.status, limitesResponse.statusText);

      if (limitesResponse.ok) {
        const limitesData = await limitesResponse.json();
        console.log("Límite cargado:", limitesData);
        
        if (limitesData.success && limitesData.data && limitesData.data.length > 0) {
          // Tomar solo el primer límite (el más reciente por el orden DESC)
          const limite = limitesData.data[0];
          setLimiteUsuario(limite);
          
          // Cargar datos en el formulario para edición
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

    } catch (err: unknown) {
      console.error("Error en cargarDatos:", err);
      if (err instanceof Error) setError(err.message);
      else setError("Error al cargar los datos. Verifica tu conexión y autenticación.");
    } finally {
      setLoading(false);
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

      console.log("Guardando límite:", datosLimite);

      let response;

      if (limiteUsuario) {
        // Actualizar límite existente
        console.log("Actualizando límite existente ID:", limiteUsuario.id_limite);
        response = await fetch(`http://localhost:3000/limites-emision/${limiteUsuario.id_limite}`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosLimite),
        });
      } else {
        // Crear nuevo límite
        console.log("Creando nuevo límite");
        response = await fetch('http://localhost:3000/limites-emision', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosLimite),
        });
      }

      console.log("Respuesta:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al guardar el límite: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log("Límite guardado exitosamente:", result);

      // Recargar los datos
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

  const handleEliminarLimite = async () => {
    if (!limiteUsuario) return;
    
    if (!confirm("¿Estás seguro de que deseas eliminar el límite de emisión de este usuario?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/limites-emision/${limiteUsuario.id_limite}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el límite");
      }

      // Limpiar el estado
      setLimiteUsuario(null);
      
      // Reiniciar formulario
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

      console.log("Guardando permisos:", datosActualizacion);

      let response;
      
      if (detalleUsuario?.id_detalle && detalleUsuario.id_detalle > 0) {
        // Actualizar detalle existente
        response = await fetch(`http://localhost:3000/detalle-usuario/update/${detalleUsuario.id_detalle}`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosActualizacion),
        });
      } else {
        // Crear nuevo detalle
        response = await fetch('http://localhost:3000/detalle-usuario/add', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosActualizacion),
        });
      }

      console.log("Respuesta de guardado:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al guardar los permisos: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log("Permisos guardados exitosamente:", result);

      // Redirigir de vuelta al panel
      router.push('/panel');
      
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
    // Añadir 'T00:00:00' para asegurar que se interpreta como fecha local y no UTC
    // y luego usar timeZone: 'UTC' para mostrar la fecha correcta sin corrimientos.
    const fechaUTC = new Date(fecha.split('T')[0] + 'T00:00:00');
    return fechaUTC.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  if (loading) {
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
        {/* Header */}
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
        </div>

        {/* Mensaje de error */}
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

        {/* Sección de Límite de Emisión */}
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

          {/* Mostrar límite actual si existe */}
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
                  <p className="text-sm font-medium text-gray-700">Estado</p>
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

          {/* Formulario para editar/crear límite */}
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

          {/* Mensaje cuando no hay límite */}
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

        {/* Contador de permisos */}
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

        {/* Lista de permisos */}
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

          {/* Botones de acción */}
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
    </div>
  );
}