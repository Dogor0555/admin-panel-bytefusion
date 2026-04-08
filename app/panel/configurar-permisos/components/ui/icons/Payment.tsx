// app/panel/components/ui/icons/Payment.tsx

import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const Payment = ({
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
      {/* Tarjeta */}
      <path
        d="M12.5.5h-11a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1"
        fill="currentColor"
        opacity="0.15"
      />

      {/* Bordes */}
      <path
        d="M12.5.5h-11a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Base (patas) */}
      <path
        d="M7 11.5v2m2.5-3v2m-5-2v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Detalles internos */}
      <path
        d="M2.75 4.75a.25.25 0 1 1 0-.5m8.5.5a.25.25 0 1 1 0-.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Línea tipo dinero */}
      <path
        d="M8.064 3.889a.83.83 0 0 0-.786-.556h-.645a.744.744 0 0 0-.16 1.47l.983.216a.834.834 0 0 1-.178 1.648h-.556a.83.83 0 0 1-.786-.556M7 2.833V2m0 5v-.833"
        stroke="#6366f1" // 🔥 indigo moderno
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Payment;