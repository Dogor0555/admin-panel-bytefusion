// app/panel/components/ui/icons/Sucursales.tsx

import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const Sucursales = ({
  size = 20,
  className = "",
  ...props
}: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      className={className}
      {...props}
    >
      {/* Techo */}
      <path
        fill="currentColor"
        opacity="0.15"
        d="M.5 4L2 .5h10L13.5 4z"
      />

      {/* Cuerpo */}
      <path
        fill="currentColor"
        opacity="0.08"
        d="M1.5 8.5V13a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V8.5"
      />

      {/* Sección interior */}
      <path
        fill="currentColor"
        opacity="0.12"
        d="M9.26 4v.998a1.995 1.995 0 0 1-1.996 1.995h-.498A1.995 1.995 0 0 1 4.77 4.998V4M1.5 10H8v3.5H1.5z"
      />

      {/* Líneas */}
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1"
      >
        <path d="M4.77 4v.998a1.995 1.995 0 0 1-1.995 1.995h-.28A1.995 1.995 0 0 1 .5 4.998V4" />
        <path d="M13.5 4v.998a1.995 1.995 0 0 1-1.995 1.995h-.25A1.995 1.995 0 0 1 9.26 4.998V4" />
        <path d="M1.5 8.5V13a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V8.5" />
        <path d="M8 8.5v5M1.5 10H8" />
        <path d="M.5 4L2 .5h10L13.5 4z" />
        <path d="m9.26 4v.998a1.995 1.995 0 0 1-1.996 1.995h-.498A1.995 1.995 0 0 1 4.77 4.998V4" />
      </g>
    </svg>
  );
};

export default Sucursales;