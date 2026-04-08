// app/panel/components/ui/icons/Editar.tsx

import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const Editar = ({
  size = 20,
  className = "",
  ...props
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      className={className}
      {...props}
    >
      {/* Documento */}
      <path
        d="M38.4 22.742a2 2 0 1 0 0-4zm23.6 19.6a2 2 0 1 0-4 0zm-52-19.6v44h4v-44zm4 48h44v-4H14zm24.4-52H14v4h24.4zm23.6 48v-24.4h-4v24.4zm-4 4a4 4 0 0 0 4-4h-4zm-48-4a4 4 0 0 0 4 4v-4zm4-44v-4a4 4 0 0 0-4 4z"
        fill="currentColor" // 🔥 controlado por Tailwind
        opacity="0.8"
      />

      {/* Lápiz */}
      <path
        d="M68.015 21.897c.78-.78.78-2.044 0-2.824l-5.657-5.657a2.003 2.003 0 0 0-2.833 0L30.7 42.242a16 16 0 0 0-4.555 9.267l-.308 2.384l-.125.974a.758.758 0 0 0 .848.849l.975-.126l2.384-.307a16 16 0 0 0 9.266-4.555z"
        fill="#a855f7" // 🔥 morado moderno (Tailwind purple-500)
      />

      {/* Detalle del lápiz */}
      <path
        d="m52.147 20.804l8.48 8.48"
        stroke="#facc15" // 🔥 amarillo suave (Tailwind yellow-400)
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Editar;