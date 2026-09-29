'use client';

/**
 * In-app PDF reader. Renders every page of a guide onto <canvas> elements
 * via pdf.js, fetching the bytes from the same-origin streaming endpoint
 * (/api/view/activity/[slug]) so the Blob URL is never exposed.
 *
 * Why this exists: trial members can read everything but download nothing.
 * The browser's built-in PDF viewer ships its own download button, which
 * would turn every "view" into a free download. Canvas rendering removes that
 * one-click hole (screenshots remain possible; this is a speed bump, not DRM).
 *
 * For trial members the Download button opens the upgrade-to-download modal.
 * Members and starters download normally.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import TrialCapModal from '@/components/account/TrialCapModal';
import AddToWeekButton from '@/components/account/AddToWeekButton';
import WeDidIt from '@/components/account/ReaderActions';
import { effortFor } from '@/lib/activity-effort';
import { minsLabel } from '@/lib/activity-visuals';
import { areaMetaForSlug } from '@/lib/roadmap';

interface Props {
  slug: string;
  title: string;
  tier: 'member' | 'trial';
  trialEndsAt?: string | null;
  priceLabel?: string;
  isFounder?: boolean;
  /** Cover image, for the guide card beside the pages. */
  imageUrl?: string | null;
  ageRange?: string | null;
}

export default function PdfViewer({
  slug,
  title,
  tier,
  trialEndsAt,
  priceLabel,
  isFounder,
  imageUrl,
  ageRange,
}: Props) {
  const thumbsRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(1);
  const effort = effortFor(slug);
  const area = areaMetaForSlug(slug)[0];
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [pageCount, setPageCount] = useState(0);
  const [capModalOpen, setCapModalOpen] = useState(false);

  const downloadHref = `/api/download/activity/${slug}`;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url,
        ).toString();

        const doc = await pdfjs.getDocument({ url: `/api/view/activity/${slug}` }).promise;
        if (cancelled) return;
        setPageCount(doc.numPages);

        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = '';

        // Render at 2x the container width for crisp text on retina, capped
        // so huge PDFs don't allocate absurd canvases.
        const cssWidth = Math.min(container.clientWidth, 780);
        const thumbs = thumbsRef.current;
        if (thumbs) thumbs.innerHTML = '';

        for (let i = 1; i <= doc.numPages; i++) {
          if (cancelled) return;
          const page = await doc.getPage(i);
          const baseViewport = page.getViewport({ scale: 1 });
          const scale = (cssWidth / baseViewport.width) * Math.min(window.devicePixelRatio || 1, 2);
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = `${cssWidth}px`;
          canvas.style.height = `${(cssWidth * viewport.height) / viewport.width}px`;
          canvas.className = 'rd-page';
          canvas.id = `page-${i}`;
          canvas.dataset.page = String(i);
          container.appendChild(canvas);

          const ctx = canvas.getContext('2d');
          if (!ctx) continue;
          await page.render({ canvas, canvasContext: ctx, viewport }).promise;

          // a small copy of the page for the page grid in the rail
          if (thumbs) {
            const tw = 120;
            const t = document.createElement('canvas');
            t.width = tw;
            t.height = Math.round((tw * viewport.height) / viewport.width);
            t.getContext('2d')?.drawImage(canvas, 0, 0, t.width, t.height);
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'rd-thumb';
            b.dataset.page = String(i);
            b.setAttribute('aria-label', `Go to page ${i}`);
            b.appendChild(t);
            const n = document.createElement('span');
            n.textContent = String(i);
            b.appendChild(n);
            b.onclick = () => document.getElementById(`page-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            thumbs.appendChild(b);
          }
        }
        if (!cancelled) setState('ready');
      } catch (err) {
        console.error('[viewer] failed to render PDF:', err);
        if (!cancelled) setState('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Track the page in view, to highlight it in the page grid.
  useEffect(() => {
    if (state !== 'ready' || !containerRef.current) return;
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (vis) setCurrent(Number((vis.target as HTMLElement).dataset.page));
    }, { threshold: [0.25, 0.5, 0.75] });
    containerRef.current.querySelectorAll('canvas').forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [state]);
  useEffect(() => {
    thumbsRef.current?.querySelectorAll<HTMLElement>('.rd-thumb').forEach((b) => b.toggleAttribute('data-on', Number(b.dataset.page) === current));
  }, [current, state]);

  function handleDownloadClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (tier !== 'trial') return; // members: plain navigation
    e.preventDefault();
    setCapModalOpen(true);
  }

  return (
    <main className="rd" style={{ background: 'linear-gradient(180deg,var(--am-bg1),var(--am-bg2))', minHeight: '100vh', color: 'var(--am-ink)' }}>
      <style>{`
        .rd-wrap{max-width:1200px;margin:0 auto;padding:clamp(14px,2.5vw,26px) clamp(12px,3vw,28px) 60px;display:grid;gap:22px}
        @media (min-width:960px){.rd-wrap{grid-template-columns:290px minmax(0,1fr);gap:34px;align-items:start}.rd-rail{position:sticky;top:16px;max-height:calc(100vh - 32px);overflow:auto;padding-bottom:10px}}
        .rd-back{display:inline-flex;align-items:center;gap:6px;font-size:13.5px;color:var(--am-muted);text-decoration:none}
        .rd-back:hover{color:#3d5c3b}
        .rd-card{background:#fffdf8;border-radius:20px;box-shadow:0 1px 0 rgba(58,44,23,.06),0 22px 44px -26px rgba(58,44,23,.5);padding:18px;margin-top:12px}
        .rd-cover{flex:none;width:66px;aspect-ratio:4/5;border-radius:6px;overflow:hidden;border:3px solid #fff;box-shadow:0 8px 16px -8px rgba(50,40,20,.5);transform:rotate(-3deg)}
        .rd-cover img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}
        .rd-kick{font-family:var(--font-catalog),monospace;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--am-trail)}
        .rd-title{font-family:var(--font-plate),sans-serif;font-weight:800;font-size:19px;line-height:1.15;margin:4px 0 0;letter-spacing:-.01em}
        .rd-meta{font-size:13px;color:var(--am-muted);margin:12px 0 14px}
        .rd-actions{display:grid;gap:8px}
        @media (max-width:959px){.rd-actions{grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.rd-actions .rd-btn,.rd-trail>div>button{padding:10px 6px!important;font-size:12.5px!important;gap:4px!important}.rd-actions svg{display:none}.rd-meta{margin:10px 0 12px}.rd-menu{min-width:170px}.rd-card{padding:14px}}
        .rd-btn{display:flex;width:100%;align-items:center;justify-content:center;gap:7px;padding:11px 14px;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;text-decoration:none;border:none;transition:filter .15s,background .15s}
        .rd-btn:hover{filter:brightness(.97)}
        .rd-btn-main{background:#588157;color:#fff}
        .rd-btn-ghost{background:#fff;color:#3d5c3b;border:1.5px solid rgba(61,92,59,.25)}
        .rd-btn-ghost:hover{background:#eef2e8}
        .rd-trail>div>button{display:flex!important;width:100%!important;justify-content:center;padding:11px 14px!important;border-radius:12px!important;background:#588157!important;color:#fff!important;font-size:14px!important}
        .rd-menu{position:absolute;left:0;right:0;top:calc(100% + 6px);z-index:30;background:#fffdf8;border:1px solid rgba(58,44,23,.14);border-radius:12px;box-shadow:0 18px 36px -16px rgba(45,58,46,.4);padding:6px}
        .rd-menu button{display:block;width:100%;text-align:left;padding:9px 11px;border:none;background:none;border-radius:8px;font-size:13.5px;cursor:pointer;color:var(--am-ink)}
        .rd-menu button:hover{background:#eef2e8}
        .rd-done{display:flex;flex-direction:column;gap:3px;align-items:center;padding:10px;border-radius:12px;background:#e6ecdf;color:#3d5c3b;font-size:14px}
        .rd-done a{font-size:12.5px;font-weight:700;color:#588157;text-decoration:none}
        .rd-short{display:none}@media (max-width:959px){.rd-long{display:none}.rd-short{display:inline}}
        .rd-grid-h{font-family:var(--font-catalog),monospace;font-size:10.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--am-muted);margin:20px 0 10px}
        .rd-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
        @media (max-width:959px){.rd-grid{display:flex;overflow-x:auto;padding-bottom:6px}.rd-grid .rd-thumb{flex:none;width:56px}}
        .rd-thumb{position:relative;padding:0;border:none;background:#fff;border-radius:4px;cursor:pointer;box-shadow:0 4px 10px -6px rgba(58,44,23,.5);outline:2px solid transparent;outline-offset:2px;transition:outline-color .15s,transform .15s}
        .rd-thumb:hover{transform:translateY(-2px)}
        .rd-thumb[data-on]{outline-color:#d0684a}
        .rd-thumb canvas{display:block;width:100%;height:auto;border-radius:4px}
        .rd-thumb span{position:absolute;right:3px;bottom:3px;font-size:9.5px;font-weight:700;background:rgba(255,253,248,.92);border-radius:4px;padding:0 4px;color:var(--am-muted)}
        .rd-pages{min-width:0}
        .rd-page{display:block;margin:0 auto 24px;border-radius:8px;background:#fff;box-shadow:0 1px 0 rgba(58,44,23,.06),0 22px 44px -26px rgba(58,44,23,.5);max-width:100%;height:auto!important;scroll-margin-top:16px}
      `}</style>

      <div className="rd-wrap">
        <aside className="rd-rail">
          <Link href="/account" className="rd-back"><span aria-hidden="true">&larr;</span> Back to the Library</Link>
          <div className="rd-card">
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              {imageUrl && (
                <span className="rd-cover">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="" />
                </span>
              )}
              <div style={{ minWidth: 0 }}>
                {area && <div className="rd-kick">{area.name}</div>}
                <h1 className="rd-title">{title}</h1>
              </div>
            </div>
            <div className="rd-meta">
              {[ageRange, effort ? minsLabel(effort) : null, pageCount ? `${pageCount} pages` : null].filter(Boolean).join(' · ')}
            </div>
            <div className="rd-actions">
              {effort && <div className="rd-trail"><AddToWeekButton slug={slug} title={title} variant="text" /></div>}
              {effort && <WeDidIt slug={slug} />}
              <a href={downloadHref} onClick={handleDownloadClick} className="rd-btn rd-btn-ghost">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M5 21h14" /></svg>
                {tier === 'trial' ? <><span className="rd-long">Download with membership</span><span className="rd-short">Download</span></> : 'Download'}
              </a>
            </div>
          </div>
          <div className="rd-grid-h" style={{ display: pageCount > 1 ? undefined : 'none' }}>Pages</div>
          <div className="rd-grid" ref={thumbsRef} />
        </aside>

        <div className="rd-pages">
          {state === 'loading' && (
            <p className="text-center font-body text-[14.5px] text-gray-500 py-16">Opening {title}&hellip;</p>
          )}
          {state === 'error' && (
            <div className="text-center py-16">
              <p className="font-body text-[15px] text-gray-600">This guide didn&apos;t load. Give it another try, or head back to your library.</p>
              <Link href="/account" className="mt-4 inline-flex items-center gap-2 bg-forest text-cream font-body font-semibold text-[14px] py-2.5 px-5 rounded-xl no-underline hover:bg-forest-dark transition-colors">Back to library</Link>
            </div>
          )}
          <div ref={containerRef} />
        </div>
      </div>

      <TrialCapModal
        open={capModalOpen}
        onClose={() => setCapModalOpen(false)}
        trialEndsAt={trialEndsAt}
        priceLabel={priceLabel}
        isFounder={isFounder}
      />
    </main>
  );
}
