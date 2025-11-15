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

export default function ConfigurarPermisosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const usuarioId = searchParams.get('usuarioId');

  const [permisosCatalogo, setPermisosCatalogo] = useState<PermisoCatalogo[]>([]);
  const [detalleUsuario, setDetalleUsuario] = useState<DetalleUsuario | null>(null);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // Cargar datos iniciales
  useEffect(() => {
    if (usuarioId) {
      cargarDatos();
    }
  }, [usuarioId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Iniciando carga de datos para usuario:", usuarioId);

      // Cargar catálogo de permisos CON CREDENCIALES
      const permisosResponse = await fetch('http://localhost:3000/permisos-catalogo/getAll', {
        credentials: 'include', // Esto incluye las cookies de autenticación
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

      // Cargar detalle de usuario CON CREDENCIALES
      // NOTA: Cambié la URL porque parece que tu endpoint espera el ID del detalle, no del usuario
      const detalleResponse = await fetch(`http://localhost:3000/detalle-usuario/usuario/${usuarioId}`, {
        credentials: 'include', // Esto incluye las cookies de autenticación
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log("Respuesta de detalle:", detalleResponse.status, detalleResponse.statusText);

      if (!detalleResponse.ok) {
        // Si no existe el detalle, no es un error fatal
        console.log("No se encontró detalle de usuario, se creará uno nuevo");
        setDetalleUsuario(null);
        setPermisosSeleccionados([]);
      } else {
        const detalleData = await detalleResponse.json();
        console.log("Detalle de usuario:", detalleData);

        // Si ya existe un detalle de usuario, cargarlo
        if (detalleData && detalleData.length > 0) {
          const detalle = detalleData[0];
          setDetalleUsuario(detalle);
          setPermisosSeleccionados(detalle.permisos || []);
        } else {
          setDetalleUsuario(null);
          setPermisosSeleccionados([]);
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
        // Actualizar detalle existente CON CREDENCIALES
        response = await fetch(`http://localhost:3000/detalle-usuario/update/${detalleUsuario.id_detalle}`, {
          method: 'PUT',
          credentials: 'include', // Esto incluye las cookies de autenticación
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosActualizacion),
        });
      } else {
        // Crear nuevo detalle CON CREDENCIALES
        response = await fetch('http://localhost:3000/detalle-usuario/add', {
          method: 'POST',
          credentials: 'include', // Esto incluye las cookies de autenticación
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

  // Agregar función para recargar
  const handleRecargar = () => {
    cargarDatos();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-gray-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-600">Cargando permisos...</p>
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Configurar Permisos de Usuario
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
              Lista de Permisos Disponibles
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
                  'Guardar Permisos'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}