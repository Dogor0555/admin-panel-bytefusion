// app/panel/components/ui/icons/Deshabilitar.tsx

import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const Deshabilitar = ({
  size = 20,
  className = "",
  ...props
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      {...props}
    >
      {/* Círculo */}
      <path
        d="M14.5 8a6.5 6.5 0 1 1-13 0a6.5 6.5 0 0 1 13 0Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Línea diagonal */}
      <path
        d="M3.5 3.5l9 9"
        stroke="#ef4444" // 🔥 rojo elegante
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default Deshabilitar;