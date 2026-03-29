//app/panel/panelPage.tsx

"use client";

import { useState, useMemo, useEffect } from "react";
import RegistrarUsuarioModal from "./components/RegistrarUsuarioModal";
import AddUser from "./components/ui/icons/AddUser";
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
<div className="text-black min-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8">
  <RegistrarUsuarioModal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    onUserAdded={() => router.refresh()}
  />

  <div className="max-w-6xl mx-auto">
{/* TÍTULO */}
<div className="mb-6">
<h1 className="text-3xl font-bold text-[var(--text)] text-center transition-colors duration-300">
  Gestiona los usuarios del sistema.
</h1>
</div>

  {/* Contenedor de input + botón */}
<div className="mb-8">
  {/* 1. Usamos items-start para que el botón se alinee con el tope del input */}
  <div className="flex flex-col md:flex-row items-start justify-between gap-4">
    
{/* Barra de búsqueda personalizada con fondo oscuro */}
<div className="flex-1 min-w-0 relative">
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <svg
        className="h-5 w-5 text-indigo-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <input
      type="text"
      placeholder="Buscar por nombre, NIT, correo, giro o nombre comercial..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-2xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
    />
  </div>
</div>

    {/* Botón Agregar Usuario: md:self-start asegura que se quede arriba */}
    <button
      onClick={() => setIsModalOpen(true)}
className="w-full md:w-auto inline-flex items-center justify-center px-8 py-3 
border border-green-600 text-sm font-medium rounded-md shadow-sm 
text-white bg-green-600 hover:bg-green-700 
focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 
gap-2 transition-all duration-200"    >
      <AddUser className="w-5 h-5" />
      Agregar Usuario
    </button>
  </div>
</div>


{/* CARD PRINCIPAL CONTENEDORA */}
<div className="bg-gray-800 shadow-md rounded-2xl p-6">
  {filteredUsuarios.length === 0 ? (
    <div className="text-center py-12 text-gray-300">
      <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 className="mt-2 text-sm font-medium">No se encontraron usuarios</h3>
      <p className="mt-1 text-sm text-gray-400">No hay usuarios que coincidan con tu búsqueda.</p>
    </div>
  ) : (
    <ul className="space-y-4">
      {filteredUsuarios.map((usuario) => (
        <li key={usuario.id} className="transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-lg rounded-2xl px-6 py-5">
            <div className="flex items-center justify-between">
              {/* INFO DEL USUARIO */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold truncate">{usuario.nombre}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mt-2 text-gray-300">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">NIT</p>
                    <p>{usuario.nit}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Correo</p>
                    <p className="truncate">{usuario.correo}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Teléfono</p>
                    <p>{usuario.telefono}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">Giro</p>
                    <p>{usuario.giro}</p>
                  </div>
                </div>
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="ml-6 shrink-0 flex items-center gap-x-4">
                <button
                  onClick={() => handleConfigurarUsuario(usuario)}
                  disabled={loading && selectedUsuario?.id === usuario.id}
                  className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                    loading && selectedUsuario?.id === usuario.id
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {loading && selectedUsuario?.id === usuario.id ? "Configurando..." : "Configurar"}
                </button>
                <button
                  onClick={() => handleDeleteUsuario(usuario)}
                  disabled={deletingUserId === usuario.id}
                  className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
                    deletingUserId === usuario.id
                      ? "bg-red-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {deletingUserId === usuario.id ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )}

  {/* Pie de la card */}
  <div className="mt-8 text-center text-gray-400 py-4">
    Sistema de Facturación Electrónica
  </div>
</div>
  </div>
</div>
    </>
  );
}
