// app/panel/components/ui/icons/Pruebas.tsx

import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const Pruebas = ({
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
      {/* Líneas principales */}
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.2"
      >
        <path d="m10.244 1.75l-8.49 8.48c-2.36 2.36 1.18 5.9 3.54 3.54l.738-.738" />
        <path d="m12.032 7.032l1.746-1.748M9.024.5l6 6M8.5 7.5H4.504" />
      </g>

      {/* Círculo (test/debug feeling) */}
      <g
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.2"
      >
        <circle cx="11.036" cy="12.087" r="3.2" opacity="0.25" />
        <circle cx="11.036" cy="12.087" r="0.8" />
        <circle cx="14.712" cy="7.462" r="0.8" opacity="0.7" />
      </g>
    </svg>
  );
};

export default Pruebas;