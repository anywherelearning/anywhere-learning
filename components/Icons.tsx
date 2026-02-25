interface IconProps {
  size?: number;
  className?: string;
}

const defaults = { size: 28, className: "text-forest" };

function wrap(props: IconProps) {
  const { size = defaults.size, className = defaults.className } = props;
  return { width: size, height: size, className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
}

export function IconCart(props: IconProps) {
  const svg = wrap(props);
  return (
    <svg {...svg} aria-hidden="true">
      <circle cx="9" cy="21" r="1" fill="currentColor" stroke="none" />
      <circle cx="20" cy="21" r="1" fill="currentColor" stroke="none" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  );
}

export function IconCooking(props: IconProps) {
  const svg = wrap(props);
  return (
    <svg {...svg} aria-hidden="true">
      <circle cx="12" cy="14" r="7" />
      <path d="M12 7V3" />
      <path d="M8 8l-1.5-3" />
      <path d="M16 8l1.5-3" />
      <path d="M5 14h14" />
    </svg>
  );
}

export function IconMap(props: IconProps) {
  const svg = wrap(props);
  return (
    <svg {...svg} aria-hidden="true">
      <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
      <path d="M8 2v16" />
      <path d="M16 6v16" />
    </svg>
  );
}

export function IconLetter(props: IconProps) {
  const svg = wrap(props);
  return (
    <svg {...svg} aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 4L12 13 2 4" />
    </svg>
  );
}

export function IconHandshake(props: IconProps) {
  const svg = wrap(props);
  return (
    <svg {...svg} aria-hidden="true">
      <path d="M20 11c0 1-1.5 3-3.5 3H14l-2 2-2-2H7.5C5.5 14 4 12 4 11" />
      <path d="M4 11V6l3-3 2 1.5L12 3l3 1.5L17 3l3 3v5" />
      <path d="M10 14v3" />
      <path d="M14 14v3" />
    </svg>
  );
}

export function IconCoins(props: IconProps) {
  const svg = wrap(props);
  return (
    <svg {...svg} aria-hidden="true">
      <circle cx="9" cy="9" r="7" />
      <path d="M15 6.5a7 7 0 11-4.5 8.5" />
      <path d="M9 6v6l3 1.5" />
    </svg>
  );
}

export function IconCompass(props: IconProps) {
  const svg = wrap(props);
  return (
    <svg {...svg} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" fillOpacity="0.15" stroke="currentColor" />
    </svg>
  );
}

export function IconSprout(props: IconProps) {
  const svg = wrap(props);
  return (
    <svg {...svg} aria-hidden="true">
      <path d="M12 22V12" />
      <path d="M12 12C12 8 8 6 4 6c0 4 2.5 6 8 6" />
      <path d="M12 15c0-4 4-6 8-6 0 4-2.5 6-8 6" />
      <path d="M10 22h4" />
    </svg>
  );
}

export function IconChat(props: IconProps) {
  const svg = wrap(props);
  return (
    <svg {...svg} aria-hidden="true">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
    </svg>
  );
}

export function IconWrench(props: IconProps) {
  const svg = wrap(props);
  return (
    <svg {...svg} aria-hidden="true">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

// "Why It Works" section icons

export function IconNoBook(props: IconProps) {
  const svg = wrap(props);
  return (
    <svg {...svg} aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      <path d="M9 7h6" />
      <path d="M9 11h4" />
      <line x1="4" y1="2" x2="22" y2="22" strokeWidth="2" />
    </svg>
  );
}

export function IconGlobe(props: IconProps) {
  const svg = wrap(props);
  return (
    <svg {...svg} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

export function IconTarget(props: IconProps) {
  const svg = wrap(props);
  return (
    <svg {...svg} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
    </svg>
  );
}
