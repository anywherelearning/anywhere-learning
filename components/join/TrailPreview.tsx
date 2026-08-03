'use client';

import { ExplorerFigure } from '@/components/account/ExplorerAvatar';

/**
 * A marketing "peek inside the member zone" visual, built from the real
 * ExplorerFigure art (not a screenshot) so it stays in sync with the product.
 * A mini Adventure Map trail with two explorers and the kind of next-stop card
 * a member actually sees, so the sales page carries the member-zone theme.
 */

const KID_A = { base: 'girl', color: '#588157', skin: '#e5b48f', hair: '#3b2f27', hairStyle: 'ponytail' };
const KID_B = { base: 'boy', color: '#c4836a', skin: '#c98d5f', hair: '#1c1917', hairStyle: 'short' };

export default function TrailPreview() {
  return (
    <div className="tp">
      <svg className="tp-bg" viewBox="0 0 800 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="tpSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d7e7e7" />
            <stop offset="1" stopColor="#e6efe4" />
          </linearGradient>
          <linearGradient id="tpHill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#dccb9f" />
            <stop offset="1" stopColor="#cfc191" />
          </linearGradient>
          <linearGradient id="tpMead" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#93ac7a" />
            <stop offset="1" stopColor="#7f9c6c" />
          </linearGradient>
          <radialGradient id="tpSun" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#f6df9a" stopOpacity="0.95" />
            <stop offset="0.6" stopColor="#f2d27f" stopOpacity="0.5" />
            <stop offset="1" stopColor="#f2d27f" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="800" height="520" fill="url(#tpSky)" />
        <circle cx="650" cy="120" r="120" fill="url(#tpSun)" />
        <path d="M0 210 Q210 160 420 205 Q620 245 800 200 L800 520 L0 520 Z" fill="url(#tpHill)" />
        <path d="M0 300 Q230 250 470 300 Q650 340 800 300 L800 520 L0 520 Z" fill="url(#tpMead)" />
        {/* winding trail */}
        <path d="M120 470 C 250 430, 250 360, 400 340 C 540 322, 560 260, 690 250" fill="none" stroke="#c07a4a" strokeWidth="9" strokeLinecap="round" strokeDasharray="2 24" opacity="0.85" />
        {/* trees */}
        {[[95, 360], [720, 360], [560, 400], [180, 300]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <ellipse cx="0" cy="30" rx="16" ry="5" fill="rgba(40,45,30,.14)" />
            <path d="M0 -34 L20 26 L-20 26 Z" fill="#6f8a5a" />
            <rect x="-3" y="26" width="6" height="12" rx="2" fill="#7a5a3a" />
          </g>
        ))}
      </svg>

      {/* Explorers on the trail */}
      <div className="tp-here">You are here</div>
      <div className="tp-fig tp-fig-a">
        <ExplorerFigure avatar={KID_A} gear={['big:backpack', 'big:hiking-boots', 'everyday:sun-hat']} fill />
      </div>
      <div className="tp-fig tp-fig-b">
        <ExplorerFigure avatar={KID_B} gear={['big:backpack']} fill />
      </div>

      {/* Next-stop card */}
      <div className="tp-card">
        <div className="tp-card-head">
          <span>Next stop · together</span>
          <span aria-hidden="true">●</span>
        </div>
        <div className="tp-card-title">Plan the family grocery run</div>
        <div className="tp-card-meta">Real-World Math · Under an hour</div>
        <div className="tp-card-btn">Open the guide →</div>
      </div>

      <style>{`
        .tp{position:relative;width:100%;aspect-ratio:8/5.2;border-radius:22px;overflow:hidden;
          border:1px solid rgba(61,92,59,.16);box-shadow:0 30px 60px -30px rgba(45,58,46,.45);
          font-family:'DM Sans',system-ui,sans-serif}
        .tp-bg{position:absolute;inset:0;width:100%;height:100%}
        .tp-here{position:absolute;left:5%;bottom:47%;z-index:5;white-space:nowrap;
          font-family:'JetBrains Mono',ui-monospace,monospace;
          font-size:11px;letter-spacing:.02em;color:#3d3527;background:rgba(247,242,232,.9);
          backdrop-filter:blur(4px);padding:5px 11px;border-radius:20px;border:1px solid rgba(255,255,255,.6);
          box-shadow:0 6px 14px -8px rgba(50,40,20,.5)}
        .tp-fig{position:absolute;bottom:5%;z-index:2;filter:drop-shadow(0 10px 12px rgba(40,45,30,.28))}
        .tp-fig-a{left:5%;width:20%}
        .tp-fig-b{left:17%;width:17%;bottom:4%;opacity:.98}
        .tp-card{position:absolute;right:4.5%;top:12%;width:44%;max-width:290px;background:rgba(252,250,244,.9);
          backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.65);
          border-radius:16px;padding:15px 16px 16px;box-shadow:0 18px 34px -18px rgba(45,55,40,.5)}
        .tp-card-head{display:flex;align-items:center;justify-content:space-between;
          font-family:'JetBrains Mono',ui-monospace,monospace;font-size:9.5px;letter-spacing:.08em;
          text-transform:uppercase;color:#c07a4a;margin-bottom:7px}
        .tp-card-title{font-family:var(--font-plate),'DM Sans',sans-serif;font-weight:800;
          font-size:clamp(15px,2.2vw,19px);line-height:1.14;color:#32302a;letter-spacing:-.01em}
        .tp-card-meta{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:9.5px;
          letter-spacing:.05em;text-transform:uppercase;color:#588157;margin:7px 0 12px}
        .tp-card-btn{display:inline-block;background:#588157;color:#faf9f6;font-weight:600;
          font-size:12.5px;padding:9px 15px;border-radius:10px}
        @media (max-width:520px){
          .tp-card{width:52%;padding:12px}
          .tp-fig-a{width:24%}
          .tp-fig-b{width:20%}
        }
      `}</style>
    </div>
  );
}
