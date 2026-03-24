"use client";

import { iniciarSesion } from "./actions";
import { useState } from "react";
import { motion } from "framer-motion";

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
      await iniciarSesion(formData);
      window.location.href = "/panel";
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">

      {/* Card animado */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-8"
      >

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto h-14 w-14 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h2 className="mt-6 text-3xl font-bold text-white">
            Bienvenido
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            Accede a tu panel de administración
          </p>
        </div>

        {/* Formulario */}
        <form className="space-y-5" onSubmit={handleSubmit}>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Correo electrónico
            </label>
            <input
              name="correo"
              type="email"
              required
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="ejemplo@correo.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Contraseña
            </label>

            <div className="relative">
              <input
                name="contrasena"
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-4 py-2 pr-10 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="••••••••"
              />

              {/* Botón mostrar */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white text-sm"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Extras */}
          <div className="flex items-center justify-between text-sm text-gray-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-indigo-500" />
              Recuérdame
            </label>

            <button
              type="button"
              className="hover:text-white transition"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-500/20 border border-red-400 text-red-200 text-sm p-3 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-500 to-cyan-400 hover:scale-[1.02] active:scale-[0.97]"
            } text-white shadow-lg`}
          >
            {loading && (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            )}
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>

        </form>
      </motion.div>
    </div>
  );
}