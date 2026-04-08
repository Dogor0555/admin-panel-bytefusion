// app/login/page.tsx
"use client";

import { iniciarSesion } from "./actions";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const correo = formData.get("correo") as string;
      const contrasena = formData.get("contrasena") as string;

      // ✅ HACER EL FETCH DIRECTAMENTE DESDE EL CLIENTE
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.bytefusionsv.com";
      
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ correo, contrasena }),
        credentials: "include", // ✅ ESTO ES CRÍTICO - guarda cookies en el navegador
      });

      const text = await response.text();

      if (!response.ok) {
        let mensaje;
        try {
          mensaje = JSON.parse(text)?.mensaje;
        } catch {}
        throw new Error(mensaje || `Error ${response.status}`);
      }

      const data = JSON.parse(text);
      
      // Guardar datos en localStorage
      if (data) {
        const { empresa, empleado, sucursal } = data;
        if (empresa) localStorage.setItem("empresa", JSON.stringify(empresa));
        if (empleado) localStorage.setItem("empleado", JSON.stringify(empleado));
        if (sucursal) localStorage.setItem("sucursal", JSON.stringify(sucursal));
        localStorage.setItem("isAuthenticated", "true");
      }

      // Redirigir al panel
      window.location.href = "/panel";
      
    } catch (err: unknown) {
      console.error("Error en login:", err);
      if (err instanceof Error) setError(err.message);
      else setError("Error desconocido");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8"
      >
        <div className="text-center mb-8">
          <div className="mx-auto h-14 w-14 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg">
            <svg className="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">
              <circle cx="34.641" cy="13.52" r="8.02" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M36.082 21.41v15.743a5.335 5.335 0 0 1-5.347 5.347h-20.05a5.335 5.335 0 0 1-5.346-5.347v-20.05a5.335 5.335 0 0 1 5.347-5.346h16.131"/>
              <rect width="9.357" height="6.683" x="15.59" y="26.447" rx="1.337" ry="1.337" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="m23.817 26.463l-.006-2.838c.006-1.282-1.366-2.936-3.476-2.97c-2.111-.034-3.408 1.705-3.426 3.071l.018 2.721m3.407 2.078v.873"/>
              <circle cx="20.334" cy="30.334" r=".936" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">Bienvenido</h2>
          <p className="text-gray-400 text-sm mt-2">Accede a tu panel de administración</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Correo electrónico</label>
            <input
              name="correo"
              type="email"
              required
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="ejemplo@correo.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Contraseña</label>
            <div className="relative">
              <input
                name="contrasena"
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-4 py-2 pr-10 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white transition hover:scale-110 active:scale-95"
              >
                {/* Icono del ojo - mantén tu código existente */}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-indigo-500" />
              Recuérdame
            </label>
            <button type="button" className="hover:text-white transition">¿Olvidaste tu contraseña?</button>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/20 border border-red-400 text-red-200 text-sm p-3 rounded-lg">
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              loading ? "bg-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-indigo-500 to-cyan-400 hover:scale-[1.02] active:scale-[0.97]"
            } text-white shadow-lg`}
          >
            {loading && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>}
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}