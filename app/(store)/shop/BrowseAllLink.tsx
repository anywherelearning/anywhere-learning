'use client';

import { useRouter } from 'next/navigation';
import type { MouseEvent, ReactNode } from 'react';

interface Props {
  track: string;
  q?: string;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
  'aria-label'?: string;
}

export default function BrowseAllLink({
  track,
  q,
  className,
  style,
  children,
  ...rest
}: Props) {
  const router = useRouter();

  const params = new URLSearchParams();
  params.set('track', track);
  if (q) params.set('q', q);
  const href = `/shop?${params.toString()}#full-library`;

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push(href, { scroll: false });
    requestAnimationFrame(() => {
      const el = document.getElementById('full-library');
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  };

  return (
    <a href={href} onClick={handleClick} className={className} style={style} {...rest}>
      {children}
    </a>
  );
}
