// app/panel/components/ui/icons/Eliminar.tsx

import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const Eliminar = ({
  size = 20,
  className = "",
  ...props
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      {...props}
    >
      {/* Cuerpo del bote */}
      <path
        d="M9 10V44H39V10H9Z"
        fill="#ef4444" // 🔥 blanco sólido
        stroke="white" // 🔥 rojo elegante para el contorno
        strokeWidth="2"
      />

      {/* Líneas internas */}
      <path
        d="M20 20V33"
        stroke="white" // 🔥 rojo más elegante (Tailwind red-500)
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M28 20V33"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Tapa superior */}
      <path
        d="M4 10H44"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Parte superior */}
      <path
        d="M16 10L19.289 4H28.7771L32 10H16Z"
        fill="#ef4444" // 🔥 rojo sólido para la tapa
        stroke="white"
        strokeWidth="2"
      />
    </svg>
  );
};

export default Eliminar;