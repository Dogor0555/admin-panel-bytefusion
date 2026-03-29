import React, { SVGProps } from "react";

interface MoonProps extends SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
}

export const Moon: React.FC<MoonProps> = ({
  size = 24,
  color = "currentColor",
  className = "",
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      {...props}
    >
      <path
        fill="none"
        stroke={color}
        strokeDasharray={62}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 3c-4.97 0 -9 4.03 -9 9c0 4.97 4.03 9 9 9c3.53 0 6.59 -2.04 8.06 -5c0 0 -6.06 1.5 -9.06 -3c-3 -4.5 1 -10 1 -10Z"
      >
        <animate
          fill="freeze"
          attributeName="stroke-dashoffset"
          dur="0.6s"
          values="62;0"
        />
      </path>
    </svg>
  );
};

export default Moon;