"use client";

import { useState, useRef, useEffect } from "react";
import {
  HiChevronDown,
  HiOutlineExclamation,
} from "react-icons/hi";
import { FaFireAlt } from "react-icons/fa";
import { MdOutlinePriorityHigh } from "react-icons/md";
import { BsCircle } from "react-icons/bs";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const opciones = [
  {
    value: "todos",
    label: "Prioridades",
    icon: <BsCircle className="text-gray-400" />,
    color: "text-gray-400",
    bg: "hover:bg-gray-700/50",
  },
  {
    value: "urgente",
    label: "Urgente",
    icon: <FaFireAlt className="text-red-500" />,
    color: "text-red-400",
    bg: "hover:bg-red-500/10",
  },
  {
    value: "alta",
    label: "Alta",
    icon: <MdOutlinePriorityHigh className="text-orange-500" />,
    color: "text-orange-400",
    bg: "hover:bg-orange-500/10",
  },
  {
    value: "media",
    label: "Media",
    icon: <HiOutlineExclamation className="text-yellow-400" />,
    color: "text-yellow-300",
    bg: "hover:bg-yellow-500/10",
  },
  {
    value: "baja",
    label: "Baja",
    icon: <BsCircle className="text-green-500" />,
    color: "text-green-400",
    bg: "hover:bg-green-500/10",
  },
];

export default function FiltroPrioridadUltra({ value, onChange }: Props) {
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
          <span className={`${seleccionada.color}`}>
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
              <span className={`${op.color}`}>{op.label}</span>

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