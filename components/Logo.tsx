import Image from 'next/image';

interface LogoProps {
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 28, className = "" }: LogoProps) {
  return (
    <Image
      src="/logo-icon.png"
      alt=""
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    />
  );
}

export function LogoFull({ iconSize = 36, className = "" }: { iconSize?: number; className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon size={iconSize} />
      <div className="flex flex-col">
        <span className="font-display text-lg leading-tight text-forest">
          Anywhere Learning
        </span>
      </div>
    </div>
  );
}
