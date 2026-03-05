'use client';

import { useEffect, useRef, useState } from 'react';

interface CounterItemProps {
  end: number;
  suffix?: string;
  label: string;
  duration?: number;
}

function CounterItem({ end, suffix = '', label, duration = 2000 }: CounterItemProps) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setCount(end);
      setHasStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease-out cubic for a satisfying deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [hasStarted, end, duration]);

  return (
    <div ref={ref} className="text-center">
      <div className="font-display text-4xl sm:text-5xl md:text-6xl text-cream mb-1 tabular-nums">
        {count}{suffix}
      </div>
      <div className="text-cream/50 text-sm sm:text-base font-medium uppercase tracking-widest">
        {label}
      </div>
    </div>
  );
}

interface AnimatedCounterProps {
  items: CounterItemProps[];
}

export default function AnimatedCounter({ items }: AnimatedCounterProps) {
  return (
    <section className="bg-forest-section py-14 md:py-16">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {items.map((item) => (
            <CounterItem key={item.label} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
