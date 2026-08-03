'use client';

import { ExplorerFigure } from '@/components/account/ExplorerAvatar';

/**
 * The hero "peek inside the member zone" visual, portrait (4:5) to sit in the
 * hero's right slot. Built from the real ExplorerFigure art (not a screenshot)
 * so it stays in sync with the product: a mini Adventure Map trail with two
 * geared explorers, a "You are here" pin, and a small progress chip. The page
 * overlays the founder-rate sticker on top.
 */

const KID_A = { base: 'girl', color: '#588157', skin: '#e5b48f', hair: '#3b2f27', hairStyle: 'ponytail' };
const KID_B = { base: 'boy', color: '#c4836a', skin: '#c98d5f', hair: '#1c1917', hairStyle: 'short' };

export default function HeroTrail() {
  return (
    <div className="ht">
      <svg className="ht-bg" viewBox="0 0 440 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="htSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d7e7e7" />
            <stop offset="1" stopColor="#e6efe4" />
          </linearGradient>
          <linearGradient id="htHill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#dccb9f" />
            <stop offset="1" stopColor="#cfc191" />
          </linearGradient>
          <linearGradient id="htMead" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#93ac7a" />
            <stop offset="1" stopColor="#7f9c6c" />
          </linearGradient>
          <radialGradient id="htSun" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#f6df9a" stopOpacity="0.95" />
            <stop offset="0.6" stopColor="#f2d27f" stopOpacity="0.45" />
            <stop offset="1" stopColor="#f2d27f" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="440" height="560" fill="url(#htSky)" />
        <circle cx="288" cy="132" r="106" fill="url(#htSun)" />
        <path d="M0 225 Q140 185 285 220 Q380 244 440 214 L440 560 L0 560 Z" fill="url(#htHill)" />
        <path d="M0 330 Q150 292 300 330 Q385 352 440 322 L440 560 L0 560 Z" fill="url(#htMead)" />
        {/* winding trail from the explorers up into the hills */}
        <path d="M205 540 C 262 475, 172 442, 250 392 C 322 345, 300 292, 372 250" fill="none" stroke="#c07a4a" strokeWidth="8" strokeLinecap="round" strokeDasharray="2 22" opacity="0.85" />
        {/* trees */}
        {[[58, 360], [388, 352], [330, 418], [150, 316]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <ellipse cx="0" cy="28" rx="15" ry="5" fill="rgba(40,45,30,.14)" />
            <path d="M0 -32 L18 24 L-18 24 Z" fill="#6f8a5a" />
            <rect x="-3" y="24" width="6" height="11" rx="2" fill="#7a5a3a" />
          </g>
        ))}
      </svg>

      <div className="ht-here">You are here</div>
      <div className="ht-fig ht-fig-a">
        <ExplorerFigure avatar={KID_A} gear={['big:backpack', 'big:hiking-boots', 'everyday:sun-hat']} fill />
      </div>
      <div className="ht-fig ht-fig-b">
        <ExplorerFigure avatar={KID_B} gear={['big:backpack']} fill />
      </div>

      <div className="ht-chip">
        <span className="ht-chip-label">Leg 1 · Forest Valley</span>
        <span className="ht-dots" aria-hidden="true">
          <i className="on" />
          <i className="on" />
          <i />
          <i />
        </span>
      </div>

      <style>{`
        .ht{position:absolute;inset:0;font-family:'DM Sans',system-ui,sans-serif}
        .ht-bg{position:absolute;inset:0;width:100%;height:100%}
        .ht-here{position:absolute;left:22%;bottom:46%;z-index:5;white-space:nowrap;
          font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10.5px;letter-spacing:.02em;
          color:#3d3527;background:rgba(247,242,232,.9);backdrop-filter:blur(4px);
          padding:4px 10px;border-radius:20px;border:1px solid rgba(255,255,255,.6);
          box-shadow:0 6px 14px -8px rgba(50,40,20,.5)}
        .ht-fig{position:absolute;bottom:5%;z-index:2;filter:drop-shadow(0 10px 12px rgba(40,45,30,.28))}
        .ht-fig-a{left:23%;width:33%}
        .ht-fig-b{left:47%;width:28%;bottom:4%}
        .ht-chip{position:absolute;left:6%;top:6%;z-index:4;display:flex;flex-direction:column;gap:5px;
          background:rgba(252,250,244,.86);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.6);
          border-radius:12px;padding:8px 11px;box-shadow:0 12px 24px -14px rgba(45,55,40,.5)}
        .ht-chip-label{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:9.5px;
          letter-spacing:.05em;text-transform:uppercase;color:#3d5c3b;white-space:nowrap}
        .ht-dots{display:flex;gap:4px}
        .ht-dots i{width:6px;height:6px;border-radius:50%;background:rgba(61,92,59,.25)}
        .ht-dots i.on{background:#588157}
      `}</style>
    </div>
  );
}
