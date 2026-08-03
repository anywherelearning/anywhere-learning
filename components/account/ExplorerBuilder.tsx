'use client';

import { useState } from 'react';
import type { KidAvatar } from '@/lib/kid-roadmap';
import {
  ExplorerHead,
  ExplorerFigure,
  ANIMAL_BASES,
  BODY_COLORS,
  HAIR_COLORS,
  HAIR_STYLES,
  SKIN_TONES,
} from '@/components/account/ExplorerAvatar';

const BASE_GROUPS = [
  { label: 'Kids', bases: ['girl', 'boy'] },
  { label: 'Forest animals', bases: [...ANIMAL_BASES] },
];

const BASE_LABEL: Record<string, string> = {
  girl: 'Girl', boy: 'Boy',
  fox: 'Fox', owl: 'Owl', bear: 'Bear', rabbit: 'Rabbit', deer: 'Deer', frog: 'Frog',
};

function isHuman(b: string) {
  return b === 'girl' || b === 'boy';
}

export default function ExplorerBuilder({
  kidName,
  initial,
  onSave,
  onCancel,
  bare = false,
  saveLabel = 'Save explorer',
}: {
  kidName: string;
  initial?: KidAvatar | null;
  onSave: (a: KidAvatar) => void;
  onCancel?: () => void;
  bare?: boolean;
  saveLabel?: string;
}) {
  const [base, setBase] = useState(initial?.base ?? 'girl');
  const [color, setColor] = useState(initial?.color ?? BODY_COLORS[1]);
  const [skin, setSkin] = useState(initial?.skin ?? SKIN_TONES[1]);
  const [hair, setHair] = useState(initial?.hair ?? HAIR_COLORS[0]);
  const [hairStyle, setHairStyle] = useState(initial?.hairStyle ?? 'ponytail');

  const av: KidAvatar = { base, color, skin, hair, hairStyle };
  const human = isHuman(base);

  return (
    <div style={bare ? {} : { background: 'var(--am-paper)', border: '1px solid rgba(50,40,20,0.1)', borderRadius: 22, padding: 'clamp(18px,3vw,26px)', boxShadow: '0 16px 40px -20px rgba(45,55,40,0.4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
        <span style={{ width: 130, height: 150, borderRadius: 18, flexShrink: 0, overflow: 'hidden', background: `linear-gradient(180deg, ${color}14, #fbfaf5)`, border: `1.5px solid ${color}55`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '10px 6px 0' }}>
          <ExplorerFigure avatar={av} fill />
        </span>
        <div>
          <h3 style={{ fontFamily: 'var(--font-plate),sans-serif', fontWeight: 800, letterSpacing: '-0.01em', fontSize: 26, color: 'var(--am-ink)', margin: 0, lineHeight: 1.1 }}>
            {kidName}'s explorer
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--am-muted)', margin: '6px 0 0', lineHeight: 1.45 }}>
            Starts with nothing but curiosity. Boots, a hat, a backpack and more get earned out on the trail.
          </p>
        </div>
      </div>

      {/* base */}
      {BASE_GROUPS.map((group) => (
        <div key={group.label} style={{ marginBottom: 13 }}>
          <div style={label}>{group.label}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {group.bases.map((b) => {
              const sel = b === base;
              return (
                <button
                  key={b}
                  onClick={() => setBase(b)}
                  title={BASE_LABEL[b]}
                  style={{
                    display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                    width: 62, padding: '8px 4px 5px', borderRadius: 13, cursor: 'pointer',
                    background: sel ? `${color}18` : '#faf9f6',
                    border: `2px solid ${sel ? color : 'rgba(61,92,59,0.14)'}`,
                    transition: 'all 150ms ease',
                  }}
                >
                  <span style={{ width: 34, height: 34, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ExplorerHead avatar={{ base: b, color: sel ? color : '#a3a199', skin, hair, hairStyle: b === 'girl' ? 'ponytail' : b === 'boy' ? 'short' : hairStyle }} size={30} />
                  </span>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: sel ? '#2f4a2e' : '#8a877e' }}>{BASE_LABEL[b]}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* human options */}
      {human && (
        <>
          <Row title="Skin">
            {SKIN_TONES.map((s) => (
              <Swatch key={s} color={s} selected={s === skin} onClick={() => setSkin(s)} />
            ))}
          </Row>
          <Row title="Hair">
            {HAIR_COLORS.map((h) => (
              <Swatch key={h} color={h} selected={h === hair} onClick={() => setHair(h)} />
            ))}
          </Row>
          <Row title="Hairstyle">
            {HAIR_STYLES.map((hs) => {
              const sel = hs === hairStyle;
              return (
                <button
                  key={hs}
                  onClick={() => setHairStyle(hs)}
                  style={{
                    padding: '6px 13px', borderRadius: 9999, cursor: 'pointer', fontSize: 12.5, fontWeight: 600,
                    background: sel ? color : '#fffdf9', color: sel ? '#faf9f6' : '#54524b',
                    border: `1.5px solid ${sel ? color : 'rgba(61,92,59,0.2)'}`, textTransform: 'capitalize',
                  }}
                >
                  {hs}
                </button>
              );
            })}
          </Row>
        </>
      )}

      {/* colour (shirt for humans, body for others) */}
      <Row title={human ? 'Shirt' : 'Colour'}>
        {BODY_COLORS.map((c) => (
          <Swatch key={c} color={c} selected={c === color} onClick={() => setColor(c)} big />
        ))}
      </Row>

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button onClick={() => onSave(av)} className="hover:brightness-95" style={{ flex: 1, padding: 14, fontSize: 15, fontWeight: 600, color: '#faf9f6', background: '#588157', border: 'none', borderRadius: 14, cursor: 'pointer' }}>
          {saveLabel}
        </button>
        {onCancel && (
          <button onClick={onCancel} className="hover:brightness-95" style={{ padding: '14px 18px', fontSize: 14, fontWeight: 600, color: '#588157', background: 'transparent', border: '1px solid rgba(61,92,59,0.16)', borderRadius: 14, cursor: 'pointer' }}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={label}>{title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>{children}</div>
    </div>
  );
}

function Swatch({ color, selected, onClick, big }: { color: string; selected: boolean; onClick: () => void; big?: boolean }) {
  const d = big ? 34 : 30;
  return (
    <button
      onClick={onClick}
      aria-label={`Colour ${color}`}
      style={{
        width: d, height: d, borderRadius: '50%', cursor: 'pointer', background: color,
        border: '3px solid var(--am-paper)',
        boxShadow: selected ? `0 0 0 3px ${color}` : '0 0 0 1.5px rgba(61,92,59,0.2)',
        transition: 'box-shadow 150ms ease',
      }}
    />
  );
}

const label: React.CSSProperties = { fontFamily: 'var(--font-catalog),monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--am-gold)', marginBottom: 8 };
