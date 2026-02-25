interface LogoProps {
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 28, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer circle */}
      <circle cx="50" cy="50" r="46" stroke="#588157" strokeWidth="3" fill="none" />

      {/* Mountains — taller left peak, shorter right peak */}
      <path
        d="M24 62 L40 32 L50 48 L56 38 L72 62Z"
        fill="#588157"
      />

      {/* Hand/path swooping beneath the mountains */}
      <path
        d="M20 66 Q30 58 40 62 Q50 66 55 62 Q62 57 72 60 Q78 62 80 66"
        stroke="#588157"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M18 72 Q35 64 50 68 Q65 72 82 66"
        stroke="#588157"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function LogoFull({ iconSize = 36, className = "" }: { iconSize?: number; className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon size={iconSize} />
      <div className="flex flex-col">
        <span className="font-[family-name:var(--font-display)] text-lg leading-tight text-forest">
          Anywhere Learning
        </span>
      </div>
    </div>
  );
}
