// app/panel/components/ui/icons/Production.tsx

import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const Production = ({
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
      {/* Parte superior */}
      <path
        fill="currentColor"
        d="M3.808 5.086C4.94 4.08 5.642 3.74 7 3.49c1.358.251 2.06.59 3.192 1.596L7 6.682z"
        opacity="0.9"
      />

      {/* Cuerpo */}
      <path
        fill="currentColor"
        opacity="0.2"
        d="M3.808 5.086c-.393 1.08-.397 2.368-.085 3.453a.93.93 0 0 0 .3.454c.988.824 1.664 1.127 2.766 1.368a1 1 0 0 0 .422 0c1.102-.241 1.778-.544 2.765-1.368a.93.93 0 0 0 .301-.454c.312-1.085.308-2.373-.085-3.453L7 6.682z"
      />

      {/* Líneas */}
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1"
      >
        <path d="M3.808 5.086C4.94 4.08 5.642 3.74 7 3.49c1.358.251 2.06.59 3.192 1.596" />
        <path d="M3.808 5.086c-.393 1.08-.397 2.368-.085 3.453a.93.93 0 0 0 .3.454c.988.824 1.664 1.127 2.766 1.368a1 1 0 0 0 .422 0c1.102-.241 1.778-.544 2.765-1.368a.93.93 0 0 0 .301-.454c.312-1.085.308-2.373-.085-3.453L7 6.682zM7 6.674v3.731" />
        <path d="M.75 7A6.25 6.25 0 0 1 12.5 4.029c.076-1.102.053-1.732-.1-2.875" />
        <path d="M13.25 7a6.25 6.25 0 0 1-11.734 3c-.076 1.102-.054 1.732.1 2.875" />
      </g>
    </svg>
  );
};

export default Production;