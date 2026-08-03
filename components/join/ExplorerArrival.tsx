'use client';

import { ExplorerFigure } from '@/components/account/ExplorerAvatar';

/**
 * A small "you made it" vignette for the final CTA: the two hero explorers,
 * now reaching a summit flag. Bookends the page (they set out in the hero
 * trail, they arrive here). Real ExplorerFigure art, so it stays in sync.
 */

const A = { base: 'girl', color: '#588157', skin: '#e5b48f', hair: '#3b2f27', hairStyle: 'ponytail' };
const B = { base: 'boy', color: '#c4836a', skin: '#c98d5f', hair: '#1c1917', hairStyle: 'short' };

export default function ExplorerArrival() {
  return (
    <div className="ea" aria-hidden="true">
      <span className="ea-flag">
        <svg width="34" height="52" viewBox="0 0 34 52" fill="none">
          <ellipse cx="15" cy="48" rx="15" ry="4" fill="rgba(40,45,30,.14)" />
          <path d="M8 50 L8 6" stroke="#7a5a3a" strokeWidth="3" strokeLinecap="round" />
          <path d="M8 8 L30 15 L8 22 Z" fill="#c07a4a" />
        </svg>
      </span>
      <span className="ea-fig ea-a">
        <ExplorerFigure avatar={A} gear={['big:backpack', 'everyday:sun-hat']} fill />
      </span>
      <span className="ea-fig ea-b">
        <ExplorerFigure avatar={B} gear={['big:backpack']} fill />
      </span>
      <style>{`
        .ea{position:relative;width:168px;height:104px;margin:0 auto}
        .ea-flag{position:absolute;left:50%;bottom:2px;transform:translateX(-50%);z-index:1}
        .ea-fig{position:absolute;bottom:0;z-index:2;filter:drop-shadow(0 8px 10px rgba(40,45,30,.24))}
        .ea-a{left:2px;width:66px}
        .ea-b{right:2px;width:58px}
      `}</style>
    </div>
  );
}
