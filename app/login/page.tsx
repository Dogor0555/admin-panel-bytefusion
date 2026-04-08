"use client";

import { iniciarSesion } from "./actions";
import { useState } from "react";
import { motion, AnimatePresence  } from "framer-motion";

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
<svg 
  className="h-7 w-7 text-white" 
  xmlns="http://www.w3.org/2000/svg" 
  viewBox="0 0 48 48"
  fill="none"
>
  <circle cx="34.641" cy="13.52" r="8.02" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M36.082 21.41v15.743a5.335 5.335 0 0 1-5.347 5.347h-20.05a5.335 5.335 0 0 1-5.346-5.347v-20.05a5.335 5.335 0 0 1 5.347-5.346h16.131"/>
  <rect width="9.357" height="6.683" x="15.59" y="26.447" rx="1.337" ry="1.337" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="m23.817 26.463l-.006-2.838c.006-1.282-1.366-2.936-3.476-2.97c-2.111-.034-3.408 1.705-3.426 3.071l.018 2.721m3.407 2.078v.873"/>
  <circle cx="20.334" cy="30.334" r=".936" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
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
  className="absolute right-3 top-2.5 text-gray-400 hover:text-white transition hover:scale-110 active:scale-95"
>
  <AnimatePresence mode="wait" initial={false}>
    {showPassword ? (
      <motion.span
        key="hide"
        initial={{ opacity: 0, scale: 0.7, rotate: -90 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.7, rotate: 90 }}
        transition={{ duration: 0.25 }}
        className="flex"
      >
        {/* 🔒 TU ICONO ORIGINAL (NO SE TOCA) */}
        <svg
          className="w-5 h-5 hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.6)] transition"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
        >
          <g stroke="currentColor" strokeWidth="2">
            <path d="M6.887 5.172c.578-.578.867-.868 1.235-1.02S8.898 4 9.716 4h4.61c.826 0 1.239 0 1.61.155c.37.155.66.45 1.239 1.037l1.674 1.699c.568.576.852.865 1.002 1.23c.149.364.149.768.149 1.578v4.644c0 .818 0 1.226-.152 1.594s-.441.656-1.02 1.235l-1.656 1.656c-.579.579-.867.867-1.235 1.02c-.368.152-.776.152-1.594.152H9.7c-.81 0-1.214 0-1.579-.15c-.364-.149-.653-.433-1.229-1.001l-1.699-1.674c-.588-.58-.882-.87-1.037-1.24S4 15.152 4 14.326v-4.61c0-.818 0-1.226.152-1.594s.442-.657 1.02-1.235z"/>
            <path strokeLinecap="round" d="m8 11l.422.211a8 8 0 0 0 7.156 0L16 11m-4 1.5V14m-3-2l-.5 1m6.5-1l.5 1"/>
          </g>
        </svg>
      </motion.span>
    ) : (
      <motion.span
        key="show"
        initial={{ opacity: 0, scale: 0.7, rotate: 90 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.7, rotate: -90 }}
        transition={{ duration: 0.25 }}
        className="flex"
      >
        {/* 👁️ TU ICONO ORIGINAL (NO SE TOCA) */}
        <svg
          className="w-5 h-5 hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.6)] transition"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 256 256"
          fill="currentColor"
        >
          <path d="M176 32c-20.61 0-38.28 18.16-48 45.85C118.28 50.16 100.61 32 80 32c-31.4 0-56 42.17-56 96s24.6 96 56 96c20.61 0 38.28-18.16 48-45.85c9.72 27.69 27.39 45.85 48 45.85c31.4 0 56-42.17 56-96s-24.6-96-56-96m-69.08 154.39C99.43 200.12 89.62 208 80 208s-19.43-7.88-26.92-21.61a104.8 104.8 0 0 1-10.24-29.23a32 32 0 1 0 0-58.32a104.8 104.8 0 0 1 10.24-29.23C60.57 55.88 70.38 48 80 48s19.43 7.88 26.92 21.61C115.35 85.07 120 105.81 120 128s-4.65 42.93-13.08 58.39m96 0C195.43 200.12 185.62 208 176 208s-19.43-7.88-26.92-21.61a104.8 104.8 0 0 1-10.24-29.23a32 32 0 1 0 0-58.32a104.8 104.8 0 0 1 10.24-29.23C156.57 55.88 166.38 48 176 48s19.43 7.88 26.92 21.61C211.35 85.07 216 105.81 216 128s-4.65 42.93-13.08 58.39"/>
        </svg>
      </motion.span>
    )}
  </AnimatePresence>
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