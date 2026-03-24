export const LogoByteFusion = ({ className = "w-8 h-8" }) => (
  <svg
    className={className}
    viewBox="0 0 500 500"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="blueGrad" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" style={{ stopColor: "#1a237e", stopOpacity: 1 }} />
        <stop offset="100%" stopColor="#283593" />
      </linearGradient>
    </defs>

    <g
      fill="none"
      stroke="url(#blueGrad)"
      strokeWidth="22"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M340,160 C340,140 310,140 260,140 C210,140 210,210 210,240 C210,270 240,280 270,280" />
      <path d="M210,300 C160,300 140,330 140,360 C140,390 170,410 210,410 L310,410" />
      <line x1="310" y1="140" x2="310" y2="400" />
      <line x1="335" y1="285" x2="355" y2="285" />
    </g>

    <path
      d="M200,325 Q240,325 255,290 T285,250 Q295,330 285,380 L230,380 Q200,380 200,325"
      fill="url(#blueGrad)"
    />
    <circle cx="205" cy="325" r="8" fill="url(#blueGrad)" />
    <circle cx="283" cy="215" r="9" fill="url(#blueGrad)" />

    <text
      x="250"
      y="475"
      fontFamily="Arial, sans-serif"
      fontSize="34"
      fontWeight="500"
      fill="#000"
      textAnchor="middle"
      letterSpacing="12"
    >
      BYTE FUSION
    </text>
  </svg>
);

export default LogoByteFusion;