"use client";

import { useState, useEffect, useRef } from "react";
import { Production } from "./Production";
import { Pruebas } from "./Pruebas";

type Ambiente = "01" | "00";

type SelectAmbienteProps = {
  value: Ambiente;
  onChange: (value: Ambiente) => void;
  disabled?: boolean;
};

export const SelectAmbiente = ({
  value,
  onChange,
  disabled = false,
}: SelectAmbienteProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const label = value === "01" ? "Producción" : "Pruebas";

  return (
    <div ref={ref} className="relative inline-block">
      
      {/* BOTÓN */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        disabled={disabled}
className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-md transition-all hover:scale-[1.03] disabled:opacity-50 ${
  value === "01"
    ? "text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-purple-500/30"
    : "text-gray-900 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-yellow-500/30"
}`}
      >
{value === "01" ? <Production className="w-4 h-4" /> : <Pruebas className="w-4 h-4" />}{label}
        <svg
          className={`w-4 h-4 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95">

          <button
            onClick={() => {
              onChange("01");
              setOpen(false);
            }}
            className={`group w-full flex items-center gap-2 px-4 py-2 text-sm transition ${
              value === "01"
                ? "bg-purple-100 text-purple-700 font-semibold"
                : "hover:bg-gray-100 text-purple-700"
            }`}
          >
            <Production className="w-4 h-4 text-purple-600 transition-transform group-hover:rotate-30" /> Producción
          </button>

          <button
            onClick={() => {
              onChange("00");
              setOpen(false);
            }}
            className={`group w-full flex items-center gap-2 px-4 py-2 text-sm transition ${
              value === "00"
                ? "bg-yellow-100 text-yellow-700 font-semibold"
                : "hover:bg-gray-100 text-yellow-700"
            }`}
          >
              <Pruebas className="w-4 h-4 text-yellow-600  transition-transform group-hover:rotate-12" /> Pruebas
          </button>
        </div>
      )}
    </div>
  );
};

export default SelectAmbiente;