//app/panel/panelPage.tsx

"use client";

import { useState, useMemo, useEffect } from "react";
import RegistrarUsuarioModal from "./components/RegistrarUsuarioModal";
import { apiDelete } from "@/lib/api-client";
import { useRouter } from "next/navigation";

interface DetalleUsuario {
  id: number;
  id_usuario: number;
  [key: string]: any;
}

interface Usuario {
  id: number;
  nombre: string;
  nit: string;
  nrc: string;
  giro: string;
  correo: string;
  telefono: string;
  complemento: string;
  codactividad: string;
  desactividad: string | null;
  nombrecomercial: string | null;
  tipoestablecimiento: string | null;
  codestablemh: string | null;
  codestable: string;
  codpuntovenmh: string | null;
  codpuntoventa: string;
  departamento: string;
  municipio: string;
  passwordtoken: string | null;
  ambiente: string | null;
  configurado: boolean;
  detalleUsuario: DetalleUsuario | null;
}

interface PanelPageProps {
  usuarios: Usuario[];
}

export default function PanelPage({ usuarios }: PanelPageProps) {
  const router = useRouter();
  useEffect(() => {
    try {
      const raw = localStorage.getItem("empleado");
      if (!raw) return;
      const empleado = JSON.parse(raw);
      if (empleado?.correo !== "juan.perez@sucursal.com") {
        localStorage.removeItem("empleado");
        window.location.href = "https://www.bytefusionsv.com";
      }
    } catch (e) {
      localStorage.removeItem("empleado");
      window.location.href = "https://www.bytefusionsv.com";
    }
  }, []);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  const filteredUsuarios = useMemo(() => {
    if (!searchTerm.trim()) return usuarios;
    
    const term = searchTerm.toLowerCase();
    return usuarios.filter(usuario =>
      usuario.nombre.toLowerCase().includes(term) ||
      usuario.nit.toLowerCase().includes(term) ||
      usuario.correo.toLowerCase().includes(term) ||
      usuario.nombrecomercial?.toLowerCase().includes(term) ||
      usuario.giro.toLowerCase().includes(term)
    );
  }, [usuarios, searchTerm]);

  const handleConfigurarUsuario = async (usuario: Usuario) => {
    setLoading(true);
    setError("");
    
    try {
      router.push(`/panel/configurar-permisos?usuarioId=${usuario.id}`);
      
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Error al configurar el usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUsuario = async (usuario: Usuario) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar a ${usuario.nombre}? Esta acción no se puede deshacer.`)) {
      return;
    }

    setDeletingUserId(usuario.id);
    setError("");

    try {
      await apiDelete(`/usuarios/deleteUsu/${usuario.id}`);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Ocurrió un error inesperado al eliminar el usuario.");
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <>
    <div className="text-black min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <RegistrarUsuarioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserAdded={() => router.refresh()}
      />
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="mt-2 text-lg text-gray-600">
              Gestiona los usuarios del sistema.
            </p>
          </div>
          <div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Registrar Nuevo Usuario
            </button>
          </div>
        </div>

        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, NIT, correo, giro o nombre comercial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
            />
          </div>
          <div className="mt-2 text-sm text-gray-500 text-center">
            {filteredUsuarios.length} de {usuarios.length} usuarios encontrados
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-8 max-w-4xl mx-auto">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error de configuración
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg max-w-6xl mx-auto">
          {filteredUsuarios.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron usuarios</h3>
              <p className="mt-1 text-sm text-gray-500">
                No hay usuarios que coincidan con tu búsqueda.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredUsuarios.map((usuario) => (
                <li key={usuario.id} className="px-6 py-5 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {usuario.nombre}
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">NIT</p>
                          <p className="text-gray-900">{usuario.nit}</p>
                        </div>
                        
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Correo</p>
                          <p className="text-gray-900 truncate">{usuario.correo}</p>
                        </div>
                        
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Teléfono</p>
                          <p className="text-gray-900">{usuario.telefono}</p>
                        </div>
                        
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Giro</p>
                          <p className="text-gray-900">{usuario.giro}</p>
                        </div>
                      </div>

                      {(usuario.nombrecomercial || usuario.codpuntoventa) && (
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {usuario.nombrecomercial && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nombre Comercial</p>
                              <p className="text-gray-900">{usuario.nombrecomercial}</p>
                            </div>
                          )}
                          {usuario.codpuntoventa && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Punto de Venta</p>
                              <p className="text-gray-900">{usuario.codpuntoventa}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="ml-6 shrink-0 flex items-center gap-x-4">
                      <button
                        onClick={() => handleConfigurarUsuario(usuario)}
                        disabled={loading && selectedUsuario?.id === usuario.id}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition-colors duration-150 ${
                          loading && selectedUsuario?.id === usuario.id
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
                        }`}
                      >
                        {loading && selectedUsuario?.id === usuario.id ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Configurando...
                          </>
                        ) : (
                          'Configurar'
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteUsuario(usuario)}
                        disabled={deletingUserId === usuario.id}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition-colors duration-150 ${
                          deletingUserId === usuario.id
                            ? 'bg-red-400 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                        }`}
                      >
                        {deletingUserId === usuario.id ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Eliminando...
                          </>
                        ) : (
                          'Eliminar'
                        )}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Sistema de Facturación Electrónica
          </p>
        </div>
      </div>
    </div>
    </>
  );
}