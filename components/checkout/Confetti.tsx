'use client';

import { useEffect, useRef } from 'react';

const BRAND_COLORS = ['#588157', '#d4a373', '#e8c99a', '#3d5c3b', '#faf9f6'];

interface Particle {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

export default function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    function resize() {
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    const particles: Particle[] = [];
    const count = 80;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 300,
        y: window.innerHeight * 0.3 + (Math.random() - 0.5) * 100,
        w: Math.random() * 8 + 4,
        h: Math.random() * 6 + 2,
        color: BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)],
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * -8 - 2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.15,
        opacity: 1,
      });
    }

    let frame: number;
    const start = performance.now();
    const duration = 2800;

    function animate(now: number) {
      const elapsed = now - start;
      if (elapsed > duration) {
        canvas!.style.display = 'none';
        return;
      }

      ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const p of particles) {
        p.x += p.vx;
        p.vy += 0.15; // gravity
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.vx *= 0.99;

        // Fade out in last 800ms
        if (elapsed > duration - 800) {
          p.opacity = Math.max(0, 1 - (elapsed - (duration - 800)) / 800);
        }

        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rotation);
        ctx!.globalAlpha = p.opacity;
        ctx!.fillStyle = p.color;
        ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx!.restore();
      }

      frame = requestAnimationFrame(animate);
    }

    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      style={{ width: '100vw', height: '100vh' }}
      aria-hidden="true"
    />
  );
}
