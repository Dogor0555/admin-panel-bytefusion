"use client";

import { useState, useRef, useEffect } from "react";
import { HiChevronDown } from "react-icons/hi";
import { FaSpinner, FaCheck } from "react-icons/fa";
import { BsCircleFill } from "react-icons/bs";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const opciones = [
  {
    value: "todos",
    label: "Estado",
    icon: <BsCircleFill className="text-gray-400 text-xs" />,
    color: "text-gray-400",
    bg: "hover:bg-gray-700/50",
  },
  {
    value: "abierto",
    label: "Abiertos",
    icon: <BsCircleFill className="text-yellow-400 text-xs" />,
    color: "text-yellow-300",
    bg: "hover:bg-yellow-500/10",
  },
  {
    value: "en_proceso",
    label: "En proceso",
    icon: <FaSpinner className="text-blue-400 text-xs animate-spin" />,
    color: "text-blue-300",
    bg: "hover:bg-blue-500/10",
  },
  {
    value: "resuelto",
    label: "Resueltos",
    icon: <FaCheck className="text-green-400 text-xs" />,
    color: "text-green-300",
    bg: "hover:bg-green-500/10",
  },
  {
    value: "cerrado",
    label: "Cerrados",
    icon: <FaCheck className="text-red-500 text-xs" />,
    color: "text-red-400",
    bg: "hover:bg-gray-600/30",
  },
];

export default function FiltroEstadoUltra({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const seleccionada = opciones.find((o) => o.value === value) || opciones[0];

  // cerrar al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative w-48">
      {/* BOTÓN */}
      <button
        onClick={() => setOpen(!open)}
        className="
          w-full flex items-center justify-between gap-2
          px-4 py-2.5
          rounded-xl
          bg-gray-900/80 backdrop-blur
          border border-gray-700
          text-sm text-gray-200
          shadow-sm

          hover:border-gray-500 hover:bg-gray-900
          focus:outline-none focus:ring-2 focus:ring-indigo-500

          transition-all duration-200
        "
      >
        <div className="flex items-center gap-2">
          {seleccionada.icon}
          <span className={seleccionada.color}>
            {seleccionada.label}
          </span>
        </div>

        <HiChevronDown
          className={`text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* DROPDOWN */}
      {open && (
        <div
          className="
            absolute mt-2 w-full
            bg-gray-900/95 backdrop-blur-xl
            border border-gray-700
            rounded-xl
            shadow-xl
            overflow-hidden
            z-50

            animate-in fade-in zoom-in-95 duration-150
          "
        >
          {opciones.map((op) => (
            <button
              key={op.value}
              onClick={() => {
                onChange(op.value);
                setOpen(false);
              }}
              className={`
                w-full flex items-center gap-3
                px-4 py-2.5
                text-sm text-left

                ${op.bg}
                ${value === op.value ? "bg-indigo-500/10" : ""}

                transition-all duration-150
              `}
            >
              {op.icon}
              <span className={op.color}>{op.label}</span>

              {value === op.value && (
                <span className="ml-auto text-xs text-indigo-400">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}