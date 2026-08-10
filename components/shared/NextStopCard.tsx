/**
 * The member zone's next-stop signpost, as a standalone card.
 *
 * Markup and styles are lifted verbatim from the signpost in
 * components/account/AdventureMapHome.tsx (the `am-signpost` block) so the
 * homepage shows the real card rather than a lookalike. It's presentational
 * only: no data fetching, no handlers, so it can render anywhere.
 *
 * The `--am-*` tokens it uses are global (app/globals.css), but the `am-*`
 * class rules live inside AdventureMapHome's own <style> block, so the ones
 * this card needs are repeated below. That's a copy, and copies drift: if the
 * signpost is restyled in the member zone, this needs the same edit. The fix is
 * for AdventureMapHome to render this component instead of its own markup,
 * which is worth doing but not while that file is being edited elsewhere.
 */
export interface NextStopActivity {
  title: string;
  /** Skills Map area plus effort, e.g. "Real-World Math · Multi-day". */
  meta: string;
  blurb: string;
}

export default function NextStopCard({
  activity,
  head = 'Next stop',
  showSwap = true,
  compact = false,
  className = '',
}: {
  activity: NextStopActivity;
  head?: string;
  /** The engine's pick can be swapped; a family's own pick can't. */
  showSwap?: boolean;
  /**
   * Trims the type and padding for small panels. The member zone gives this
   * card a 350px column; the homepage demo has about 280, and at full size a
   * two-line title plus a three-line blurb runs off the top and bottom.
   */
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={`nsc am-glass ${compact ? 'nsc-compact' : ''} ${className}`}>
      <div className="am-sign-head">
        <span>{head}</span>
        <span>●</span>
      </div>
      <div className="am-sign-body">
        <h3 className="nsc-title">{activity.title}</h3>
        <div className="nsc-meta">{activity.meta}</div>
        <p className="nsc-blurb">{activity.blurb}</p>
        <div className="nsc-actions">
          <span className="am-btn am-btn-primary">Open the guide →</span>
          <span className="am-btn am-btn-ghost">✓ We reached it</span>
          {showSwap && (
            <div className="am-sub-actions">
              <button type="button" tabIndex={-1}>
                Different one
              </button>
              <span aria-hidden="true">·</span>
              <button type="button" tabIndex={-1}>
                Skip this area
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .nsc{border-radius:18px;overflow:hidden}
        .am-glass{background:rgba(247,242,232,.62);backdrop-filter:blur(12px) saturate(1.1);-webkit-backdrop-filter:blur(12px) saturate(1.1);border:1px solid rgba(255,255,255,.55);box-shadow:0 10px 30px -14px rgba(50,40,20,.4)}
        .am-sign-head{padding:10px 16px;font-family:var(--font-catalog),monospace;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--am-trail);display:flex;justify-content:space-between;align-items:center}
        .am-sign-body{padding:2px 18px 18px}
        .nsc-title{font-family:var(--font-plate),sans-serif;font-size:clamp(18px,2.1vw,22px);font-weight:700;line-height:1.12;margin:0;color:var(--am-ink)}
        .nsc-meta{font-family:var(--font-catalog),monospace;font-size:10.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--am-trail);margin:7px 0 0}
        .nsc-blurb{font-size:12.5px;color:var(--am-muted);margin:6px 0 13px;line-height:1.45}
        .nsc-actions{display:flex;flex-direction:column;gap:8px}
        .am-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;width:100%;border:none;border-radius:12px;padding:13px 16px;font-weight:700;font-size:14px;text-decoration:none}
        .am-btn-primary{background:var(--am-flag);color:#fff;box-shadow:0 10px 22px -10px rgba(208,104,74,.8)}
        .am-btn-ghost{background:rgba(255,255,255,.4);color:var(--am-ink);border:1px solid rgba(50,40,20,.16)}
        .am-sub-actions{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:3px}
        .am-sub-actions button{background:none;border:none;font-family:var(--font-catalog),monospace;font-size:11.5px;color:var(--am-muted);padding:4px;text-decoration:underline;text-underline-offset:2px}
        .am-sub-actions span{color:var(--am-muted);opacity:.5}

        /* Compact: same card, sized for a narrow panel. The blurb clamps to two
           lines so a long one can't push the buttons out of frame. */
        .nsc-compact .am-sign-head{padding:7px 13px;font-size:9.5px}
        .nsc-compact .am-sign-body{padding:0 14px 13px}
        .nsc-compact .nsc-title{font-size:16px}
        .nsc-compact .nsc-meta{font-size:9px;margin-top:5px}
        .nsc-compact .nsc-blurb{font-size:11px;margin:5px 0 10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .nsc-compact .nsc-actions{gap:6px}
        .nsc-compact .am-btn{padding:9px 12px;font-size:12px;border-radius:10px}
        .nsc-compact .am-sub-actions{gap:8px;margin-top:1px}
        .nsc-compact .am-sub-actions button{font-size:10px;padding:2px;white-space:nowrap}
      `}</style>
    </div>
  );
}
